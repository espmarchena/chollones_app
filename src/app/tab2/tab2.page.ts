import { Component, OnInit } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, 
  IonInput, IonSelect, IonSelectOption, IonButton, IonTextarea 
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para el formulario
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, 
    IonInput, IonSelect, IonSelectOption, IonButton, IonTextarea,
    CommonModule, FormsModule
  ],
})
export class Tab2Page implements OnInit {
  // Variables para el formulario
  nuevoChollo = {
    titulo: '',
    precio_actual: 0,
    precio_original: 0,
    url: '',
    proveedor_id: '',
    punto_id: ''
  };

  nombreNuevoProveedor: string = '';

  proveedores: any[] = [];
  puntos: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    // Cargamos los datos para los selectores al abrir la pestaña
    this.proveedores = await this.supabaseService.getProveedores();
    this.puntos = await this.supabaseService.getPuntos();
  }

  async guardarProveedor() {
    if (!this.nombreNuevoProveedor) return;
    
    try {
      await this.supabaseService.insertarProveedor(this.nombreNuevoProveedor);
      alert('Proveedor añadido: ' + this.nombreNuevoProveedor);
      this.nombreNuevoProveedor = ''; // Limpiar campo
      this.proveedores = await this.supabaseService.getProveedores(); // Refrescar lista del desplegable
    } catch (error) {
      console.error(error);
      alert('Error al añadir proveedor');
    }
  }

  async guardarChollo() {
    try {
      await this.supabaseService.insertarChollo(this.nuevoChollo);
      alert('¡Chollo publicado con éxito!');
      // Limpiar formulario
      this.nuevoChollo = { titulo: '', precio_actual: 0, precio_original: 0, url: '', proveedor_id: '', punto_id: '' };
    } catch (error) {
      console.error(error);
      alert('Error al guardar');
    }
  }
}