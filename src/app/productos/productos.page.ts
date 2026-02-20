import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonButton, IonIcon,
  IonChip, IonLabel, IonText, IonSpinner,
  IonAccordionGroup, IonAccordion, IonItem,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle
} from '@ionic/angular/standalone';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import { heartOutline, heart, flagOutline } from 'ionicons/icons';

import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-producto',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonButton, IonIcon,
    IonChip, IonLabel, IonText, IonSpinner,
    IonAccordionGroup, IonAccordion, IonItem,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle
  ],
})
export class ProductoPage implements OnInit {
  private route = inject(ActivatedRoute);
  private supabase = inject(SupabaseService);
  private sanitizer = inject(DomSanitizer);

  loading = true;

  producto: any = null;
  descripcionSafe: SafeHtml | null = null;

  enWishlist = false;
  similares: any[] = [];

  constructor() {
    addIcons({ heartOutline, heart, flagOutline });
  }

  async ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
  if (!id) return;

  try {
    this.loading = true;

    this.producto = await this.supabase.getCholloById(id);
    if (!this.producto) return;

    // descripción (es texto, pero lo pintamos igual)
    const html = this.producto?.descripcion || '';
    this.descripcionSafe = this.sanitizer.bypassSecurityTrustHtml(html);

    // similares (primero por categoría, si no por proveedor)
    const categoriaId = this.producto?.categoria_id ?? null;
    const proveedorId = this.producto?.proveedor_id ?? null;

    this.similares = await this.supabase.getChollosSimilares({
      categoriaId,
      proveedorId,
      excludeId: id,
      limit: 10,
    });
  } catch (e) {
    console.error('Error cargando chollo:', e);
  } finally {
    this.loading = false;
  }
}

  toggleWishlist() {
    this.enWishlist = !this.enWishlist;
    // Aquí luego guardas en Supabase (tabla wishlist) o storage local
  }

  denunciarAbuso() {
    // Aquí abres modal / navegas / envías formulario
    console.log('Denunciar abuso');
  }
}