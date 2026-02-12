import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-tab-categories',
    template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-title>Categorías</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content [fullscreen]="true" color="light">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Categorías</ion-title>
        </ion-toolbar>
      </ion-header>
      <div class="ion-padding">
        <h2>Categorías</h2>
        <p>Próximamente...</p>
      </div>
    </ion-content>
  `,
    standalone: true,
    imports: [IonicModule, CommonModule]
})
export class TabCategoriesPage { }
