import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import * as L from 'leaflet';
import { LocationService } from '../../services/location.service';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';

import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent]
})
export class MapaPage implements OnInit {
  map!: L.Map;
  chollos: any[] = [];

  // Usuario + radio
  userMarker?: L.Marker;
  userCircle?: L.Circle;
  watchId?: string;

  // ✅ Config pedida
  RADIUS_METERS = 500;               // 500m
  COOLDOWN_MS = 20 * 60 * 1000;      // 20 min sin repetir el mismo chollo
  notified = new Map<string, number>();

  constructor(
    private location: LocationService,
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.configurarIconos();

    // Permisos notificaciones
    await LocalNotifications.requestPermissions();

    // (Opcional) abrir detalle al tocar notificación
(LocalNotifications as any).addListener('localNotificationActionPerformed', (event: any) => {
  const id = event?.notification?.extra?.cholloId;
  if (id) this.irADetalle(String(id));
});

    try {
      const coords = await this.location.getPosition();
      this.initMap(coords.latitude, coords.longitude);
    } catch (e) {
      console.error('Error GPS, usando por defecto', e);
      this.initMap(37.3891, -5.9845);
    }

    // Cargar chollos de Supabase
    await this.obtenerChollos();

    // ✅ Seguir ubicación siempre + notificar por radio
    await this.startTracking();
  }

  ionViewWillLeave() {
    if (this.watchId) Geolocation.clearWatch({ id: this.watchId });
  }

  async obtenerChollos() {
    try {
      const respuesta = await this.supabase.getChollos();

      if (!respuesta) {
        console.warn('No se recibió respuesta de Supabase en el mapa');
        return;
      }

      const data = (respuesta as any).data || (Array.isArray(respuesta) ? respuesta : null);

      if (data && Array.isArray(data)) {
        this.chollos = data;
        this.pintarMarcadores();
      }
    } catch (e) {
      console.error('Error final en mapa:', e);
    }
  }

  pintarMarcadores() {
    this.chollos.forEach(chollo => {
      const latitud = chollo.proveedores?.lat;
      const longitud = chollo.proveedores?.lng;

      if (latitud && longitud) {
        const nombreProveedor = chollo.proveedores?.nombre || 'Proveedor desconocido';
        const precio = chollo.precio_actual || chollo.precio || 0;

        const popupContent = document.createElement('div');
        popupContent.style.textAlign = 'center';

        popupContent.innerHTML = `
          <div class="map-popup-container">
            <b class="popup-title">${chollo.titulo}</b>
            <span class="popup-vendor">${nombreProveedor}</span>
            <b class="popup-price">${precio}€</b>
            <button class="popup-btn">Ver Oferta</button>
          </div>
        `;

        const btn = popupContent.querySelector('.popup-btn');
        btn?.addEventListener('click', () => this.irADetalle(chollo.id));

        L.marker([latitud, longitud])
          .addTo(this.map)
          .bindPopup(popupContent);
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

    // ✅ Guardamos marker del usuario (para reutilizar en tracking)
    this.userMarker = L.marker([lat, lng])
      .addTo(this.map)
      .bindPopup('Tú estás aquí')
      .openPopup();

    // ✅ Círculo del radio 500m
    this.userCircle = L.circle([lat, lng], { radius: this.RADIUS_METERS }).addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 500);
  }

  private configurarIconos() {
    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  // ✅ Tracking continuo + mapa te sigue siempre (panTo)
  async startTracking() {
    await Geolocation.requestPermissions();

    this.watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true, maximumAge: 1500, timeout: 10000 },
      (pos, err) => {
        if (err || !pos) return;

        const { latitude, longitude } = pos.coords;
        const latlng: [number, number] = [latitude, longitude];

        // Marker usuario
        if (!this.userMarker) {
          this.userMarker = L.marker(latlng).addTo(this.map).bindPopup('Tú estás aquí');
        } else {
          this.userMarker.setLatLng(latlng);
        }

        // Círculo radio
        if (!this.userCircle) {
          this.userCircle = L.circle(latlng, { radius: this.RADIUS_METERS }).addTo(this.map);
        } else {
          this.userCircle.setLatLng(latlng);
          this.userCircle.setRadius(this.RADIUS_METERS);
        }

        // ✅ mapa te sigue siempre
        this.map.panTo(latlng, { animate: true });

        // ✅ comprobar chollos cercanos y notificar
        this.checkChollosCerca(latitude, longitude);
      }
    );
  }

  distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
    const R = 6371000;
    const toRad = (v: number) => (v * Math.PI) / 180;

    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);

    const lat1 = toRad(aLat);
    const lat2 = toRad(bLat);

    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(x));
  }

  async checkChollosCerca(userLat: number, userLng: number) {
    if (!this.chollos?.length) return;

    const now = Date.now();

    for (const chollo of this.chollos) {
      const lat = chollo.proveedores?.lat;
      const lng = chollo.proveedores?.lng;
      if (!lat || !lng) continue;

      const d = this.distanceMeters(userLat, userLng, lat, lng);
      if (d > this.RADIUS_METERS) continue;

      const id = String(chollo.id);
      const last = this.notified.get(id) ?? 0;
      if (now - last < this.COOLDOWN_MS) continue;

      this.notified.set(id, now);

      const nombre = chollo.titulo ?? 'Chollo cerca';
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 1000000),
            title: '🔥 Chollo cerca de ti',
            body: `${nombre} a ${Math.round(d)}m`,
            extra: { cholloId: id }
          }
        ]
      });
    }
  }

  irADetalle(id: string) {
    console.log('Navegando al chollo desde el mapa:', id);
    this.router.navigate(['/tabs/producto', id]);
  }
}