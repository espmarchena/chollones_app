import { Routes } from '@angular/router';
// Aseg├║rate de que el nombre del archivo coincida (auth.guard o auth-guard)
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  // 1. RUTA P├ÜBLICA: Login
  // Es fundamental tener esta ruta para que el Guard tenga a d├│nde redirigir si no hay usuario.
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },

  // 2. RUTAS PROTEGIDAS: Tabs
  // Al poner el canActivate aqu├¡, proteges TODAS las pesta├▒as de golpe.
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    // canActivate: [authGuard],
    children: [
      { path: 'tab1', loadComponent: () => import('./tab1/tab1.page').then((m) => m.Tab1Page) },
      { path: 'tab2', loadComponent: () => import('./tab2/tab2.page').then((m) => m.Tab2Page) },
      { path: 'tab3', loadComponent: () => import('./tab3/tab3.page').then((m) => m.Tab3Page) },
      { path: 'tab4', loadComponent: () => import('./tab4/tab4.page').then((m) => m.Tab4Page) },
      { path: 'tab5', loadComponent: () => import('./tab5/tab5.page').then((m) => m.Tab5Page) },

      // Ô£à MAPA AQU├ì
      { path: 'mapa', loadComponent: () => import('./tabs/mapa/mapa.page').then((m) => m.MapaPage) },

      // Ô£à EDITAR PERFIL
      { path: 'editar-perfil', loadComponent: () => import('./editar-perfil/editar-perfil.page').then((m) => m.EditarPerfilPage) },

      // Ô£à MIS ALERTAS
      { path: 'mis-alertas', loadComponent: () => import('./mis-alertas/mis-alertas.page').then((m) => m.MisAlertasPage) },

      { path: '', redirectTo: '/tabs/tab1', pathMatch: 'full' },
    ],
  },


  // 3. RUTA POR DEFECTO
  // Intentamos enviar al usuario a los tabs.
  // El Guard interceptar├í esto:
  // - Si est├í logueado -> Entra a Tab1
  // - Si NO est├í logueado -> El Guard lo manda a /login
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },

];
