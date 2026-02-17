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
    // Llamamos a Supabase
    const respuesta = await this.supabase.getChollos(); 
    
  // Si tu servicio devuelve directamente el array de chollos:
    if (respuesta && Array.isArray(respuesta)) {
      this.chollos = respuesta;
      this.pintarMarcadores();
    } else if (respuesta && 'data' in respuesta) { 
      // Por si acaso tu servicio devuelve el objeto de Supabase
      this.chollos = (respuesta as any).data;
      this.pintarMarcadores();
    }
  }

  pintarMarcadores() {
    this.chollos.forEach(chollo => {
      // Solo pintamos si el chollo tiene coordenadas
      if (chollo.lat && chollo.lng) {
        L.marker([chollo.lat, chollo.lng])
          .addTo(this.map)
          .bindPopup(`<b>${chollo.titulo}</b><br>${chollo.precio}€`);
      }
    });
  }

  private initMap(lat: number, lng: number) {
    this.map = L.map('map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    
    // Marcador del usuario (azul)
    L.marker([lat, lng]).addTo(this.map).bindPopup('Tú estás aquí').openPopup();
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