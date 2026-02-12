import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service';
import { addIcons } from 'ionicons';
import {
  desktopOutline,
  shirtOutline,
  homeOutline,
  colorPaletteOutline,
  appsOutline,
  arrowForwardOutline,
  heart,
  heartOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tab-categories',
  templateUrl: './tab-categories.page.html',
  styleUrls: ['./tab-categories.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class TabCategoriesPage implements OnInit, ViewWillEnter {
  categorias: any[] = [];
  chollos: any[] = [];
  selectedCategoryId: string | null = null;

  constructor(private supabaseService: SupabaseService) {
    addIcons({
      desktopOutline,
      shirtOutline,
      homeOutline,
      colorPaletteOutline,
      appsOutline,
      arrowForwardOutline,
      heart,
      heartOutline
    });
  }

  async ngOnInit() {
    try {
      this.categorias = await this.supabaseService.getCategorias();
      if (this.categorias.length > 0) {
        this.selectCategory(this.categorias[0].id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  ionViewWillEnter() {
    // this.supabaseService.loadFavorites(); // Removed
    this.supabaseService.favorites$.subscribe(favorites => {
      this.favoritesSet = favorites;
      this.applyFavorites();
    });
  }

  async selectCategory(id: string) {
    this.selectedCategoryId = id;
    try {
      const categoryDeals = await this.supabaseService.getChollosPorCategoria(id);

      this.chollos = categoryDeals.map((deal: any) => ({
        ...deal,
        isFavorite: false
      }));

      this.applyFavorites();

    } catch (error) {
      console.error('Error fetching deals by category:', error);
      this.chollos = [];
    }
  }

  private favoritesSet = new Set<string>();

  applyFavorites() {
    this.chollos.forEach(deal => {
      deal.isFavorite = this.favoritesSet.has(String(deal.id));
    });
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

  getCategoryIcon(nombre: string): string {
    const nameLower = nombre.toLowerCase();
    if (nameLower.includes('electrónica')) return 'desktop-outline';
    if (nameLower.includes('moda')) return 'shirt-outline';
    if (nameLower.includes('hogar')) return 'home-outline';
    if (nameLower.includes('estética') || nameLower.includes('belleza')) return 'color-palette-outline';
    return 'apps-outline';
  }
}
