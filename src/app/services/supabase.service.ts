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


  // BehaviorSubject que actúa como la fuente de verdad del estado del usuario
  private currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUser.asObservable();

  constructor() {
    // Inicialización del cliente con persistencia nativa de Capacitor
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        storage: {
          getItem: async (key: string) => (await Preferences.get({ key })).value,
          setItem: async (key: string, value: string) =>
            await Preferences.set({ key, value }),
          removeItem: async (key: string) => await Preferences.remove({ key }),
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storageKey: 'chollones-auth-token',
      },
    });

    // Escuchar cambios en el estado de autenticación (login, logout, refresh)
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Cambio en Auth Supabase:', event);
      this.currentUser.next(session?.user ?? null);
    });
  }

  // ✅ Getter público para usar el cliente desde páginas/componentes
  public get client(): SupabaseClient {
    return this.supabase;
  }

  // Método para obtener el valor actual del usuario de forma síncrona
  get userValue() {
    return this.currentUser.value;
  }

  /**
   * Inicia sesión con correo y contraseña
   */
  async login(email: string, pass: string) {
    return await this.supabase.auth.signInWithPassword({ email, password: pass });
  }

  /**
   * Registra un nuevo usuario
   * Nota: Como desactivaste la confirmación de email, el usuario se logueará automáticamente.
   */
  async registro(email: string, pass: string, nombre: string) {
    return await this.supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { full_name: nombre } },
    });
  }

  /**
   * Cierra la sesión en Supabase y limpia el estado local
   */
  async logout() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;

      // Forzamos la actualización del BehaviorSubject a null
      this.currentUser.next(null);
      console.log('Sesión cerrada con éxito');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  /**
   * Ejemplo de método para obtener chollos guardados
   */
  async getChollosGuardados() {
    const user = this.userValue;
    if (!user) return [];

    const { data, error } = await this.supabase
      .from('favoritos')
      .select(
        `
        id,
        chollos (
          id,
          titulo,
          precio_actual,
          precio_original,
          imagen_url,
          proveedores ( nombre )
        )
      `
      )
      .eq('usuario_id', user.id);

    if (error) throw error;
    return data || [];
  }

  async getChollos() {
    const { data, error } = await this.supabase
      .from('chollos')
      .select('*, proveedores(nombre)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Devuelve el objeto del usuario actual de forma síncrona.
   */
  getUserActual() {
    return this.currentUser.value;
  }

  /** Obtiene solo los IDs de los chollos que el usuario actual ha guardado */
  async getFavoritosIds() {
    const user = this.getUserActual();
    if (!user) return [];

    const { data, error } = await this.supabase
      .from('favoritos')
      .select('chollo_id')
      .eq('usuario_id', user.id);

    if (error) throw error;
    return (data || []).map((f: any) => f.chollo_id);
  }

  /** Guarda un chollo en favoritos */
  async guardarCholloFavorito(cholloId: string) {
    const user = this.getUserActual();
    if (!user) throw new Error('Debes estar logueado');

    const { error } = await this.supabase
      .from('favoritos')
      .insert({ usuario_id: user.id, chollo_id: cholloId });

    if (error) throw error;
  }

  /** Elimina un chollo de favoritos */
  async eliminarCholloFavorito(cholloId: string) {
    const user = this.getUserActual();
    if (!user) return;

    const { error } = await this.supabase
      .from('favoritos')
      .delete()
      .eq('usuario_id', user.id)
      .eq('chollo_id', cholloId);

    if (error) throw error;
  }
}
