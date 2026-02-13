import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importar Router
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
  heart,
  personOutline,
  bagOutline,
  flameOutline,
  timeOutline,
  openOutline
} from 'ionicons/icons';

import { SupabaseService } from '../services/supabase.service';
import { FavoritosEventService } from '../services/favoritos-event.service';

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
  // Propiedades básicas para la interfaz
  cartCount = 0;
  bannerUrl = 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1400&auto=format&fit=crop';

  // Listados de datos requeridos por el HTML (Corrige errores Imágenes 5 y 7)
  quickLinks = [
    { title: 'Ofertas del día', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
    { title: 'Servicios', img: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=600&auto=format&fit=crop' },
    { title: 'Deporte -20%', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop' }
  ];

  productosPopulares: any[] = [];
  chollosFiltrados: any[] = [];
  categorias = [
    { nombre: 'Belleza', img: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png' },
    { nombre: 'Moda', img: 'https://cdn-icons-png.flaticon.com/512/892/892458.png' },
    { nombre: 'Mascotas', img: 'https://cdn-icons-png.flaticon.com/512/616/616408.png' },
    { nombre: 'Cocina', img: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png' },
    { nombre: 'Marketing', img: 'https://cdn-icons-png.flaticon.com/512/3135/3135683.png' },
    { nombre: 'Juguetes', img: 'https://cdn-icons-png.flaticon.com/512/3082/3082060.png' },
  ];

  // Set para trackear IDs de favoritos
  favoritosIds: Set<string> = new Set();

  constructor(
    private supabaseService: SupabaseService,
    private favoritosEventService: FavoritosEventService,
    private router: Router
  ) {
    addIcons({
      searchOutline, heartOutline, heart, personOutline, bagOutline,
      flameOutline, timeOutline, openOutline
    });
  }

  async ngOnInit() {
    await this.cargarDatos();
    await this.cargarFavoritos();
  }

  // Recargar favoritos cuando vuelves a este tab
  async ionViewWillEnter() {
    await this.cargarFavoritos();
  }

  async cargarDatos() {
    try {
      const res = await this.supabaseService.getChollos();

      // Mapeamos los datos de Supabase al formato que usa tu HTML
      const dataMapeada = res.map((c: any) => ({
        ...c,
        titulo: c.titulo,
        precioActual: c.precio_actual,
        precioOriginal: c.precio_original,
        imagen: c.imagen_url,
        proveedor: c.proveedores?.nombre,
        nuevo: this.esReciente(c.created_at)
      }));

      this.productosPopulares = dataMapeada;
      this.chollosFiltrados = [...dataMapeada];
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  }

  async cargarFavoritos() {
    try {
      const ids = await this.supabaseService.getFavoritosIds();
      this.favoritosIds = new Set(ids);
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    }
  }

  // Función de búsqueda (Corrige error Imagen 6)
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

  // Navegar a la pestaña de guardados
  irAGuardados() {
    this.router.navigate(['/tabs/tab3']);
  }

  // Métodos para gestión de favoritos
  async toggleFavorito(chollo: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const id = chollo.id;
    const isFav = this.isFavorito(id);

    // Optimistic UI update
    if (isFav) {
      this.favoritosIds.delete(id);
    } else {
      this.favoritosIds.add(id);
    }

    try {
      if (isFav) {
        await this.supabaseService.eliminarCholloFavorito(id);
      } else {
        await this.supabaseService.guardarCholloFavorito(id);
      }

      // Notificar a otros componentes
      this.favoritosEventService.notificarCambio();
    } catch (error) {
      console.error('Error al gestionar favorito (revertiendo):', error);
      // Revertir cambio si falla
      if (isFav) {
        this.favoritosIds.add(id);
      } else {
        this.favoritosIds.delete(id);
      }
    }
  }

  isFavorito(cholloId: string): boolean {
    return this.favoritosIds.has(cholloId);
  }

  // Utilidades requeridas por el HTML
  esReciente(fecha: string): boolean {
    if (!fecha) return false;
    const horas = (new Date().getTime() - new Date(fecha).getTime()) / (1000 * 60 * 60);
    return horas < 24;
  }

  // Ajustado para recibir el objeto chollo completo (Corrige error Imagen 7)
  calcDescuento(c: any): number {
    const actual = Number(c?.precio_actual || 0);
    const original = Number(c?.precio_original || 0);
    if (!actual || !original || original <= actual) return 0;
    return Math.round(((original - actual) / original) * 100);
  }
}
