import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import * as L from 'leaflet';
import { LocationService } from '../../services/location.service';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';

import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent]
})
export class MapaPage implements OnInit {
  map?: L.Map;
  chollos: any[] = [];

  // Usuario + radio
  userMarker?: L.Marker;
  userCircle?: L.Circle;
  watchId?: string;

  // Config
  RADIUS_METERS = 500;               // 500m
  COOLDOWN_MS = 20 * 60 * 1000;      // 20 min
  notified = new Map<string, number>();

  // Última posición (sirve para web + native)
  private lastCoords?: { lat: number; lng: number };

  constructor(
    private location: LocationService, // lo dejamos por si lo usas en otras partes
    private supabase: SupabaseService,
    private router: Router
  ) {}

async ngOnInit() {
  await this.configurarIconos();

  // Cargar chollos
  await this.obtenerChollos();

  // Mapa ya visible (fallback)
  this.createMap(37.3891, -5.9845);

  if (Capacitor.isNativePlatform()) {
    await LocalNotifications.requestPermissions();
    await Geolocation.requestPermissions();

    // ✅ Posición inicial real (centra ya)
    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });

      const { latitude, longitude } = pos.coords;
      this.updateUserUI(latitude, longitude);
      this.checkChollosCerca(latitude, longitude);
    } catch (e) {
      console.warn('No se pudo obtener ubicación inicial', e);
    }

    // ✅ Seguimiento continuo (te sigue siempre)
    await this.startTrackingNative();
  } else {
    this.startTrackingWeb();
  }


  }

  ionViewDidEnter() {
    // Recalcula tamaño al entrar en el tab (Ionic/Leaflet)
    setTimeout(() => this.map?.invalidateSize(true), 300);
  }

  ionViewWillLeave() {
    // Para de trackear en native al salir
    if (Capacitor.isNativePlatform() && this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = undefined;
    }
  }
private updateUserUI(latitude: number, longitude: number) {
  if (!this.map) return;

  const latlng: [number, number] = [latitude, longitude];

  if (!this.userMarker) {
    this.userMarker = L.marker(latlng).addTo(this.map).bindPopup('Tú estás aquí');
  } else {
    this.userMarker.setLatLng(latlng);
  }

  if (!this.userCircle) {
    this.userCircle = L.circle(latlng, { radius: this.RADIUS_METERS }).addTo(this.map);
  } else {
    this.userCircle.setLatLng(latlng);
    this.userCircle.setRadius(this.RADIUS_METERS);
  }

  this.map.setView(latlng, 16, { animate: true }); // zoom más cercano

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
      }
    } catch (e) {
      console.error('Error final en mapa:', e);
    }
  }

  pintarMarcadores() {
    if (!this.map) return;
    const map = this.map;

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
        btn?.addEventListener('click', () => this.irADetalle(String(chollo.id)));

        L.marker([latitud, longitud]).addTo(map).bindPopup(popupContent);
      }
    });
  }

  private createMap(lat: number, lng: number) {
    // Evita error: "Map container is already initialized"
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }

    const mapOptions: any = { tap: false, wheelDebounceTime: 150 };
    this.map = L.map('map', mapOptions).setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Marker usuario + círculo
    this.userMarker = L.marker([lat, lng]).addTo(this.map).bindPopup('Tú estás aquí');
    this.userCircle = L.circle([lat, lng], { radius: this.RADIUS_METERS }).addTo(this.map);

    this.pintarMarcadores();

    setTimeout(() => this.map?.invalidateSize(true), 800);
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

  // ==========================
  // ✅ TRACKING NATIVE (ANDROID/IOS)
  // ==========================
  async startTrackingNative() {
  const perm = await Geolocation.requestPermissions();
  console.log('GEO perms:', perm);

  this.watchId = await Geolocation.watchPosition(
    { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    (pos, err) => {
      if (err) {
        console.warn('watchPosition ERROR:', err);
        return;
      }
      if (!pos) {
        console.warn('watchPosition: pos null');
        return;
      }

      console.log('watchPosition POS:', pos.coords);

      const { latitude, longitude, accuracy } = pos.coords;
      this.lastCoords = { lat: latitude, lng: longitude };

      if (!this.map) this.createMap(latitude, longitude);

      this.updateUserUI(latitude, longitude);
      this.checkChollosCerca(latitude, longitude);

      // si quieres ver precisión
      console.log('accuracy:', accuracy);
    }
  );

  console.log('watchId:', this.watchId);
}
  // ==========================
  // ✅ TRACKING WEB (NAVEGADOR)
  // ==========================
  startTrackingWeb() {
    // Si el navegador soporta geolocalización
    if (!navigator.geolocation) {
      // fallback
      this.createMap(36.514677, -4.887499);
      return;
    }

    navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        this.lastCoords = { lat: latitude, lng: longitude };

        // crear mapa primera vez
        if (!this.map) {
          this.createMap(latitude, longitude);
        }

        if (!this.map) return;
        const latlng: [number, number] = [latitude, longitude];

        if (!this.userMarker) {
          this.userMarker = L.marker(latlng).addTo(this.map).bindPopup('Tú estás aquí');
        } else {
          this.userMarker.setLatLng(latlng);
        }

        if (!this.userCircle) {
          this.userCircle = L.circle(latlng, { radius: this.RADIUS_METERS }).addTo(this.map);
        } else {
          this.userCircle.setLatLng(latlng);
          this.userCircle.setRadius(this.RADIUS_METERS);
        }

        this.map.panTo(latlng, { animate: true });

        // En web NO lanzamos notificación de Capacitor (solo console log)
        this.checkChollosCercaWeb(latitude, longitude);
      },
      () => {
        // si falla la ubicación en web
        this.createMap(36.514677, -4.887499);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 1500 }
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

  // ✅ NATIVE: notificación real
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

  // ✅ WEB: no LocalNotifications, solo log
  checkChollosCercaWeb(userLat: number, userLng: number) {
    if (!this.chollos?.length) return;

    for (const chollo of this.chollos) {
      const lat = chollo.proveedores?.lat;
      const lng = chollo.proveedores?.lng;
      if (!lat || !lng) continue;

      const d = this.distanceMeters(userLat, userLng, lat, lng);
      if (d > this.RADIUS_METERS) continue;

      console.log(`(WEB) 🔥 Chollo cerca: ${chollo.titulo} a ${Math.round(d)}m`);
    }
  }

  irADetalle(id: string) {
    this.router.navigate(['/tabs/producto', id]);
  }
}