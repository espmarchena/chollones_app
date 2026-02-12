import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-tab-profile',
    template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-title>Mi Contenido</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content [fullscreen]="true" color="light">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Mi Contenido</ion-title>
        </ion-toolbar>
      </ion-header>
      <div class="ion-padding">
        <h2>Mi Perfil</h2>
        <p>Bienvenido a tu espacio personal.</p>
      </div>
    </ion-content>
  `,
    standalone: true,
    imports: [IonicModule, CommonModule]
})
export class TabProfilePage { }
