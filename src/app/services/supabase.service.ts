import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  public supabase: SupabaseClient;

  // Fuente de verdad del estado del usuario
  private currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUser.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        storage: {
          getItem: async (key: string) => (await Preferences.get({ key })).value,
          setItem: async (key: string, value: string) => await Preferences.set({ key, value }),
          removeItem: async (key: string) => await Preferences.remove({ key }),
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storageKey: 'chollones-auth-token',
        lock: null as any, // Mantenemos el fix del lock
      },
    });

    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Cambio en Auth Supabase:', event);
      this.currentUser.next(session?.user ?? null);
    });
  }

  public get client(): SupabaseClient {
    return this.supabase;
  }

  get userValue() {
    return this.currentUser.value;
  }

  async login(email: string, pass: string) {
    return await this.supabase.auth.signInWithPassword({ email, password: pass });
  }

  async registro(email: string, pass: string, nombre: string) {
    return await this.supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { full_name: nombre } },
    });
  }

  async logout() {
    try {
      await this.supabase.auth.signOut();
      this.currentUser.next(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  // --- MÉTODOS BLINDADOS (CORREGIDOS) ---

  async getChollosGuardados() {
    const user = this.userValue;
    if (!user) return [];

    try {
      const response = await this.supabase
        .from('favoritos')
        .select(`
          id,
          chollos (
            id, titulo, precio_actual, precio_original, imagen_url,
            proveedores ( nombre )
          )
        `)
        .eq('usuario_id', user.id);

      // BLINDAJE: Si response es null/undefined, devolvemos array vacío
      if (!response) return [];
      
      // Acceso seguro a data
      const data = (response as any).data || [];
      return data;
    } catch (error) {
      return [];
    }
  }

  async getChollos(): Promise<any[]> {
    try {
      const response = await this.supabase
        .from('chollos')
        .select('*, proveedores(nombre)')
        .order('created_at', { ascending: false });

      // BLINDAJE: Verificamos antes de intentar leer nada
      if (!response) {
        console.warn('Supabase no respondió');
        return [];
      }

      // NO usamos desestructuración { data } para evitar el crash
      const data = (response as any).data;
      
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Error recuperado en getChollos:", err);
      return [];
    }
  }

  async getFavoritosIds() {
    const user = this.getUserActual();
    if (!user) return [];

    try {
      const response = await this.supabase
        .from('favoritos')
        .select('chollo_id')
        .eq('usuario_id', user.id);

      if (!response) return [];

      const data = (response as any).data || [];
      return data.map((f: any) => f.chollo_id);
    } catch (error) {
      return [];
    }
  }

  async guardarCholloFavorito(cholloId: string) {
    const user = this.getUserActual();
    if (!user) throw new Error('Debes estar logueado');

    // Usamos .then() o verificamos la respuesta para no bloquear
    try {
      await this.supabase
        .from('favoritos')
        .insert({ usuario_id: user.id, chollo_id: cholloId });
    } catch (e) {
      console.error("Error al guardar favorito", e);
    }
  }

  async eliminarCholloFavorito(cholloId: string) {
    const user = this.getUserActual();
    if (!user) return;

    try {
      await this.supabase
        .from('favoritos')
        .delete()
        .eq('usuario_id', user.id)
        .eq('chollo_id', cholloId);
    } catch (e) {
      console.error("Error al eliminar favorito", e);
    }
  }

  getUserActual() {
    return this.currentUser.value;
  }
}