import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service';
import { addIcons } from 'ionicons';
import {
  desktopOutline,
  shirtOutline,
  homeOutline,
  colorPaletteOutline,
  appsOutline,
  arrowForwardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tab-categories',
  templateUrl: './tab-categories.page.html',
  styleUrls: ['./tab-categories.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class TabCategoriesPage implements OnInit {
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
      arrowForwardOutline
    });
  }

  async ngOnInit() {
    try {
      this.categorias = await this.supabaseService.getCategorias();

      // Load first category by default if available
      if (this.categorias.length > 0) {
        this.selectCategory(this.categorias[0].id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async selectCategory(id: string) {
    this.selectedCategoryId = id;
    try {
      this.chollos = await this.supabaseService.getChollosPorCategoria(id);
    } catch (error) {
      console.error('Error fetching deals by category:', error);
      this.chollos = [];
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
