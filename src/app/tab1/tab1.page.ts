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
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { searchOutline, heartOutline, personOutline, bagOutline } from 'ionicons/icons';

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
  ],
})
export class Tab1Page implements OnInit {
  // Carrito (por ahora fijo)
  cartCount = 0;

  // Banner (URL)
  bannerUrl =
    'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1400&auto=format&fit=crop';

  // Accesos rápidos (texto corto)
  quickLinks = [
    { title: 'Ofertas del día', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
    { title: 'Camareras -35%', img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop' },
    { title: 'Servicios', img: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=600&auto=format&fit=crop' },
    { title: 'Deporte -20%', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop' },
  ];

  // Productos populares (tipo web)
  productosPopulares = [
    {
      titulo: 'Pack Combo Total Body',
      categoria: 'Servicios Estéticos',
      proveedor: 'Centro Médico Estético Chic',
      precioActual: 290,
      precioOriginal: 510,
      descuento: -43,
      nuevo: true,
      imagen: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
    },
    {
      titulo: 'Pack Dúo Perfecto',
      categoria: 'Servicios Estéticos',
      proveedor: 'Centro Médico Estético Chic',
      precioActual: 99,
      precioOriginal: 125,
      descuento: -21,
      nuevo: true,
      imagen: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=1200&auto=format&fit=crop',
    },
    {
      titulo: 'Tratamiento Capilar',
      categoria: 'Belleza y bienestar',
      proveedor: 'Alicia Cofrina',
      precioActual: 59,
      precioOriginal: null,
      descuento: null,
      nuevo: true,
      imagen: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop',
    },
    {
      titulo: 'Pack Bodytop10',
      categoria: 'Servicios Estéticos',
      proveedor: 'Clínica Médico-Estética',
      precioActual: 350,
      precioOriginal: null,
      descuento: null,
      nuevo: true,
      imagen: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1200&auto=format&fit=crop',
    },
  ];

  // Categorías (fila horizontal)
  categorias = [
    { nombre: 'Belleza', img: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png' },
    { nombre: 'Moda', img: 'https://cdn-icons-png.flaticon.com/512/892/892458.png' },
    { nombre: 'Mascotas', img: 'https://cdn-icons-png.flaticon.com/512/616/616408.png' },
    { nombre: 'Cocina', img: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png' },
    { nombre: 'Marketing', img: 'https://cdn-icons-png.flaticon.com/512/3135/3135683.png' },
    { nombre: 'Juguetes', img: 'https://cdn-icons-png.flaticon.com/512/3082/3082060.png' },
  ];

  // Data real (supabase)
  chollos: any[] = [];
  chollosFiltrados: any[] = [];

  constructor(private supabaseService: SupabaseService) {
    addIcons({ searchOutline, heartOutline, personOutline, bagOutline });
  }

  async ngOnInit() {
    try {
      this.chollos = await this.supabaseService.getChollos();
      this.chollosFiltrados = this.chollos;
    } catch (error) {
      console.error('Error cargando chollos:', error);
      this.chollos = [];
      this.chollosFiltrados = [];
    }
  }

  onSearch(ev: any) {
    const q = (ev?.target?.value || '').toLowerCase().trim();
    if (!q) {
      this.chollosFiltrados = this.chollos;
      return;
    }
    this.chollosFiltrados = this.chollos.filter((c) => {
      const titulo = (c?.titulo || '').toLowerCase();
      const desc = (c?.descripcion || '').toLowerCase();
      const prov = (c?.proveedor?.nombre || '').toLowerCase();
      return titulo.includes(q) || desc.includes(q) || prov.includes(q);
    });
  }

  calcDescuento(c: any) {
    const actual = Number(c?.precio_actual || 0);
    const original = Number(c?.precio_original || 0);
    if (!actual || !original || original <= actual) return 0;
    return Math.round(((original - actual) / original) * 100);
  }
}
