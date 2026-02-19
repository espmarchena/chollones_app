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

  // BehaviorSubject que act├║a como la fuente de verdad del estado del usuario
  private currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUser.asObservable();

  constructor() {
    // Inicializaci├│n del cliente con persistencia nativa de Capacitor
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        storage: {
          getItem: async (key) => (await Preferences.get({ key })).value,
          setItem: async (key, value) => await Preferences.set({ key, value }),
          removeItem: async (key) => await Preferences.remove({ key }),
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storageKey: 'chollones-auth-token'
      }
    });

    // Escuchar cambios en el estado de autenticaci├│n (login, logout, refresh)
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Cambio en Auth Supabase:', event);
      this.currentUser.next(session?.user ?? null);
    });
  }

  // M├®todo para obtener el valor actual del usuario de forma s├¡ncrona
  get userValue() {
    return this.currentUser.value;
  }

  /**
   * Inicia sesi├│n con correo y contrase├▒a
   */
  async login(email: string, pass: string) {
    return await this.supabase.auth.signInWithPassword({ email, password: pass });
  }

  /**
   * Registra un nuevo usuario
   * Nota: Como desactivaste la confirmaci├│n de email, el usuario se loguear├í autom├íticamente.
   */
  async registro(email: string, pass: string, nombre: string) {
    return await this.supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { full_name: nombre } }
    });
  }

  /**
   * Cierra la sesi├│n en Supabase y limpia el estado local
   */
  async logout() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;

      // Forzamos la actualizaci├│n del BehaviorSubject a null
      this.currentUser.next(null);
      console.log('Sesi├│n cerrada con ├®xito');
    } catch (error) {
      console.error('Error al cerrar sesi├│n:', error);
    }
  }

  /**
   * Ejemplo de m├®todo para obtener chollos guardados
   * (Aseg├║rate de que este m├®todo coincida con tu l├│gica de base de datos)
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

  async getChollos() {
    const { data, error } = await this.supabase
      .from('chollos')
      .select('*, proveedores(nombre)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  /**
   * Obtiene la lista de cupones v├ílidos
   */
  async getCupones() {
    // Filtrar por fecha de validez (o nulos que no caducan)
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('cupones')
      .select('*')
      .or(`valido_hasta.is.null,valido_hasta.gte.${today}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Devuelve el objeto del usuario actual de forma s├¡ncrona.
   * Es ├║til para comprobaciones r├ípidas dentro de otros m├®todos del servicio.
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
    return data.map(f => f.chollo_id);
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

  // ÔöÇÔöÇÔöÇ EDITAR PERFIL ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

  /**
   * Actualiza los datos del perfil en user_metadata de Supabase Auth.
   * Campos: full_name, phone, address
   */
  async updateProfile(data: { full_name?: string; phone?: string; address?: string; birth_date?: string }) {
    const { data: result, error } = await this.supabase.auth.updateUser({
      data: data
    });
    if (error) throw error;
    // Actualizamos el BehaviorSubject con el usuario actualizado
    this.currentUser.next(result.user);
    return result.user;
  }

  /**
   * Cambia la contrase├▒a del usuario autenticado
   */
  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  }

  /**
   * Sube un avatar al bucket 'avatars' de Supabase Storage
   * y actualiza la URL en user_metadata.
   * Si no existe el bucket, guarda como base64 en user_metadata directamente.
   */
  async uploadAvatar(file: File): Promise<string> {
    const user = this.getUserActual();
    if (!user) throw new Error('Debes estar logueado');

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    try {
      // Intentamos subir al bucket 'avatars'
      const { error: uploadError } = await this.supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Obtenemos la URL p├║blica
      const { data: urlData } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl + '?t=' + Date.now(); // cache-bust

      // Actualizamos user_metadata con la nueva URL
      await this.updateProfile({ avatar_url: avatarUrl } as any);
      return avatarUrl;
    } catch (err) {
      console.warn('Storage no disponible, guardando avatar en base64:', err);
      // Fallback: convertimos a base64 y lo guardamos en user_metadata
      const base64 = await this.fileToBase64(file);
      await this.updateProfile({ avatar_url: base64 } as any);
      return base64;
    }
  }

  /** Convierte un File a base64 */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
