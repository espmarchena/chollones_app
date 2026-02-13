import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://bgifebyzxnvpghljmiad.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnaWZlYnl6eG52cGdobGptaWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3Njc0NDcsImV4cCI6MjA4NjM0MzQ0N30.OaMa9RRjHhH23iW34u8Py47UludSZsij8R02Vz-HAIc'
    );
  }

  // Obtener o generar un ID de usuario temporal único para este dispositivo
  private getUserId(): string {
    let userId = localStorage.getItem('app_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('app_user_id', userId);
    }
    return userId;
  }

  async getChollos() {
    const { data, error } = await this.supabase
      .from('chollos')
      .select(`
        *,
        proveedores (
          nombre
        )
      `) // Esto crea el objeto 'proveedores' que tu HTML necesita
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Métodos para gestión de favoritos
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
    console.log('Intentando eliminar favorito chollo_id:', cholloId, 'usuario:', userId);

    // 1. Intentar borrar mi favorito (usando el ID de usuario temporal)
    const { data: data1, count: count1, error: error1 } = await this.supabase
      .from('guardados')
      .delete({ count: 'exact' })
      .eq('chollo_id', cholloId)
      .eq('usuario_temp_id', userId)
      .select();

    if (error1) {
      console.error('Error supabase delete (user):', error1);
    }

    if (count1 && count1 > 0) {
      console.log('Eliminado por usuario exitoso. Filas:', count1);
      return;
    }

   // 2. Si no borró nada, intentar borrar registros que NO tienen usuario asignado (legacy/null)
    // Esto asegura que podamos borrar los likes viejos que no tienen ID
    console.log('No se borraron filas de usuario, intentando fallback legacy...');
    const { data: data2, count: count2, error: error2 } = await this.supabase
      .from('guardados')
      .delete({ count: 'exact' })
      .eq('chollo_id', cholloId)
      .is('usuario_temp_id', null)
      .select();

    if (error2) {
      console.error('Error supabase delete (legacy):', error2);
      // Si fallan ambos y hubo error en el primero, lanzarlo
      if (error1) throw error1;
    } else {
      console.log('Eliminado legacy exitoso. Filas:', count2);
    }
  }

  async getChollosGuardados() {
    const userId = this.getUserId();

    const { data, error } = await this.supabase
      .from('guardados')
      .select('*, chollos(*, proveedores(*))')
      .or(`usuario_temp_id.eq.${userId},usuario_temp_id.is.null`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getFavoritosIds(): Promise<string[]> {
    const userId = this.getUserId();

    const { data, error } = await this.supabase
      .from('guardados')
      .select('chollo_id')
      .or(`usuario_temp_id.eq.${userId},usuario_temp_id.is.null`);

    if (error) throw error;
    return (data || []).map((item: any) => item.chollo_id);
  }
}