import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { add, heart, heartOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SupabaseService } from '../services/supabase.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class Tab1Page implements ViewWillEnter {
  deals: any[] = [];

  constructor(private supabaseService: SupabaseService) {
    addIcons({ add, heart, heartOutline });
  }

  async ionViewWillEnter() {
    // Load initial data and subscriptions
    await this.loadDeals();
    // this.supabaseService.loadFavorites(); // Removed to prevent race condition/stale data overwrite

    // Subscribe to favorites changes
    this.supabaseService.favorites$.subscribe(favorites => {
      this.updateFavoritesState(favorites);
    });
  }

  async loadDeals() {
    try {
      const allDeals = await this.supabaseService.getChollos();
      const currentFavorites = this.supabaseService.getFavoritesValue();

      this.deals = allDeals.map((deal: any) => ({
        ...deal,
        isFavorite: currentFavorites.has(String(deal.id)),
        title: deal.titulo,
        store: deal.proveedores?.nombre,
        price: deal.precio_actual,
        originalPrice: deal.precio_original,
        image: deal.imagen_url,
        url: deal.enlace_oferta,
        isNew: this.checkIfNew(deal.created_at)
      }));

    } catch (error) {
      console.error('Error loading deals:', error);
    }
  }

  updateFavoritesState(favorites: Set<string>) {
    this.deals = this.deals.map(deal => ({
      ...deal,
      isFavorite: favorites.has(String(deal.id)),
    }));
  }

  checkIfNew(dateString: string): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  }

  async toggleFavorite(deal: any) {
    try {
      if (deal.isFavorite) {
        await this.supabaseService.eliminarFavorito(deal.id);
      } else {
        await this.supabaseService.guardarCholloFavorito(deal.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }
}
