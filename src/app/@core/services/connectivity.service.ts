import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {
  // Iniciar en false para forzar la verificación inicial
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private offlineMode = new BehaviorSubject<boolean>(false);
  private checkInterval = 15000; // Verificar cada 15 segundos
  private lastCheckTime = 0;
  private serverStatusSubject = new BehaviorSubject<ServerStatus>({
    isAvailable: false,
    message: 'Verificando conexión con el servidor...'
  });

  // Observable público para que los componentes se suscriban
  serverStatus$ = this.serverStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    // Verificar inmediatamente al iniciar
    this.checkServerStatus().subscribe();
    this.startConnectionMonitoring();
    this.loadOfflinePreference();
  }

  /**
   * Inicia el monitoreo de conexión al servidor
   */
  startConnectionMonitoring(): void {
    // Usar timer para verificaciones periódicas
    timer(this.checkInterval, this.checkInterval).pipe(
      switchMap(() => {
        const now = Date.now();
        // Solo verificar si han pasado al menos checkInterval ms desde la última verificación
        if (now - this.lastCheckTime >= this.checkInterval) {
          this.lastCheckTime = now;
          // console.log('ConnectivityService: Verificando conexión periódica...');
          return this.checkConnection();
        }
        return of(this.connectionStatus.value);
      })
    ).subscribe();
  }

  /**
   * Verifica la conexión con el servidor
   */
  checkConnection(): Observable<boolean> {
    const query = `
      query {
        __schema {
          types {
            name
          }
        }
      }
    `;

    // Usar la URL del backend directamente desde environment
    const backendUrl = environment.backend;
    // console.log('ConnectivityService: Verificando conexión con:', backendUrl);

    // Emitir estado "verificando" a todos los suscriptores
    this.serverStatusSubject.next({
      isAvailable: false,
      message: 'Verificando conexión con el servidor...'
    });

    return this.http.post(backendUrl, { query }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
      // Quitar withCredentials para evitar problemas de CORS
    })
    .pipe(
      map((response: any) => {
        if (response?.data?.__schema) {
          // console.log('ConnectivityService: Conexión exitosa con el servidor');
          this.connectionStatus.next(true);
          // Emitir estado "conectado" a todos los suscriptores
          this.serverStatusSubject.next({
            isAvailable: true,
            message: 'Servidor conectado correctamente'
          });
          return true;
        } else {
          console.warn('ConnectivityService: Respuesta inválida del servidor:', response);
          this.connectionStatus.next(false);
          // Emitir estado "error" a todos los suscriptores
          this.serverStatusSubject.next({
            isAvailable: false,
            message: 'El servidor respondió pero no envió datos válidos'
          });
          return false;
        }
      }),
      catchError((error) => {
        console.error('ConnectivityService: Error al verificar conexión con el servidor:', error);
        this.connectionStatus.next(false);
        // Emitir estado "error" a todos los suscriptores
        this.serverStatusSubject.next({
          isAvailable: false,
          message: `Error de conexión: ${error.status ? error.status : 'No hay respuesta del servidor'}`
        });
        return of(false);
      }),
      tap(isConnected => {
        this.lastCheckTime = Date.now();
      })
    );
  }

  /**
   * Comprueba manualmente el estado del servidor
   */
  checkServerStatus(): Observable<boolean> {
    this.serverStatusSubject.next({
      isAvailable: false,
      message: 'Verificando conexión con el servidor...'
    });
    return this.checkConnection();
  }

  /**
   * Devuelve un Observable del estado de la conexión
   */
  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  /**
   * Devuelve el estado actual de la conexión
   */
  isConnected(): boolean {
    // console.log('ConnectivityService: Estado actual de la conexión:', this.connectionStatus.value);
    // console.log('ConnectivityService: Modo offline activo:', this.offlineMode.value);
    return this.connectionStatus.value;
  }

  /**
   * Configura manualmente el modo offline
   */
  setOfflineMode(offline: boolean): void {
    this.offlineMode.next(offline);
    // Si se activa modo offline manualmente, almacenamos la preferencia
    if (offline) {
      localStorage.setItem('offlineMode', 'true');
    } else {
      localStorage.removeItem('offlineMode');
    }
  }

  /**
   * Obtiene el estado del modo offline
   */
  getOfflineMode(): Observable<boolean> {
    return this.offlineMode.asObservable();
  }

  /**
   * Verifica si el modo offline está activo
   */
  isOfflineMode(): boolean {
    return this.offlineMode.value;
  }

  /**
   * Carga la preferencia de modo offline al iniciar
   */
  loadOfflinePreference(): void {
    const savedOfflineMode = localStorage.getItem('offlineMode') === 'true';
    if (savedOfflineMode) {
      // console.log('ConnectivityService: Cargando preferencia de modo offline');
      this.offlineMode.next(true);
    }
  }

  /**
   * Proporciona una respuesta simulada para el login en modo offline
   * NOTA: Solo para desarrollo, nunca usar en producción
   */
  getOfflineLoginResponse(email: string, password: string): any {
    // Solo permitir en desarrollo
    if (environment.production) {
      console.error('Modo offline no está disponible en producción');
      return { 
        status: false, 
        message: 'Modo offline no disponible en producción' 
      };
    }
    
    // Usuarios de desarrollo para pruebas
    const DEV_USERS = [
      { email: 'admin@daru.mx', password: 'admin123', role: 'ADMIN' },
      { email: 'test@daru.mx', password: 'test123', role: 'USER' }
    ];
    
    // Validar credenciales contra usuarios de desarrollo
    const user = DEV_USERS.find(u => 
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
      exp: new Date().getTime() / 1000 + 24 * 60 * 60 // 24 horas
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

// Interfaz para el estado del servidor
interface ServerStatus {
  isAvailable: boolean;
  message: string;
}