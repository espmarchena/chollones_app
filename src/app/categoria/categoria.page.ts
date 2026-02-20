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
    await this.cargarProductos();
  }

  get tituloCategoria() {
    if (!this.slug) return 'Categoría';
    return this.slug.charAt(0).toUpperCase() + this.slug.slice(1);
  }

  async cargarProductos() {
    this.loading = true;

    try {
      // 1) Buscar categoría por slug
      const { data: cat, error: catError } = await this.supabase.client
        .from('categorias')
        .select('id, nombre, slug')
        .eq('slug', this.slug)
        .single();

      if (catError) {
        console.error('❌ Error cargando categoría:', catError);
        this.productos = [];
        return;
      }

      if (!cat?.id) {
        console.warn('⚠️ No se encontró la categoría:', this.slug);
        this.productos = [];
        return;
      }

      const categoriaId = cat.id;
      console.log('✅ Categoría encontrada. ID:', categoriaId);

      // 2) Buscar chollos por categoria_id
      const { data: chollos, error: chollosError } = await this.supabase.client
        .from('chollos')
        .select('*, proveedores(nombre, logo)')
        .eq('categoria_id', categoriaId)
        .order('created_at', { ascending: false });

      if (chollosError) {
        console.error('❌ Error cargando chollos:', chollosError);
        this.productos = [];
        return;
      }

      this.productos = chollos ?? [];
      console.log('✅ Chollos cargados:', this.productos.length);

    } catch (error) {
      console.error('🔥 Error crítico:', error);
      this.productos = [];
    } finally {
      this.loading = false;
    }
  }
}
