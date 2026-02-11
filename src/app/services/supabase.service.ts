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
}