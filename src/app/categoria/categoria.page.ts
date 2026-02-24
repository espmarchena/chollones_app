import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import {
  IonContent, NavController, IonButton, IonIcon, IonSpinner
} from '@ionic/angular/standalone';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.page.html',
  styleUrls: ['./categoria.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonButton, IonIcon, IonSpinner
  ],
})
export class CategoriaPage implements OnInit {
  slug = '';
  productos: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabase: SupabaseService,
    private navCtrl: NavController
  ) {addIcons({ arrowBack });}

  async ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    await this.cargarProductos();
  }

  get tituloCategoria() {
    if (!this.slug) return 'Categoría';
    const nombreLimpio = this.slug.replace(/-/g, ' '); //Reemplazamos todos los guiones por espacios
    return nombreLimpio.charAt(0).toUpperCase() + nombreLimpio.slice(1); //Ponemos la primera letra en mayúscula
  }

  async cargarProductos() {
    this.loading = true;

    try {
      // 1) Buscar categoría por slug
      const { data: cat, error: catError } = await this.supabase.client
        .from('categorias')
        .select('id, nombre, slug')
        .eq('slug', this.slug)
        .single();

      if (catError) {
        console.error('❌ Error cargando categoría:', catError);
        this.productos = [];
        return;
      }

      if (!cat?.id) {
        console.warn('⚠️ No se encontró la categoría:', this.slug);
        this.productos = [];
        return;
      }

      const categoriaId = cat.id;
      console.log('✅ Categoría encontrada. ID:', categoriaId);

      // 2) Buscar chollos por categoria_id
      const { data: chollos, error: chollosError } = await this.supabase.client
        .from('chollos')
        .select('*, proveedores(nombre, logo)')
        .eq('categoria_id', categoriaId)
        .order('created_at', { ascending: false });

      if (chollosError) {
        console.error('❌ Error cargando chollos:', chollosError);
        this.productos = [];
        return;
      }

      this.productos = chollos ?? [];
      console.log('✅ Chollos cargados:', this.productos.length);

    } catch (error) {
      console.error('🔥 Error crítico:', error);
      this.productos = [];
    } finally {
      this.loading = false;
    }
  }

  irADetalle(id: string) {
    console.log('Navegando al detalle desde categoría:', id);
    this.router.navigate(['/tabs/producto', id]);
  }

    volverAtras() {
    this.navCtrl.back();
  }
}
