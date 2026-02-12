import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-tab-notifications',
    template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-title>Notificaciones</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content [fullscreen]="true" color="light">
       <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Notificaciones</ion-title>
        </ion-toolbar>
      </ion-header>
      <div class="ion-padding">
        <h2>Notificaciones</h2>
        <p>No tienes notificaciones nuevas.</p>
      </div>
    </ion-content>
  `,
    standalone: true,
    imports: [IonicModule, CommonModule]
})
export class TabNotificationsPage { }
