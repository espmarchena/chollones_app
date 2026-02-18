import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonSearchbar
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  heartOutline,
  personOutline,
  bagOutline,
  flameOutline,
  gridOutline,
  notificationsOutline,
  locationOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel
  ]
})
export class TabsPage {
  constructor() {
    addIcons({
      heartOutline,
      personOutline,
      bagOutline,
      flameOutline,
      gridOutline,
      notificationsOutline,
      locationOutline
    });
  }
}
