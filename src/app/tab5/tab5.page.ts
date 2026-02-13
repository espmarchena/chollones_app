import { Component } from '@angular/core';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonIcon, 
  IonAvatar, 
  IonButton,
  IonButtons // <-- IMPORTANTE: Añade esto para corregir el error NG8001
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personCircleOutline, 
  settingsOutline, 
  logOutOutline, 
  chevronForwardOutline,
  notificationsOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonList, IonItem, IonLabel, IonIcon, IonAvatar, IonButton,
    IonButtons // <-- También añádelo aquí
  ],
})
export class Tab5Page {
  constructor() {
    addIcons({ 
      personCircleOutline, 
      settingsOutline, 
      logOutOutline, 
      chevronForwardOutline,
      notificationsOutline,
      shieldCheckmarkOutline
    });
  }
}