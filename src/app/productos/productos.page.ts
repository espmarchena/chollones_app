import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular/standalone';
import { arrowBack, heart, heartOutline } from 'ionicons/icons'; // Añadidos corazones
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ProductosPage implements OnInit {
  producto: any;
  esFavorito: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private supabase: SupabaseService,
    private navCtrl: NavController
  ) {
    //Registramos los iconos para que se vean en el HTML
    addIcons({ arrowBack, heart, heartOutline });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const { data } = await this.supabase.client
        .from('chollos')
        .select('*, proveedores(*)') 
        .eq('id', id)
        .single();
      
      this.producto = data;

      //Una vez cargado el producto, verificamos si es favorito
      if (this.producto) {
        await this.comprobarSiEsFavorito();
      }
    }
  }

  //Función para comprobar el estado inicial en la tabla 'guardados'
  async comprobarSiEsFavorito() {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) return;

      const { data } = await this.supabase.client
        .from('guardados')
        .select('id')
        .eq('chollo_id', this.producto.id)
        .eq('usuario_temp_id', user.id)
        .maybeSingle(); // Usamos maybeSingle para que no de error si no existe

      this.esFavorito = !!data; // true si existe, false si no
    } catch (error) {
      console.error('Error al comprobar favorito:', error);
    }
  }

  //Función para añadir o quitar de la base de datos
  async toggleFavorito() {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      
      if (!user) {
        alert('Debes iniciar sesión para guardar favoritos');
        return;
      }

      if (this.esFavorito) {
        // Si ya es favorito, lo eliminamos
        await this.supabase.client
          .from('guardados')
          .delete()
          .eq('chollo_id', this.producto.id)
          .eq('usuario_temp_id', user.id);
        
        this.esFavorito = false;
      } else {
        // Si no es favorito, lo insertamos
        await this.supabase.client
          .from('guardados')
          .insert({ 
            chollo_id: this.producto.id, 
            usuario_temp_id: user.id 
          });
        
        this.esFavorito = true;
      }
    } catch (error) {
      console.error('Error en toggleFavorito:', error);
    }
  }

  volverAtras() {
    this.navCtrl.back();
  }

  //función para añadir al carrito
  async anadirAlCarrito() {
    if (!this.producto) return;

    try {
      // 1. Llamada al servicio
      await this.supabase.anadirAlCarrito(this.producto.id, 1);

      // 2. Mostrar el aviso (Toast) con el estilo que creamos
      import('@ionic/angular/standalone').then(async ({ ToastController }) => {
        const toastCtrl = new ToastController();
        const toast = await toastCtrl.create({
          message: 'Producto añadido al carrito',
          duration: 2000,
          position: 'top',
          cssClass: 'toast-carrito' // Usa la clase CSS global que ya tenemos
        });
        toast.present();
      });

    } catch (e) {
      console.error('Error al añadir al carrito', e);
      import('@ionic/angular/standalone').then(async ({ ToastController }) => {
        const toastCtrl = new ToastController();
        const toast = await toastCtrl.create({
          message: 'Error al añadir. ¿Iniciaste sesión?',
          duration: 3000,
          position: 'top',
          cssClass: 'toast-carrito'
        });
        toast.present();
      });
    }
  }

}