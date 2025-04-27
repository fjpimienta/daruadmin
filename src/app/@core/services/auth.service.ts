import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { IMeData, ISession } from 'src/app/@core/interfaces/session.interface';
import { LOGIN_QUERY, ME_DATA_QUERY } from 'src/app/@graphql/operations/query/users';
import { ApiService } from 'src/app/@graphql/services/api.service';
import { Subject, Observable, of } from 'rxjs';
import { map, tap, catchError, timeout, retry } from 'rxjs/operators';

import { getFirebaseBackend } from '../../authUtils';

import { User } from '../models/auth.models';
import { basicAlert } from 'src/app/@shared/alert/toasts';
import { TYPE_ALERT } from 'src/app/@shared/alert/values.config';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })

export class AuthenticationService extends ApiService {

  user: User;

  accessVar = new Subject<IMeData>();
  accessVar$ = this.accessVar.asObservable();
  
  // Flag para control de sesión
  private checkingSession = false;

  constructor(apollo: Apollo, private router: Router, private http: HttpClient) {
    super(apollo);
    // Iniciar verificación de sesión al cargar el servicio
    setTimeout(() => this.start(), 500);
  }

  // Método principal para verificar la sesión al inicio
  start(): void {
    if (this.checkingSession) {
      return;
    }
    
    this.checkingSession = true;
    // console.log('AuthService: Verificando sesión...');
    
    // Primero verificar si hay userToken
    const directToken = localStorage.getItem('userToken');
    if (directToken) {
      // console.log('AuthService: userToken encontrado, verificando validez');
      // Intentar crear sesión desde este token
      try {
        this.setSession(directToken);
        this.checkingSession = false;
        return;
      } catch (error) {
        console.error('AuthService: Error al procesar userToken:', error);
        localStorage.removeItem('userToken');
      }
    }
    
    // Luego verificar sesión regular
    const session = this.getSession();
    if (session !== null && session.token) {
      // console.log('AuthService: Token encontrado en localStorage');
      // Verificar que el token sea válido intentando obtener datos del usuario
      this.getMe().subscribe(result => {
        if (result && result.status) {
          // console.log('AuthService: Token válido, sesión activa');
        } else {
          // console.log('AuthService: Token inválido o expirado, eliminando sesión');
          this.resetSession();
        }
        this.checkingSession = false;
      });
      return;
    }
    
    // console.log('AuthService: Sesión no iniciada');
    this.checkingSession = false;
  }

  login(email: string, password: string): Observable<any> {
    // console.log('AuthService: Iniciando login con:', email);
    
    // Crear la solicitud GraphQL manualmente para tener más control
    const query = `
      mutation {
        login(email: "${email}", password: "${password}") {
          status
          message
          token
          user {
            id
            name
            lastname
            email
            role
          }
        }
      }
    `;

    // Usar la URL del backend directamente desde environment
    const backendUrl = environment.backend;
    // console.log('AuthService: Usando URL del backend:', backendUrl);

    return this.http.post(backendUrl, { query }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
      // Quitar withCredentials para evitar problemas de CORS
    })
    .pipe(
      timeout(10000), // 10 segundos de timeout
      retry(1), // Intentar una vez más si falla
      map((response: any) => {
        // console.log('AuthService: Respuesta del servidor login:', response);
        if (response.data && response.data.login) {
          return response.data.login;
        }
        throw new Error('Respuesta inválida del servidor');
      }),
      tap(result => {
        if (result.status && result.token) {
          // console.log('AuthService: Login exitoso, guardando token');
          // Guardar en userToken para compatibilidad
          localStorage.setItem('userToken', result.token);
          // Guardar en session para el sistema principal
          this.setSession(result.token);
        }
      }),
      catchError(error => {
        console.error('AuthService: Error en login:', error);
        if (error.name === 'TimeoutError') {
          console.error('AuthService: La solicitud ha excedido el tiempo de espera.');
        }
        return of({
          status: false,
          message: error.message || 'Error de autenticación o timeout',
          token: null
        });
      })
    );
  }

  getMe(): Observable<IMeData> {
    const session = this.getSession();
    
    if (!session || !session.token) {
      return of({ status: false });
    }
    
    const query = `
      query {
        me {
          status
          message
          user {
            id
            name
            lastname
            email
            role
          }
        }
      }
    `;

    // Usar la URL del backend directamente desde environment
    const backendUrl = environment.backend;

    return this.http.post(backendUrl, { query }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': session.token
      })
    })
    .pipe(
      map((result: any) => {
        // console.log('AuthService: Resultado de me query:', result);
        if (result.data && result.data.me) {
          return result.data.me;
        }
        return { status: false };
      }),
      catchError(error => {
        console.error('AuthService: Error al obtener datos de usuario:', error);
        return of({ status: false });
      })
    );
  }

  setSession(token: string): void {
    if (!token) {
      console.error('AuthService: Intento de guardar token vacío');
      return;
    }
    
    try {
      const date = new Date();
      date.setHours(date.getHours() + 24);

      const session: ISession = {
        expiresIn: date.toISOString(),
        token
      };
      
      localStorage.setItem('session', JSON.stringify(session));
      // console.log('AuthService: Sesión guardada exitosamente');
      
      // Actualizar el estado de la sesión en el sistema
      this.updateSession({ status: true });
    } catch (error) {
      console.error('AuthService: Error al guardar sesión:', error);
    }
  }

  getSession(): ISession {
    try {
      const sessionStr = localStorage.getItem('session');
      if (!sessionStr) {
        return null;
      }
      
      const session: ISession = JSON.parse(sessionStr);
      if (!session.token) {
        this.resetSession();
        return null;
      }
      
      // Verificar expiración
      const expiresIn = new Date(session.expiresIn).getTime();
      const now = new Date().getTime();
      
      if (now > expiresIn) {
        // console.log('AuthService: Sesión expirada');
        this.resetSession();
        return null;
      }
      
      return session;
    } catch (error) {
      // console.error('AuthService: Error al recuperar sesión:', error);
      this.resetSession();
      return null;
    }
  }

  updateSession(newValue: IMeData): void {
    if (!newValue) {
      return;
    }
    
    this.accessVar.next(newValue);
  }

  resetSession(): void {
    localStorage.removeItem('session');
    localStorage.removeItem('userToken');
    this.updateSession({ status: false });
    console.log('AuthService: Sesión eliminada');
  }

  logout(): void {
    basicAlert(TYPE_ALERT.LOADING, 'Cerrando sesión...');
    this.resetSession();
    
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
      basicAlert(TYPE_ALERT.SUCCESS, 'Sesión cerrada correctamente');
    }, 500);
  }

  // Métodos para autenticación Firebase
  public currentUser(): User {
    return getFirebaseBackend().getAuthenticatedUser();
  }

  login1(email: string, password: string) {
    return getFirebaseBackend().loginUser(email, password).then((response: any) => {
      const user = response;
      return user;
    });
  }

  register(email: string, password: string) {
    return getFirebaseBackend().registerUser(email, password).then((response: any) => {
      const user = response;
      return user;
    });
  }

  resetPassword(email: string) {
    return getFirebaseBackend().forgetPassword(email).then((response: any) => {
      const message = response.data;
      return message;
    });
  }
}

