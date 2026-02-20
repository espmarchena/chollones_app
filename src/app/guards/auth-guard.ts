import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service'; // Asegúrate que la ruta sea correcta
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  // Inyectamos los servicios (estilo moderno de Angular)
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  return supabase.currentUser$.pipe(
    take(1), // Toma solo el valor actual y cierra la suscripción
    map(user => {
      if (user) {
        // Si existe el usuario, DEJA PASAR
        return true;
      } else {
        // Si es null, BLOQUEA y redirige al Login
        console.log('Acceso denegado: Usuario no logueado');
        router.navigate(['/tabs/login']);
        return false;
      }
    })
  );
};