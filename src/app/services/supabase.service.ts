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
}