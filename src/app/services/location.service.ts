import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({ providedIn: 'root' })
export class LocationService {
  async getPosition() {
    const coordinates = await Geolocation.getCurrentPosition();
    return coordinates.coords;
  }
}