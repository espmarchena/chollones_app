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
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
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

  async cargarProductos() {
    this.loading = true;

    // 1) Buscar categoría por slug (sin .single() para evitar 406)
    const { data: cats, error: catError } = await this.supabase.client
      .from('categorias')
      .select('id, nombre, slug')
      .eq('slug', this.slug)
      .limit(1);

    if (catError) {
      console.error('Error buscando categoría:', catError);
      this.productos = [];
      this.loading = false;
      return;
    }

    const categoria = cats?.[0];

    if (!categoria) {
      console.warn('No existe categoría con slug:', this.slug);
      this.productos = [];
      this.loading = false;
      return;
    }

    // 2) Cargar chollos de esa categoría
const { data, error } = await this.supabase.client
  .from('chollos')
  .select(`*, proveedores(nombre, logo)`)
  .eq('categoria_id', categoria.id)
  .order('created_at', { ascending: false });

if (error) {
  console.error('Error cargando chollos:', error);
  this.productos = [];
  this.loading = false;
  return;
}


    this.productos = data ?? [];
    this.loading = false;
  }

  get tituloCategoria() {
    return this.slug.charAt(0).toUpperCase() + this.slug.slice(1);
  }
}
