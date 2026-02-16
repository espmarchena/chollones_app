import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';

import * as L from 'leaflet';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent],
})
export class MapaPage {
  private map?: L.Map;
  private userMarker?: L.Marker;
  private storeLayer?: L.LayerGroup;

  private stores = [
    { id: 1, name: 'Tienda Centro', lat: 36.6850, lng: -6.1260 },
    { id: 2, name: 'Tienda Norte',  lat: 36.7000, lng: -6.1200 },
    { id: 3, name: 'Tienda Sur',    lat: 36.6700, lng: -6.1400 },
  ];

  async ionViewDidEnter() {
    // Si ya existe, no lo vuelvas a crear
    if (this.map) {
      setTimeout(() => this.map?.invalidateSize(), 200);
      return;
    }

    this.fixLeafletIcons();
    this.initMap();

    setTimeout(() => this.map?.invalidateSize(), 200);

    await this.tryLocateUser();
    this.renderStores();

    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  ionViewWillLeave() {
    // ✅ CLAVE: destruye el mapa para que no tape otros tabs
    try {
      this.map?.off();
      this.map?.remove();
    } catch {}

    this.map = undefined;
    this.userMarker = undefined;
    this.storeLayer = undefined;
  }

  private initMap() {
    const start = { lat: 36.6850, lng: -6.1260 };

    this.map = L.map('map', {
      zoomControl: true,
      tap: false,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
    } as any).setView([start.lat, start.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.storeLayer = L.layerGroup().addTo(this.map);
  }

  private async tryLocateUser() {
    if (!this.map) return;

    try {
      const pos = await this.getBrowserLocation();
      const userLatLng: [number, number] = [pos.lat, pos.lng];

      this.map.setView(userLatLng, 14);

      this.userMarker?.remove();
      this.userMarker = L.marker(userLatLng, { title: 'Tu ubicación' })
        .addTo(this.map)
        .bindPopup('Estás aquí')
        .openPopup();

      L.circle(userLatLng, { radius: pos.accuracy }).addTo(this.map);
    } catch {}
  }

  private renderStores() {
    if (!this.map || !this.storeLayer) return;

    this.storeLayer.clearLayers();

    this.stores.forEach((s) => {
      L.marker([s.lat, s.lng], { title: s.name })
        .addTo(this.storeLayer!)
        .bindPopup(`<b>${s.name}</b>`);
    });
  }

  private getBrowserLocation(): Promise<{ lat: number; lng: number; accuracy: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));

      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
        (e) => reject(e),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  private fixLeafletIcons() {
    const iconRetinaUrl = 'assets/leaflet/marker-icon-2x.png';
    const iconUrl = 'assets/leaflet/marker-icon.png';
    const shadowUrl = 'assets/leaflet/marker-shadow.png';

    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });
  }
}
