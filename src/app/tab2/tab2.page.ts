import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { camera } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab2Page {

  deal = {
    title: '',
    description: '',
    price: null,
    originalPrice: null,
    url: '',
    imageUrl: '',
    store: '',
    status: 'active'
  };

  constructor() {
    addIcons({ camera });
  }

  onSubmit() {
    console.log('Deal to publish:', this.deal);
    // Here you would typically call a service to save the deal
  }
}
