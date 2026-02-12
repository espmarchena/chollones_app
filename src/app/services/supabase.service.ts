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

  async getChollos() {
    const { data, error } = await this.supabase
      .from('chollos')
      .select(`
        id,
        titulo,
        descripcion,
        precio_actual,
        precio_original,
        proveedores (nombre, logo),
        puntos (estado)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error en la consulta:', error);
      throw error;
    }
    return data || [];
  }

  // Añade estos métodos dentro de la clase SupabaseService
  async getProveedores() {
    const { data } = await this.supabase.from('proveedores').select('*');
    return data || [];
  }

  async getPuntos() {
    const { data } = await this.supabase.from('puntos').select('*');
    return data || [];
  }

  async insertarChollo(chollo: any) {
    const { data, error } = await this.supabase.from('chollos').insert([chollo]);
    if (error) throw error;
    return data;
  }

  async insertarProveedor(proveedor: any) {
    const { data, error } = await this.supabase
      .from('proveedores')
      .insert([proveedor]);
    if (error) throw error;
    return data;
  }

    // --- MÉTODOS PARA CATEGORÍAS ---
  async getCategorias() {
    const { data, error } = await this.supabase
      .from('categorias')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async getChollosPorCategoria(categoriaId: string) {
    const { data, error } = await this.supabase
      .from('chollos')
      .select('*, proveedores(nombre), puntos(estado), categorias(nombre)')
      .eq('categoria_id', categoriaId); // Filtra por la FK que creamos
    if (error) throw error;
    return data || [];
  }

  // --- MÉTODOS PARA GUARDADOS (FAVORITOS) ---
  async guardarCholloFavorito(cholloId: string) {
    const { data, error } = await this.supabase
      .from('guardados')
      .insert([{ chollo_id: cholloId, usuario_temp_id: 'user_123' }]); // 'user_123' es temporal
    if (error) throw error;
    return data;
  }

  async getChollosGuardados() {
    const { data, error } = await this.supabase
      .from('guardados')
      .select('*, chollos(*, proveedores(nombre))');
    if (error) throw error;
    return data.map(f => f.chollos) || []; // Devolvemos solo la info del chollo
  }

  // --- MÉTODOS PARA NOTIFICACIONES ---
  async getNotificaciones() {
    const { data, error } = await this.supabase
      .from('notificaciones')
      .select('*')
      .order('fecha', { ascending: false });
    if (error) throw error;
    return data || [];
  }
}