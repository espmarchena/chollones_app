import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonCard, IonText
} from '@ionic/angular/standalone';

import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonGrid, IonRow, IonCol, IonCard, IonText
  ],
})
export class Tab2Page implements OnInit {
  categorias: any[] = [];
  loading = true;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.cargarCategorias();
  }

  async cargarCategorias() {
    this.loading = true;

    try {
      const hidden = ['', '', '']; //aqui escribimos los slug de las categorias que no queremos que se muestren

      const { data, error } = await this.supabase.client
        .from('categorias')
        .select('id, nombre, slug, icono')
        .not('slug', 'in', `(${hidden.join(',')})`)
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error cargando categorias:', error);
        this.categorias = [];
        return;
      }

      // Adaptamos para que tu HTML pueda seguir usando "img"
      this.categorias = (data ?? []).map(c => ({
        ...c,
        img: c.icono, // la columna en supabase se llama icono
      }));

    } finally {
      this.loading = false;
    }
  }
}
