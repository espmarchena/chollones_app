import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';

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
        this.loadFavorites();
    }

    private _favorites = new BehaviorSubject<Set<string>>(new Set());
    favorites$ = this._favorites.asObservable();

    getFavoritesValue(): Set<string> {
        return this._favorites.getValue();
    }

    async loadFavorites() {
        const { data, error } = await this.supabase
            .from('guardados')
            .select('chollo_id')
            .eq('usuario_temp_id', 'usuario_invitado');

        if (error) {
            console.error('Error loading favorites:', error);
            return;
        }

        // Force IDs to be strings to ensure consistency
        const favoriteIds = new Set<string>(data.map((item: any) => String(item.chollo_id)));
        this._favorites.next(favoriteIds);
    }

    // --- CHOLLOS ---
    async getChollos() {
        const { data, error } = await this.supabase
            .from('chollos')
            .select(`
        *,
        proveedores (nombre),
        puntos (estado),
        categorias (nombre)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // --- CATEGORÍAS ---
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
            .eq('categoria_id', categoriaId);

        if (error) throw error;
        return data || [];
    }

    // --- PROVEEDORES ---
    async getProveedores() {
        const { data, error } = await this.supabase
            .from('proveedores')
            .select('*')
            .order('nombre', { ascending: true });
        if (error) throw error;
        return data || [];
    }

    async insertarProveedor(proveedor: any) {
        const { data, error } = await this.supabase
            .from('proveedores')
            .insert([proveedor]);
        if (error) throw error;
        return data;
    }

    // --- FAVORITOS (GUARDADOS) ---
    async guardarCholloFavorito(cholloId: string | number) {
        const id = String(cholloId);
        // Optimistic update
        const currentFavorites = this._favorites.getValue();
        currentFavorites.add(id);
        this._favorites.next(new Set(currentFavorites));

        const { data, error } = await this.supabase
            .from('guardados')
            .insert([{
                chollo_id: id,
                usuario_temp_id: 'usuario_invitado'
            }]);

        if (error) {
            // Revert on error
            currentFavorites.delete(id);
            this._favorites.next(new Set(currentFavorites));
            throw error;
        }
        return data;
    }

    async getChollosGuardados() {
        const { data, error } = await this.supabase
            .from('guardados')
            .select('*, chollos(*, proveedores(nombre))');

        if (error) throw error;
        return data.map(fav => fav.chollos) || [];
    }

    async eliminarFavorito(cholloId: string | number) {
        const id = String(cholloId);
        // Optimistic update
        const currentFavorites = this._favorites.getValue();
        currentFavorites.delete(id);
        this._favorites.next(new Set(currentFavorites));

        const { error } = await this.supabase
            .from('guardados')
            .delete()
            .eq('chollo_id', id)
            .eq('usuario_temp_id', 'usuario_invitado');

        if (error) {
            // Revert on error
            currentFavorites.add(id);
            this._favorites.next(new Set(currentFavorites));
            throw error;
        }
    }

    // --- NOTIFICACIONES ---
    async getNotificaciones() {
        const { data, error } = await this.supabase
            .from('notificaciones')
            .select('*')
            .order('fecha', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // --- ELIMINAR (Por si lo necesitas recuperar en el futuro) ---
    async eliminarChollo(id: string) {
        const { data, error } = await this.supabase
            .from('chollos')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return data;
    }
}