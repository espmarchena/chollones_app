import { Component } from '@angular/core';
import { 
  IonTabs, 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel, 
  IonRouterOutlet 
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
    IonRouterOutlet // 
  ],
})
export class TabsPage {
  constructor() {
    addIcons({ flameOutline, gridOutline, heartOutline, notificationsOutline, personOutline });
  }
}
