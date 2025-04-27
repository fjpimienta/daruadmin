import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Interface para el estado del servidor
 */
export interface ServerStatus {
  isAvailable: boolean;
  message: string;
  lastCheck?: Date;
}

/**
 * Servicio para manejar la conexión al servidor y proporcionar
 * mecanismos de respaldo cuando el servidor no está disponible
 */
@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  // Observable para el estado del servidor
  private serverStatusSubject = new BehaviorSubject<ServerStatus>({
    isAvailable: false,
    message: 'Verificando conexión con el servidor...'
  });

  // Observable público para que los componentes se suscriban
  serverStatus$ = this.serverStatusSubject.asObservable();
  
  // Almacenamiento de credenciales para modo offline (solo para desarrollo)
  private readonly DEV_USERS = [
    { email: 'admin@daru.mx', password: 'admin123', role: 'ADMIN' },
    { email: 'test@daru.mx', password: 'test123', role: 'USER' }
  ];

  constructor(private http: HttpClient) {
    // Verificar el estado del servidor al iniciar el servicio
    this.checkServerStatus().subscribe();
  }

  /**
   * Verifica la disponibilidad del servidor API
   * @returns Observable<boolean> - true si el servidor está disponible
   */
  checkServerStatus(): Observable<boolean> {
    // Emitir estado "verificando" a todos los suscriptores
    this.serverStatusSubject.next({
      isAvailable: false,
      message: 'Verificando conexión con el servidor...',
      lastCheck: new Date()
    });

    const query = `
      query {
        __schema {
          types {
            name
          }
        }
      }
    `;

    const backendUrl = environment.backend;

    return this.http.post(backendUrl, { query }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    })
    .pipe(
      map((response: any) => {
        // Verificar respuesta y actualizar estado
        if (response && (response.data || response.data === null)) {
          // Emitir estado "conectado" a todos los suscriptores
          const status: ServerStatus = {
            isAvailable: true,
            message: 'Servidor conectado correctamente',
            lastCheck: new Date()
          };
          this.serverStatusSubject.next(status);
          return true;
        } else {
          // Emitir estado "error" a todos los suscriptores
          const status: ServerStatus = {
            isAvailable: false,
            message: 'El servidor respondió pero no envió datos válidos',
            lastCheck: new Date()
          };
          this.serverStatusSubject.next(status);
          return false;
        }
      }),
      catchError((error) => {
        let errorMessage = 'No se pudo conectar con el servidor.';

        if (error.name === 'TimeoutError') {
          errorMessage = 'La conexión con el servidor está tomando demasiado tiempo.';
        } else if (error.status === 0) {
          errorMessage = 'No se pudo establecer conexión con el servidor API.';
        } else if (error.status) {
          errorMessage = `Error de conexión (${error.status}): ${error.statusText || 'Desconocido'}`;
        }

        // Emitir estado "error" a todos los suscriptores
        const status: ServerStatus = {
          isAvailable: false,
          message: errorMessage,
          lastCheck: new Date()
        };
        this.serverStatusSubject.next(status);

        return of(false);
      })
    );
  }
  
  /**
   * Obtiene el estado actual del servidor
   */
  getCurrentStatus(): ServerStatus {
    return this.serverStatusSubject.value;
  }
  
  /**
   * Proporciona una respuesta simulada para el login en modo offline
   * NOTA: Solo para desarrollo, nunca usar en producción
   */
  getOfflineLoginResponse(email: string, password: string): any {
    // Solo permitir en desarrollo
    if (environment.production) {
      return { 
        status: false, 
        message: 'Modo offline no disponible en producción' 
      };
    }
    
    // Validar credenciales contra usuarios de desarrollo
    const user = this.DEV_USERS.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );
    
    if (!user) {
      return {
        status: false,
        message: 'Credenciales inválidas para modo offline'
      };
    }
    
    // Generar un token simulado para desarrollo
    const fakeToken = 'DEV_TOKEN_' + btoa(JSON.stringify({
      email: user.email,
      role: user.role,
      exp: new Date().getTime() + 24 * 60 * 60 * 1000 // 24 horas
    }));
    
    // Crear una respuesta simulada similar a la del backend
    return {
      status: true,
      message: 'Login exitoso (MODO OFFLINE)',
      token: fakeToken,
      user: {
        id: 'dev_user_id',
        name: 'Usuario',
        lastname: 'Desarrollo',
        email: user.email,
        role: user.role
      }
    };
  }
}