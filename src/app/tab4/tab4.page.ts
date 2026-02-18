import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, 
    IonList, IonItem, IonThumbnail, IonLabel, IonBadge, IonSearchbar, IonIcon, IonButton
  ]
})
export class Tab4Page implements OnInit {
  listadoChollos: any[] = [];
  filtrados: any[] = [];
  miLat: number = 0;
  miLng: number = 0;

  constructor(
    private supabaseService: SupabaseService, 
    private locationService: LocationService
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
    
    await this.cargarChollos();
  }

  async cargarChollos() {
    try {
      // 1. LLAMADA LIMPIA: El servicio ya nos devuelve un array seguro (o [])
      const chollos = await this.supabaseService.getChollos();

      // 2. VALIDACIÓN SIMPLE: Solo comprobamos que sea un array
      // Ya no hace falta buscar .data ni hacer casting raro
      if (chollos && Array.isArray(chollos)) {
        
        this.listadoChollos = chollos.map(c => {
          // Lógica de distancia
          if (c.lat && c.lng) {
            const d = this.locationService.calcularDistancia(this.miLat, this.miLng, c.lat, c.lng);
            return { ...c, distanciaKM: d.toFixed(1) };
          }
          return { ...c, distanciaKM: '?' };
        });

        // Ordenar por cercanía
        this.listadoChollos.sort((a, b) => {
          if (a.distanciaKM === '?') return 1;
          if (b.distanciaKM === '?') return -1;
          return parseFloat(a.distanciaKM) - parseFloat(b.distanciaKM);
        });

        this.filtrados = [...this.listadoChollos];

        // Iniciar vigilancia
        if (this.listadoChollos.length > 0) {
          this.locationService.iniciarVigilancia(this.listadoChollos);
        }
      }
    } catch (error) {
      console.error('Error al cargar chollos:', error);
      // Gracias al servicio blindado, es raro llegar aquí, pero no rompemos la app
    }
  }

  calcDescuento(chollo: any): number {
    const actual = Number(chollo?.precio_actual || 0);
    const original = Number(chollo?.precio_original || 0);
    if (!actual || !original || original <= actual) return 0;
    return Math.round(((original - actual) / original) * 100);
  }

  buscar(event: any) {
    const texto = (event.target.value || '').toLowerCase().trim();
    if (!texto) {
      this.filtrados = [...this.listadoChollos];
      return;
    }
    this.filtrados = this.listadoChollos.filter(c => 
      c.titulo.toLowerCase().includes(texto) || 
      c.proveedores?.nombre?.toLowerCase().includes(texto)
    );
  }

  abrirNavegacion(chollo: any) {
    if (!chollo.lat || !chollo.lng) return;

    const lat = chollo.lat;
    const lng = chollo.lng;
    
    // HE CORREGIDO TUS URLS. La que tenías de googleusercontent no iba a funcionar.
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    const appleMapsUrl = `maps://maps.apple.com/?daddr=${lat},${lng}`;

    if (navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
      window.open(appleMapsUrl, '_system');
    } else {
      window.open(googleMapsUrl, '_system');
    }
  }
}