import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  public supabase: SupabaseClient;

  // Fuente de verdad del estado del usuario
  private currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUser.asObservable();

  constructor() {
    // CLIENTE MINIMALISTA: Desactivamos persistencia y locks para evitar conflictos en el navegador
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        persistSession: false, // Evita conflictos con LocalStorage/Preferences
        autoRefreshToken: false,
        detectSessionInUrl: false,
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

  // --- MÉTODOS DE AUTENTICACIÓN ---

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

  // --- MÉTODOS DE DATOS (BLINDADOS CONTRA CRASHES) ---

  async getChollos(): Promise<any[]> {
    try {
      const response = await this.supabase
        .from('chollos')
        .select(`
          *,
          categorias (nombre, slug),
          proveedores (nombre, lat, lng)`)
        .order('created_at', { ascending: false });

      if (!response || response.error) {
        console.warn('Error u omisión de datos en getChollos:', response?.error);
        return [];
      }
      return response.data || [];
    } catch (err) {
      console.error("Fallo crítico en getChollos:", err);
      return [];
    }
  }

  async getChollosGuardados() {
    const user = this.userValue;
    if (!user) return [];

    try {
      const response = await this.supabase
        .from('guardados')
        .select(`
          id,
          chollos (
            id, titulo, precio_actual, precio_original, imagen_url,
            proveedores ( nombre )
          )
        `)
        .eq('usuario_temp_id', user.id);

      if (!response || response.error) return [];
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  async getFavoritosIds() {
    const user = this.userValue;
    if (!user) return [];

    try {
      const response = await this.supabase
        .from('guardados')
        .select('chollo_id')
        .eq('usuario_temp_id', user.id);

      if (!response || response.error) return [];
      const data = response.data || [];
      return data.map((f: any) => f.chollo_id);
    } catch (error) {
      return [];
    }
  }

  async guardarCholloFavorito(cholloId: string) {
    const user = this.userValue;
    if (!user) throw new Error('Debes estar logueado');

    try {
      await this.supabase
        .from('guardados')
        .insert({ usuario_temp_id: user.id, chollo_id: cholloId });
    } catch (e) {
      console.error("Error al guardar favorito", e);
    }
  }

  async eliminarCholloFavorito(cholloId: string) {
    const user = this.userValue;
    if (!user) return;

    try {
      await this.supabase
        .from('guardados')
        .delete()
        .eq('usuario_temp_id', user.id)
        .eq('chollo_id', cholloId);
    } catch (e) {
      console.error("Error al eliminar favorito", e);
    }
  }

  async getCupones() {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await this.supabase
        .from('cupones')
        .select('*')
        .or(`valido_hasta.is.null,valido_hasta.gte.${today}`)
        .order('created_at', { ascending: false });

      return response.data || [];
    } catch (e) {
      return [];
    }
  }

  // --- PERFIL Y AVATAR ---

  async updateProfile(data: any) {
    const response = await this.supabase.auth.updateUser({ data });
    if (response.data?.user) {
      this.currentUser.next(response.data.user);
    }
    return response.data?.user;
  }

  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  }

  async uploadAvatar(file: File): Promise<string> {
    const user = this.userValue;
    if (!user) throw new Error('Debes estar logueado');

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    try {
      const upload = await this.supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (upload.error) throw upload.error;

      const { data } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl + '?t=' + Date.now();
      await this.updateProfile({ avatar_url: avatarUrl });
      return avatarUrl;
    } catch (err) {
      const base64 = await this.fileToBase64(file);
      await this.updateProfile({ avatar_url: base64 });
      return base64;
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
  }
    // --- DETALLE DE CHOLLO (PÁGINA PRODUCTO) ---

  async getCholloById(id: string): Promise<any | null> {
    try {
      const response = await this.supabase
        .from('chollos')
        .select(`
          *,
          categorias (id, nombre, slug),
          proveedores (id, nombre, lat, lng)
        `)
        .eq('id', id)
        .single();

      if (!response || response.error) {
        console.warn('Error u omisión de datos en getCholloById:', response?.error);
        return null;
      }

      return response.data ?? null;
    } catch (err) {
      console.error('Fallo crítico en getCholloById:', err);
      return null;
    }
  }

  async getChollosSimilares(params: {
    categoriaId?: string | null;
    proveedorId?: string | null;
    excludeId: string;
    limit?: number;
  }): Promise<any[]> {
    const { categoriaId = null, proveedorId = null, excludeId, limit = 10 } = params;

    try {
      // Preferimos similares por categoría, si no por proveedor
      let query = this.supabase
        .from('chollos')
        .select(`
          id, titulo, descripcion, precio_actual, precio_original, imagen_url, created_at,
          categorias (id, nombre, slug),
          proveedores (id, nombre)
        `)
        .neq('id', excludeId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (categoriaId) query = query.eq('categoria_id', categoriaId);
      else if (proveedorId) query = query.eq('proveedor_id', proveedorId);
      else return [];

      const response = await query;

      if (!response || response.error) {
        console.warn('Error u omisión de datos en getChollosSimilares:', response?.error);
        return [];
      }

      return response.data ?? [];
    } catch (err) {
      console.error('Fallo crítico en getChollosSimilares:', err);
      return [];
    }
  }
}