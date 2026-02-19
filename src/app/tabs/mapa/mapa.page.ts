import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import * as L from 'leaflet';
import { LocationService } from '../../services/location.service';
import { SupabaseService } from '../../services/supabase.service'; // Importa tu servicio

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent]
})
export class MapaPage implements OnInit {
  map!: L.Map;
  chollos: any[] = []; // Aquí guardaremos los datos de Supabase

  constructor(
    private location: LocationService,
    private supabase: SupabaseService // Inyectamos Supabase
  ) {}

  async ngOnInit() {
    await this.configurarIconos(); // Arregla los errores 404 de los iconos
    
    try {
      // 1. Obtener ubicación del usuario
      const coords = await this.location.getPosition();
      this.initMap(coords.latitude, coords.longitude);
    } catch (e) {
      console.error('Error GPS, usando por defecto', e);
      this.initMap(37.3891, -5.9845); // Sevilla por defecto
    }

    // 2. Cargar chollos reales de la base de datos
    await this.obtenerChollos();
  }

async obtenerChollos() {
  try {
    // 1. Obtenemos la respuesta completa sin desestructurar {}
    const respuesta = await this.supabase.getChollos(); 
    
    // 2. Si la respuesta es nula o indefinida, abortamos
    if (!respuesta) {
      console.warn('No se recibió respuesta de Supabase en el mapa');
      return;
    }

    // 3. Extraemos los datos de forma segura
    // Esto evita el error "Cannot destructure property data"
    const data = (respuesta as any).data || (Array.isArray(respuesta) ? respuesta : null);
    
    if (data && Array.isArray(data)) {
      this.chollos = data;
      this.pintarMarcadores();
    }
  } catch (e) {
    console.error("Error final en mapa:", e);
  }
}

pintarMarcadores() {
  this.chollos.forEach(chollo => {
    if (chollo.lat && chollo.lng) {
      
      // 1. Extraemos el nombre del proveedor de forma segura
      // (Supabase lo devuelve dentro de un objeto 'proveedores')
      const nombreProveedor = chollo.proveedores?.nombre || 'Proveedor desconocido';
      
      // 2. Usamos el precio correcto (asegúrate si es precio o precio_actual en tu base de datos)
      const precio = chollo.precio_actual || chollo.precio || 0;

      // 3. Añadimos el proveedor al HTML del popup
      L.marker([chollo.lat, chollo.lng])
        .addTo(this.map)
        .bindPopup(`
          <div style="text-align: center;">
            <b style="font-size: 14px;">${chollo.titulo}</b><br>
            <span style="color: #666; font-size: 12px;">${nombreProveedor}</span><br>
            <b style="color: var(--ion-color-secondary); font-size: 14px;">${precio}€</b>
          </div>
        `);
    }
  });
}

private initMap(lat: number, lng: number) {
  const mapOptions: any = {
    tap: false,
    wheelDebounceTime: 150
  };

  this.map = L.map('map', mapOptions).setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
    
    L.marker([lat, lng]).addTo(this.map).bindPopup('Tú estás aquí').openPopup();

    // Forzamos un re-cálculo del tamaño para que no se vea el mapa gris o bloqueado
    setTimeout(() => {
      this.map.invalidateSize();
    }, 500);
  }

  private configurarIconos() {
    // Fix para que los iconos de Leaflet no den error 404
    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }
}