import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonText
} from '@ionic/angular/standalone';

import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.page.html',
  styleUrls: ['./categoria.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonCardContent, IonText
  ],
})
export class CategoriaPage implements OnInit {
  slug = '';
  productos: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    setTimeout(() => {
      this.cargarProductos();
    }, 100);
  }

  // Genera el título para la cabecera (ej: "digitalizacion" -> "Digitalizacion")
  get tituloCategoria() {
    if (!this.slug) return 'Categoría';
    return this.slug.charAt(0).toUpperCase() + this.slug.slice(1);
  }

  async cargarProductos() {
    this.loading = true;
    
    try {
      // --- 1. BUSCAR LA CATEGORÍA (Sin desestructurar) ---
      const respuestaCat = await this.supabase.client
        .from('categorias')
        .select('*')
        .eq('slug', this.slug);

      // Si la red falla o Supabase devuelve undefined/null
      if (!respuestaCat || !respuestaCat.data || respuestaCat.data.length === 0) {
        console.warn('⚠️ No se encontró la categoría:', this.slug);
        this.productos = [];
        this.loading = false;
        return;
      }

      // Extraemos el ID de forma segura
      const categoriaId = respuestaCat.data[0].id;
      console.log('✅ Categoría encontrada. ID:', categoriaId);

      // --- 2. BUSCAR LOS CHOLLOS (Sin desestructurar) ---
      const respuestaChollos = await this.supabase.client
        .from('chollos')
        .select('*, proveedores(nombre, logo)')
        .eq('categoria_id', categoriaId)
        .order('created_at', { ascending: false });

      // Comprobamos si hay datos de chollos
      if (respuestaChollos && respuestaChollos.data) {
        this.productos = respuestaChollos.data;
        console.log('✅ Chollos cargados:', this.productos.length);
      } else {
        console.warn('⚠️ No hay chollos en esta categoría o hubo un error.');
        this.productos = [];
      }

    } catch (error) {
      console.error('🔥 Error crítico atrapado en el código:', error);
      this.productos = [];
    } finally {
      this.loading = false;
    }
  }
}