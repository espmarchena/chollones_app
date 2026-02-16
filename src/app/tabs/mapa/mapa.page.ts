import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonContent
  ] 
})
export class MapaPage implements OnInit {
  latitud: number = 0;
  longitud: number = 0;

  constructor(private location: LocationService) {}

  async ngOnInit() {
    try {
      const coords = await this.location.getPosition();
      this.latitud = coords.latitude;
      this.longitud = coords.longitude;
      console.log('Ubicación obtenida:', this.latitud, this.longitud);
    } catch (e) {
      console.error('Error pidiendo permiso de GPS', e);
      this.latitud = 37.3891; // Coordenadas de ejemplo (Sevilla)
      this.longitud = -5.9845;
    }
  }
}