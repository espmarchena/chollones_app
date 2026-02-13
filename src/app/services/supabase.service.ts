import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences'; // <--- Import correcto aquí arriba

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  
  // BehaviorSubject para estado reactivo del usuario
  private _currentUser = new BehaviorSubject<User | null>(null);

  constructor() {
    // 1. INICIALIZACIÓN CON PERSISTENCIA NATIVA
    // Usamos Preferences para que la sesión dure en Android/iOS aunque cierres la app
    this.supabase = createClient(
      'https://bgifebyzxnvpghljmiad.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnaWZlYnl6eG52cGdobGptaWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3Njc0NDcsImV4cCI6MjA4NjM0MzQ0N30.OaMa9RRjHhH23iW34u8Py47UludSZsij8R02Vz-HAIc',
      {
        auth: {
          storage: {
            // Adaptador para usar Capacitor Preferences en lugar de localStorage
            getItem: async (key) => {
              const { value } = await Preferences.get({ key });
              return value;
            },
            setItem: async (key, value) => {
              await Preferences.set({ key, value });
            },
            removeItem: async (key) => {
              await Preferences.remove({ key });
            },
          },
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      }
    );

    // 2. RECUPERAR SESIÓN INICIAL
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        this._currentUser.next(session.user);
      }
    });

    // 3. ESCUCHAR CAMBIOS (Login/Logout)
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        this._currentUser.next(session.user);
      } else {
        this._currentUser.next(null);
      }
    });
  }

  // Getter para los Guards
  get currentUser$(): Observable<User | null> {
    return this._currentUser.asObservable();
  }

  // --- MÉTODOS DE AUTH ---

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }

  // --- LÓGICA DE USUARIO HÍBRIDA (Invitado vs Registrado) ---

  private getUserId(): string {
    // A) Si hay usuario logueado, usar su ID real
    const loggedUser = this._currentUser.getValue();
    if (loggedUser) {
      return loggedUser.id;
    }

    // B) Si es invitado, usar ID temporal
    let userId = localStorage.getItem('app_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('app_user_id', userId);
    }
    return userId;
  }

  // --- MÉTODOS DE DATOS ---

  async getChollos() {
    const { data, error } = await this.supabase
      .from('chollos')
      .select(`
        *,
        proveedores ( nombre )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async guardarCholloFavorito(cholloId: string) {
    const userId = this.getUserId();
    console.log('Guardando favorito para usuario:', userId);

    const { data, error } = await this.supabase
      .from('guardados')
      .insert({
        chollo_id: cholloId,
        usuario_temp_id: userId 
      })
      .select();

    if (error) throw error;
    return data;
  }

  async eliminarCholloFavorito(cholloId: string) {
    const userId = this.getUserId();
    console.log('Eliminando favorito:', cholloId, 'usuario:', userId);

    const { data, count, error } = await this.supabase
      .from('guardados')
      .delete({ count: 'exact' })
      .eq('chollo_id', cholloId)
      .eq('usuario_temp_id', userId)
      .select();

    if (error) {
      console.error('Error al eliminar:', error);
      throw error;
    }

    if (count && count > 0) {
      console.log('Eliminado exitoso.');
    }
  }

  async getChollosGuardados() {
    const userId = this.getUserId();

    const { data, error } = await this.supabase
      .from('guardados')
      .select('*, chollos(*, proveedores(*))')
      .eq('usuario_temp_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getFavoritosIds(): Promise<string[]> {
    const userId = this.getUserId();

    const { data, error } = await this.supabase
      .from('guardados')
      .select('chollo_id')
      .eq('usuario_temp_id', userId);

    if (error) throw error;
    return (data || []).map((item: any) => item.chollo_id);
  }
}