import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/auth.service';
import { ConnectivityService } from '../services/connectivity.service';
import jwtDecode from 'jwt-decode';
import { ISession } from '../interfaces/session.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthenticationService, private connectivityService: ConnectivityService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // console.log('AuthGuard verificando acceso a:', state.url);

    // Evitar redirección infinita si ya estamos en la página de login
    if (state.url.includes('/auth/login')) {
      // console.log('Guard: Ya estamos en la página de login, acceso permitido');
      return true;
    }

    // Verificar si hay un token directo en localStorage
    const directToken = localStorage.getItem('userToken');
    // console.log('Guard: Verificando token en localStorage:', directToken);
    // console.log('Guard: Verificando sesión en authService:', this.authService.getSession());
    // console.log('Guard: Estado del servidor desde connectivityService:', this.connectivityService.isConnected());

    // Validar si el token está presente pero no se ha decodificado correctamente
    if (directToken && !this.authService.getSession()) {
      console.warn('Guard: Token presente pero sesión no válida, intentando decodificar nuevamente.');
      try {
        const decoded = this.decodeTokenString(directToken);
        // console.log('Guard: Token decodificado exitosamente:', decoded);
        this.authService.setSession(directToken);
        return true;
      } catch (error) {
        console.error('Guard: Error al decodificar token directo:', error);
        localStorage.removeItem('userToken');
      }
    }

    // Verificar la sesión estándar
    // console.log('Guard: Verificando sesión en authService:', this.authService.getSession());
    const session = this.authService.getSession();
    if (session && session.token) {
      try {
        const decoded = this.decodeToken(session);
        if (decoded.exp < new Date().getTime() / 1000) {
          // console.log('Guard: Token expirado');
          localStorage.setItem('sessionError', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          return this.redirectToLogin(state);
        }
        // console.log('Guard: Token válido, acceso permitido');
        return true;
      } catch (error) {
        console.error('Guard: Error al decodificar token:', error);
        return this.redirectToLogin(state);
      }
    }

    // Verificar estado del servidor antes de redirigir
    // console.log('Guard: Estado del servidor desde connectivityService:', this.connectivityService.isConnected());
    const serverStatus = this.connectivityService.isConnected();
    if (!serverStatus) {
      // console.log('Guard: Servidor no disponible, redirigiendo a login');
      return this.redirectToLogin(state);
    }

    // console.log('Guard: No hay sesión ni token válido, redirigiendo a login');
    return this.redirectToLogin(state);
  }

  redirectToLogin(state: RouterStateSnapshot): boolean {
    // Guardar la URL para redirigir después del login
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  decodeToken(session: ISession): any {
    if (!session.token) {
      throw new Error('Token no disponible');
    }
    
    return jwtDecode(session.token);
  }
  
  // Método separado para decodificar directamente un string de token
  decodeTokenString(token: string): any {
    if (!token) {
      throw new Error('Token no disponible');
    }
    
    return jwtDecode(token);
  }
}
