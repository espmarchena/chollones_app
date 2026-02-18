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
    // Registramos todos los iconos necesarios para la interfaz
    addIcons({ storefrontOutline, informationCircleOutline, locationOutline, navigateOutline });
  }

  async ngOnInit() {
    try {
      // Obtenemos la ubicación actual para calcular distancias
      const coords = await this.locationService.getPosition();
      this.miLat = coords.latitude;
      this.miLng = coords.longitude;
    } catch (e) {
      console.warn('GPS no disponible, usando Sevilla por defecto', e);
      this.miLat = 37.3891; 
      this.miLng = -5.9845;
    }
    
    await this.cargarChollos();
  }

  async cargarChollos() {
    try {
      const res = await this.supabaseService.getChollos();
      const data = (res as any).data || res;
      
      if (data && Array.isArray(data)) {
        this.listadoChollos = data.map(c => {
          if (c.lat && c.lng) {
            // Usamos la fórmula centralizada en el servicio para evitar repetir código
            const d = this.locationService.calcularDistancia(this.miLat, this.miLng, c.lat, c.lng);
            return { ...c, distanciaKM: d.toFixed(1) };
          }
          return { ...c, distanciaKM: '?' };
        });

        // Ordenamos la lista para mostrar primero los chollos más cercanos
        this.listadoChollos.sort((a, b) => {
          if (a.distanciaKM === '?') return 1;
          if (b.distanciaKM === '?') return -1;
          return parseFloat(a.distanciaKM) - parseFloat(b.distanciaKM);
        });

        this.filtrados = [...this.listadoChollos];

        // Iniciamos la vigilancia una vez que los datos están cargados
        if (this.listadoChollos.length > 0) {
          this.locationService.iniciarVigilancia(this.listadoChollos);
        }
      }
    } catch (error) {
      console.error('Error al cargar los chollos:', error);
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
    const label = encodeURI(chollo.titulo);

    // Corregida la sintaxis de la URL de Google Maps para que sea funcional
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    const appleMapsUrl = `maps://maps.apple.com/?daddr=${lat},${lng}&q=${label}`;

    // Abrimos la app de mapas externa según el sistema operativo
    if (navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
      window.open(appleMapsUrl, '_system');
    } else {
      window.open(googleMapsUrl, '_system');
    }
  }
}