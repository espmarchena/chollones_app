import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ProductosPage implements OnInit {
  producto: any;

  constructor(
    private route: ActivatedRoute,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const { data } = await this.supabase.client
        .from('chollos')
        .select('*, proveedores(*)') // Traemos el producto y su tienda
        .eq('id', id)
        .single();
      
      this.producto = data;
    }
  }
}