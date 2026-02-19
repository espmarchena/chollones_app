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
    // Pequeña pausa para asegurar que el cliente Supabase esté listo
    setTimeout(async () => {
      await this.cargarProductos();
    }, 100);
  }

  async cargarProductos() {
    this.loading = true;
    
    try {
      // 1. OBTENER LA CATEGORÍA
      // Guardamos la respuesta completa en una variable neutra
      const resCat = await this.supabase.client
        .from('categorias')
        .select('id, nombre, slug')
        .eq('slug', this.slug)
        .limit(1);

      // BLINDAJE 1: Comprobamos si la respuesta existe y tiene datos
      if (!resCat || !resCat.data || resCat.data.length === 0) {
        console.warn('Categoría no encontrada en Supabase:', this.slug);
        this.productos = [];
        this.loading = false;
        return;
      }

      const categoriaId = resCat.data[0].id;

      // 2. OBTENER LOS PRODUCTOS
      // Repetimos el proceso seguro para los chollos
      const resChollos = await this.supabase.client
        .from('chollos')
        .select(`*, proveedores(nombre, logo)`)
        .eq('categoria_id', categoriaId)
        .order('created_at', { ascending: false });

      // BLINDAJE 2: Acceso seguro a los datos de los productos
      if (resChollos && resChollos.data) {
        this.productos = resChollos.data;
        console.log(`Cargados ${this.productos.length} productos para: ${this.slug}`);
      } else {
        this.productos = [];
      }

    } catch (err) {
      console.error('Error crítico capturado:', err);
      this.productos = [];
    } finally {
      this.loading = false;
    }
  }

  get tituloCategoria() {
    if (!this.slug) return 'Categoría';
    // Pone la primera letra en mayúscula (ej: digitalizacion -> Digitalizacion)
    return this.slug.charAt(0).toUpperCase() + this.slug.slice(1);
  }
}
