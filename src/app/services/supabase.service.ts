import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  
  // BehaviorSubject que actúa como la fuente de verdad del estado del usuario
  private currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUser.asObservable();

  constructor() {
    // Inicialización del cliente con persistencia nativa de Capacitor
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        storage: {
          getItem: async (key) => (await Preferences.get({ key })).value,
          setItem: async (key, value) => await Preferences.set({ key, value }),
          removeItem: async (key) => await Preferences.remove({ key }),
        },
        autoRefreshToken: true,
        persistSession: true
      }
    });

    // Escuchar cambios en el estado de autenticación (login, logout, refresh)
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Cambio en Auth Supabase:', event);
      this.currentUser.next(session?.user ?? null);
    });
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
      options: { data: { full_name: nombre } }
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
   * (Asegúrate de que este método coincida con tu lógica de base de datos)
   */
  async getChollosGuardados() {
    const user = this.userValue;
    if (!user) return [];

    const { data, error } = await this.supabase
      .from('favoritos')
      .select(`
        id,
        chollos (
          id,
          titulo,
          precio_actual,
          precio_original,
          imagen_url,
          proveedores ( nombre )
        )
      `)
      .eq('usuario_id', user.id);

    if (error) throw error;
    return data || [];
  }

  // ... otros métodos de tu servicio (login, registro, etc.)
}