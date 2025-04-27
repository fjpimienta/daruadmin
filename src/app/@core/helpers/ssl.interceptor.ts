import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Injectable()
export class SslInterceptor implements HttpInterceptor {
  private lastLogTime = 0;
  private logInterval = 300000; // 5 minutos en milisegundos (valor predeterminado)

  constructor(private router: Router) {
    // Usar el valor configurado en environment si existe, o el valor predeterminado
    this.logInterval = environment.sslLogInterval || this.logInterval;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Solo aplicar en desarrollo y cuando la URL contenga el dominio del backend
    if (!environment.production &&
      req.url.includes('apidaru.hosting3m.com') &&
      environment.ignoreSSL) {
      
      const isInLoginPage = this.isInLoginPage();
      const now = Date.now();
      
      // Mostrar el mensaje de log siempre en la página de login o si ha pasado el intervalo configurado
      if (isInLoginPage || (now - this.lastLogTime > this.logInterval)) {
        console.log(`SslInterceptor. No debe estar en productivo. [${new Date().toLocaleTimeString()}]${isInLoginPage ? ' (Login Page)' : ''}`);
        this.lastLogTime = now;
      }
      
      // Clonar la solicitud y aplicar configuración para ignorar SSL
      const modifiedReq = req.clone({
        setHeaders: {
          'X-Ignore-SSL': 'true'
        }
      });
      return next.handle(modifiedReq);
    }
    return next.handle(req);
  }

  /**
   * Verifica si estamos en la página de login basándose en la URL actual
   */
  private isInLoginPage(): boolean {
    const url = this.router.url;
    return url.includes('/auth/login') || url.includes('/account/login');
  }
}