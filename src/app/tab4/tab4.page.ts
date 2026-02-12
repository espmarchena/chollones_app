import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonThumbnail, 
  IonLabel, 
  IonBadge, 
  IonSearchbar,
  IonIcon
} from '@ionic/angular/standalone';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonList, 
    IonItem, 
    IonThumbnail, 
    IonLabel, 
    IonBadge, 
    IonSearchbar,
    IonIcon
  ]
})
export class Tab4Page implements OnInit {
  listadoChollos: any[] = [];
  filtrados: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.cargarChollos();
  }

  async cargarChollos() {
    try {
      // Obtenemos los datos reales de tu tabla 'chollos'
      const res = await this.supabaseService.getChollos(); 
      this.listadoChollos = res;
      this.filtrados = [...res];
    } catch (error) {
      console.error('Error cargando chollos en Tab 4:', error);
    }
  }

  // Esta función es la que te daba error en la consola (Imagen 1b19dd.jpg)
  calcDescuento(chollo: any): number {
    const actual = Number(chollo?.precio_actual || 0);
    const original = Number(chollo?.precio_original || 0);
    
    if (!actual || !original || original <= actual) {
      return 0;
    }
    
    return Math.round(((original - actual) / original) * 100);
  }

  buscar(event: any) {
    const texto = (event.target.value || '').toLowerCase().trim();
    
    if (!texto) {
      this.filtrados = [...this.listadoChollos];
      return;
    }

    this.filtrados = this.listadoChollos.filter(c => 
      c.titulo.toLowerCase().includes(texto) || 
      c.proveedores?.nombre?.toLowerCase().includes(texto)
    );
  }
}