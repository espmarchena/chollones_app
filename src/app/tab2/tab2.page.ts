import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonCard, IonText
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink, // ✅ IMPORTANTE
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonGrid, IonRow, IonCol, IonCard, IonText
  ],
})
export class Tab2Page {
  categorias = [
    { nombre: 'Belleza', slug: 'belleza', img: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png', color: '#FFEFEF' },
    { nombre: 'Moda', slug: 'moda', img: 'https://cdn-icons-png.flaticon.com/512/892/892458.png', color: '#EFFFFE' },
    { nombre: 'Mascotas', slug: 'mascotas', img: 'https://cdn-icons-png.flaticon.com/512/616/616408.png', color: '#F0FFEF' },
    { nombre: 'Cocina', slug: 'cocina', img: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png', color: '#FEFFEF' },
    { nombre: 'Marketing', slug: 'marketing', img: 'https://cdn-icons-png.flaticon.com/512/3135/3135683.png', color: '#EFEFFF' },
    { nombre: 'Juguetes', slug: 'juguetes', img: 'https://cdn-icons-png.flaticon.com/512/3082/3082060.png', color: '#FFF6EF' },
    { nombre: 'Digitalizacion', slug: 'digitalizacion', img: 'https://cdn-icons-png.flaticon.com/512/1006/1006363.png', color: '#e6f7ff' },
  ];
}
