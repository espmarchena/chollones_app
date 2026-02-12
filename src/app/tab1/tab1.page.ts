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
  openOutline,
  gridOutline,
  notificationsOutline
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
  // Propiedades para la interfaz
  cartCount = 0;
  bannerUrl = 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1400&auto=format&fit=crop';

  // Enlaces rápidos (Asegúrate de que el HTML use estas propiedades)
  quickLinks = [
    { title: 'Ofertas del día', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
    { title: 'Servicios', img: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=600&auto=format&fit=crop' },
    { title: 'Deporte -20%', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop' }
  ];

  // Listados de datos (Soluciona errores de compilación)
  productosPopulares: any[] = []; 
  chollosFiltrados: any[] = [];  
  categorias: any[] = [];

  constructor(private supabaseService: SupabaseService) {
    // Registramos todos los iconos que usa la App
    addIcons({ 
      searchOutline, heartOutline, personOutline, bagOutline, 
      flameOutline, timeOutline, openOutline, gridOutline, 
      notificationsOutline 
    });
  }

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      // Llamada al servicio que creamos para conectar con Supabase
      const res = await this.supabaseService.getChollos();
      
      // Transformamos los datos de la DB al formato que espera el HTML
      const dataMapeada = res.map((c: any) => ({
        ...c,
        titulo: c.titulo,               // Mapeo según esquema Imagen 1
        precioActual: c.precio_actual,   // Mapeo según esquema Imagen 1
        precioOriginal: c.precio_original,
        imagen: c.imagen_url,           // Mapeo según esquema Imagen 1
        proveedor: c.proveedores?.nombre,
        nuevo: this.esReciente(c.created_at)
      }));

      this.productosPopulares = dataMapeada;
      this.chollosFiltrados = [...dataMapeada];
    } catch (error) {
      console.error('Error al cargar datos de Supabase:', error);
    }
  }

  // Lógica del buscador (Soluciona error Imagen 6)
  onSearch(ev: any) {
    const q = (ev?.target?.value || '').toLowerCase().trim();
    
    if (!q) {
      this.chollosFiltrados = [...this.productosPopulares];
      return;
    }

    this.chollosFiltrados = this.productosPopulares.filter((p) => {
      return (p.titulo || '').toLowerCase().includes(q) || 
             (p.proveedor || '').toLowerCase().includes(q);
    });
  }

  // Verifica si el chollo se subió hace menos de 24 horas
  esReciente(fecha: string): boolean {
    if (!fecha) return false;
    const horas = (new Date().getTime() - new Date(fecha).getTime()) / (1000 * 60 * 60);
    return horas < 24;
  }

  // Calcula el porcentaje de ahorro (Soluciona error Imagen 7)
  calcDescuento(c: any): number {
    const actual = Number(c?.precio_actual || 0);
    const original = Number(c?.precio_original || 0);
    if (!actual || !original || original <= actual) return 0;
    return Math.round(((original - actual) / original) * 100);
  }
}