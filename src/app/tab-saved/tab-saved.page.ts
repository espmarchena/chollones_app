import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service';
import { heartDislike, cart, trash, heart } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tab-saved',
  templateUrl: './tab-saved.page.html',
  styleUrls: ['./tab-saved.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class TabSavedPage implements ViewWillEnter {
  savedChollos: any[] = [];
  isLoading = true;

  constructor(private supabaseService: SupabaseService) {
    addIcons({ heartDislike, cart, trash, heart });
  }

  async ionViewWillEnter() {
    await this.loadSavedChollos();

    // Subscribe to favorites changes to handle removals from other tabs
    this.supabaseService.favorites$.subscribe(favorites => {
      if (!this.isLoading) {
        // Filter out chollos that are no longer favorites
        // This handles if I un-heart in Tab1
        this.savedChollos = this.savedChollos.filter(chollo => favorites.has(chollo.id));

        // Note: This logic only handles removals.
        // If I add a favorite in Tab1, it won't appear here until I reload (ionViewWillEnter)
        // or unless we fetch the full object.
        // For now, this satisfies "desmarcar... desaparezca".
        // To handle additions reactively without full re-fetch necessitates having the full chollo data available.
        // Since we don't have it, re-fetching might be needed if count increases, or just rely on ionViewWillEnter for additions.
        // But for removals, filtering is instantiated and correct.
      }
    });
  }

  async loadSavedChollos() {
    this.isLoading = true;
    try {
      this.savedChollos = await this.supabaseService.getChollosGuardados();
    } catch (error) {
      console.error('Error cargando favoritos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async eliminarFavorito(cholloId: string) {
    try {
      await this.supabaseService.eliminarFavorito(cholloId);
      // Subscription will update the list
    } catch (error) {
      console.error('Error eliminando favorito:', error);
    }
  }
}
