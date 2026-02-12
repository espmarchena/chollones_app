import { Component } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonText 
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, 
    IonContent, IonGrid, IonRow, IonCol, IonCard, IonText
  ],
})
export class Tab2Page {
  // Estos son los datos exactos que tenías en el repo de espmarchena
  categorias = [
    { nombre: 'Belleza', img: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png', color: '#FFEFEF' },
    { nombre: 'Moda', img: 'https://cdn-icons-png.flaticon.com/512/892/892458.png', color: '#EFFFFE' },
    { nombre: 'Mascotas', img: 'https://cdn-icons-png.flaticon.com/512/616/616408.png', color: '#F0FFEF' },
    { nombre: 'Cocina', img: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png', color: '#FEFFEF' },
    { nombre: 'Marketing', img: 'https://cdn-icons-png.flaticon.com/512/3135/3135683.png', color: '#EFEFFF' },
    { nombre: 'Juguetes', img: 'https://cdn-icons-png.flaticon.com/512/3082/3082060.png', color: '#FFF6EF' },
  ];

  constructor() {}
}