import { Component, OnInit } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, 
  IonCardContent, IonButton, IonIcon, IonBadge, IonButtons
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { searchOutline } from 'ionicons/icons';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, 
    IonCardContent, IonButton, IonButtons, IonIcon, 
    IonBadge,CommonModule
  ],
})
export class Tab1Page implements OnInit {
  chollos: any[] = [];

  constructor(private supabaseService: SupabaseService) {
    addIcons({ searchOutline });
  }

  async ngOnInit() {
    try {
      this.chollos = await this.supabaseService.getChollos();
    } catch (error) {
      console.error('Error cargando chollos:', error);
    }
  }
}