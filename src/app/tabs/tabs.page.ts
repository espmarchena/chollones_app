import { Component } from '@angular/core';
import { 
  IonTabs, 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel, 
  IonRouterOutlet // 1. Debe estar aquí
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  flameOutline, gridOutline, heartOutline, notificationsOutline, personOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [
    IonTabs, 
    IonTabBar, 
    IonTabButton, 
    IonIcon, 
    IonLabel, 
    IonRouterOutlet // 2. Y DEBE estar aquí
  ],
})
export class TabsPage {
  constructor() {
    addIcons({ flameOutline, gridOutline, heartOutline, notificationsOutline, personOutline });
  }
}