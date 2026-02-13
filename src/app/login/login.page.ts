import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule] // <--- IMPORTANTE: Necesario para que funcione el HTML
})
export class LoginPage implements OnInit {
  email = '';
  password = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
  }

  async handleLogin() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    const { error } = await this.supabase.signIn(this.email, this.password);
    await loading.dismiss();

    if (error) {
      this.showAlert('Error', error.message);
    } else {
      // Te redirijo a los TABS que configuramos en tus rutas
      this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
    }
  }

  async handleSignUp() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    const { error } = await this.supabase.signUp(this.email, this.password);
    await loading.dismiss();

    if (error) {
      this.showAlert('Error', error.message);
    } else {
      this.showAlert('Registro exitoso', 'Por favor, verifica tu correo electrónico (si tienes confirmación activada) o inicia sesión.');
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}