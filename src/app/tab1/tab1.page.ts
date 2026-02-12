import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonBadge,
  IonText
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { 
  searchOutline, 
  heartOutline, 
  personOutline, 
  bagOutline, 
  flameOutline,
  timeOutline,
  openOutline
} from 'ionicons/icons';

import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonBadge,
    IonText
  ],
})
export class Tab1Page implements OnInit {
  // Carrito
  cartCount = 0;

  // Banner
  bannerUrl = 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1400&auto=format&fit=crop';

  // Accesos rápidos
  quickLinks = [
    { title: 'Ofertas del día', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
    { title: 'Camareras -35%', img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop' },
    { title: 'Servicios', img: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=600&auto=format&fit=crop' },
    { title: 'Deporte -20%', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop' },
  ];

  // Categorías
  categorias = [
    { nombre: 'Belleza', img: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png' },
    { nombre: 'Moda', img: 'https://cdn-icons-png.flaticon.com/512/892/892458.png' },
    { nombre: 'Mascotas', img: 'https://cdn-icons-png.flaticon.com/512/616/616408.png' },
    { nombre: 'Cocina', img: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png' },
    { nombre: 'Marketing', img: 'https://cdn-icons-png.flaticon.com/512/3135/3135683.png' },
    { nombre: 'Juguetes', img: 'https://cdn-icons-png.flaticon.com/512/3082/3082060.png' },
  ];

  // Datos reales unificados con el esquema final
  chollos: any[] = [];
  chollosFiltrados: any[] = [];

  constructor(private supabaseService: SupabaseService) {
    addIcons({ 
      searchOutline, 
      heartOutline, 
      personOutline, 
      bagOutline, 
      flameOutline,
      timeOutline,
      openOutline
    });
  }

  async ngOnInit() {
    await this.cargarChollos();
  }

  async cargarChollos() {
    try {
      const res = await this.supabaseService.getChollos();

      // Mapeo exacto al esquema de la base de datos (Imagen 3)
      this.chollos = res.map((c: any) => ({
        ...c,
        titulo: c.titulo,
        precio: c.precio_actual,
        precioOld: c.precio_original,
        imagen: c.imagen_url,
        tienda: c.proveedores?.nombre,
        logoTienda: c.proveedores?.logo,
        descuento: this.calcDescuento(c),
        esNuevo: this.esReciente(c.created_at)
      }));

      this.chollosFiltrados = [...this.chollos];
    } catch (error) {
      console.error('Error cargando chollos desde Supabase:', error);
    }
  }

  esReciente(fecha: string): boolean {
    if (!fecha) return false;
    const horas = (new Date().getTime() - new Date(fecha).getTime()) / (1000 * 60 * 60);
    return horas < 24;
  }

  calcDescuento(c: any): number {
    const actual = Number(c?.precio_actual || 0);
    const original = Number(c?.precio_original || 0);
    if (!actual || !original || original <= actual) return 0;
    return Math.round(((original - actual) / original) * 100);
  }

  onSearch(ev: any) {
    const q = (ev?.target?.value || '').toLowerCase().trim();
    
    if (!q) {
      this.chollosFiltrados = [...this.chollos];
      return;
    }

    this.chollosFiltrados = this.chollos.filter((c) => {
      const titulo = (c?.titulo || '').toLowerCase();
      const desc = (c?.descripcion || '').toLowerCase();
      const tienda = (c?.tienda || '').toLowerCase();
      return titulo.includes(q) || desc.includes(q) || tienda.includes(q);
    });
  }
}