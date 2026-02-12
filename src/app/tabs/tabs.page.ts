import { Component } from '@angular/core';
import { addIcons } from 'ionicons';
import { flameOutline, gridOutline, notificationsOutline, heartOutline, personOutline, addCircle } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {

  constructor() {
    addIcons({ flameOutline, gridOutline, notificationsOutline, heartOutline, personOutline, addCircle });
  }

}
