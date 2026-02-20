import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList,
  IonItem, IonThumbnail, IonLabel, IonBadge, IonSearchbar, IonIcon, IonButton
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  storefrontOutline,
  informationCircleOutline,
  locationOutline,
  navigateOutline
} from 'ionicons/icons';

import { SupabaseService } from '../services/supabase.service';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink, // ✅ por si usas [routerLink] en el HTML
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonThumbnail, IonLabel, IonBadge,
    IonSearchbar, IonIcon, IonButton
  ]
})
export class Tab4Page implements OnInit {
  listadoChollos: any[] = [];
  filtrados: any[] = [];
  miLat = 0;
  miLng = 0;

  textoBusqueda = '';
  categoriaSeleccionada = 'todas';
  filtroRapidoSeleccionado = '';

  categorias: any[] = [
    { nombre: 'Todas', slug: 'todas' }
  ];

  filtrosRapidos = [
    { id: 'recientes', nombre: 'Recientes' },
    { id: 'destacados', nombre: 'Destacados' },
    { id: 'distancia', nombre: 'Distancia' },
    { id: 'valorados', nombre: 'Mejor valorados' },
    { id: 'descuento', nombre: 'Mejor descuento' }
  ];

  constructor(
    private supabaseService: SupabaseService,
    private locationService: LocationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({ storefrontOutline, informationCircleOutline, locationOutline, navigateOutline });
  }

  async ngOnInit() {
    try {
      const coords = await this.locationService.getPosition();
      this.miLat = coords.latitude;
      this.miLng = coords.longitude;
    } catch (e) {
      console.warn('GPS no disponible, usando Sevilla por defecto');
      this.miLat = 37.3891;
      this.miLng = -5.9845;
    }

    try {
      const { data: cats } = await this.supabaseService.client
        .from('categorias')
        .select('nombre, slug')
        .order('nombre');

      if (cats && cats.length > 0) {
        this.categorias = [{ nombre: 'Todas', slug: 'todas' }, ...cats];
      }
    } catch (err) {
      console.error('Error cargando categorias en tab4', err);
    }

    await this.cargarChollos();

    // filtros rápidos por query params
    this.route.queryParams.subscribe(params => {
      if (params['filtro']) {
        const isQuickFilter = this.filtrosRapidos.some(f => f.id === params['filtro']);
        if (isQuickFilter) {
          this.filtroRapidoSeleccionado = params['filtro'];
          this.categoriaSeleccionada = 'todas';
        }
        this.aplicarFiltros();
      }
    });
  }

  async cargarChollos() {
    try {
      const chollos = await this.supabaseService.getChollos();
      if (chollos && Array.isArray(chollos)) {

        this.listadoChollos = chollos.map(c => {
          const pLat = c.proveedores?.lat;
          const pLng = c.proveedores?.lng;

          let distancia = '?';
          if (pLat && pLng) {
            const d = this.locationService.calcularDistancia(this.miLat, this.miLng, pLat, pLng);
            distancia = d.toFixed(1);
          }
          return { ...c, distanciaKM: distancia, lat: pLat, lng: pLng };
        });

        // Ordenar por cercanía
        this.listadoChollos.sort((a, b) => {
          if (a.distanciaKM === '?') return 1;
          if (b.distanciaKM === '?') return -1;
          return parseFloat(a.distanciaKM) - parseFloat(b.distanciaKM);
        });

        this.filtrados = [...this.listadoChollos];

        if (this.listadoChollos.length > 0) {
          this.locationService.iniciarVigilancia(this.listadoChollos);
        }
      }
    } catch (error) {
      console.error('Error al cargar chollos:', error);
    }
  }

  // ✅ ABRIR DETALLE PRODUCTO
irAProducto(chollo: any) {
  const id = chollo?.id;
  if (!id) {
    console.warn('Chollo sin id:', chollo);
    return;
  }

  // ✅ MUY IMPORTANTE: segmentos separados
  this.router.navigate(['tabs', 'producto', id]);
}
  calcDescuento(chollo: any): number {
    const actual = Number(chollo?.precio_actual || 0);
    const original = Number(chollo?.precio_original || 0);
    if (!actual || !original || original <= actual) return 0;
    return Math.round(((original - actual) / original) * 100);
  }

  // ✅ COMPATIBLE CON (ionInput)="buscar($event)" DEL SEARCHBAR
  buscar(event: any) {
    this.textoBusqueda = (event?.target?.value || '').toLowerCase().trim();
    this.aplicarFiltros();
  }

  seleccionarCategoria(slug: string) {
    this.categoriaSeleccionada = slug;
    this.aplicarFiltros();
  }

  seleccionarFiltroRapido(id: string) {
    this.filtroRapidoSeleccionado = (this.filtroRapidoSeleccionado === id) ? '' : id;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let resultado = [...this.listadoChollos];

    if (this.textoBusqueda) {
      resultado = resultado.filter(c =>
        (c.titulo || '').toLowerCase().includes(this.textoBusqueda) ||
        (c.proveedores?.nombre || '').toLowerCase().includes(this.textoBusqueda) ||
        (c.descripcion || '').toLowerCase().includes(this.textoBusqueda)
      );
    }

    if (this.categoriaSeleccionada !== 'todas') {
      resultado = resultado.filter(c =>
        (c.categorias?.slug || '').toLowerCase() === this.categoriaSeleccionada
      );
    }

    if (this.filtroRapidoSeleccionado) {
      if (this.filtroRapidoSeleccionado === 'recientes') {
        resultado.sort((a, b) => (new Date(b.created_at || 0).getTime()) - (new Date(a.created_at || 0).getTime()));
      } else if (this.filtroRapidoSeleccionado === 'destacados') {
        resultado = resultado.filter(c => c.punto?.estado === 'Caliente');
      } else if (this.filtroRapidoSeleccionado === 'descuento') {
        resultado.sort((a, b) => this.calcDescuento(b) - this.calcDescuento(a));
      } else if (this.filtroRapidoSeleccionado === 'distancia') {
        resultado.sort((a, b) => {
          if (a.distanciaKM === '?') return 1;
          if (b.distanciaKM === '?') return -1;
          return parseFloat(a.distanciaKM) - parseFloat(b.distanciaKM);
        });
      }
    } else {
      // por defecto cercanía
      resultado.sort((a, b) => {
        if (a.distanciaKM === '?') return 1;
        if (b.distanciaKM === '?') return -1;
        return parseFloat(a.distanciaKM) - parseFloat(b.distanciaKM);
      });
    }

    this.filtrados = resultado;
  }

  abrirNavegacion(chollo: any) {
    if (!chollo?.lat || !chollo?.lng) return;

    const lat = chollo.lat;
    const lng = chollo.lng;

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    const appleMapsUrl = `maps://maps.apple.com/?daddr=${lat},${lng}`;

    if (navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
      window.open(appleMapsUrl, '_system');
    } else {
      window.open(googleMapsUrl, '_system');
    }
  }
    anadirAlCarrito(chollo: any) {
  console.log('Añadir al carrito:', chollo);
}


}