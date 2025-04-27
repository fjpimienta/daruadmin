import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/@core/services/auth.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ActivatedRoute, Router } from '@angular/router';
import { first, timeout, catchError, retry, delay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ILoginForm, IResultLogin } from 'src/app/@core/interfaces/login.interface';
import { basicAlert } from 'src/app/@shared/alert/toasts';
import { TYPE_ALERT } from 'src/app/@shared/alert/values.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of, throwError, Subscription } from 'rxjs';
import { ConnectionService } from 'src/app/@core/services/connection.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private http: HttpClient,
    private connectionService: ConnectionService
  ) { }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  loginForm: FormGroup;
  submitted = false;
  error = '';
  returnUrl: string;
  isLoading = false;
  isServerAvailable = false;
  serverStatus: string = 'Verificando conexión...';
  offlineMode = false;
  environment = environment; // Exponer environment para usar en la plantilla
  private subscription: Subscription;

  login: ILoginForm = {
    email: '',
    password: '',
    remember: false
  };

  // set the current year
  year: number = new Date().getFullYear();

  carouselOption: OwlOptions = {
    items: 1,
    loop: false,
    margin: 0,
    nav: false,
    dots: true,
    responsive: {
      680: {
        items: 1
      },
    }
  };

  ngOnInit(): void {
    document.body.classList.add('auth-body-bg');
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false],
      offlineMode: [false]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'dashboard';
    // console.log('returnUrl configurada:', this.returnUrl);

    if (localStorage.remember && localStorage.remember !== '') {
      this.login.email = localStorage.getItem('email');
      this.login.remember = localStorage.getItem('remember') === 'true' ? true : false;
      this.loginForm.patchValue({
        email: this.login.email,
        remember: this.login.remember
      });
    }

    // Suscribirse a los cambios de estado del servidor desde el servicio de conexión
    this.subscription = this.connectionService.serverStatus$.subscribe(status => {
      // Aplicamos detección de cambios para forzar la actualización de la interfaz
      this.isServerAvailable = status.isAvailable;
      this.serverStatus = status.message;

      // Si el servidor está disponible, actualizar estado y verificar mutaciones
      if (status.isAvailable) {
        this.isLoading = false; // Detener cualquier indicador de carga
        
        // Forzar la actualización de la interfaz de usuario
        setTimeout(() => {
          // Ejecutar la verificación de mutaciones disponibles
          this.verifyMutations();
        }, 0);
      } else if (!environment.production) {
        // Solo mostrar en modo desarrollo
        this.loginForm.get('offlineMode').enable();
      }
    });

    // Verificar el estado del servidor al cargar el componente
    this.connectionService.checkServerStatus();
  }
  
  ngOnDestroy() {
    // Limpiar suscripciones al destruir el componente
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
  onSubmit() {
    this.submitted = true;
    this.lsRememberMe();
    
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }
    
    this.isLoading = true;
    basicAlert(TYPE_ALERT.LOADING, 'Iniciando sesión...');
    
    // Verificar si debemos usar modo offline
    if (this.loginForm.get('offlineMode').value === true) {
      // Modo offline para desarrollo
      if (!environment.production) {
        // console.log('Usando modo offline para desarrollo');
        setTimeout(() => {
          this.handleOfflineLogin(this.f.email.value, this.f.password.value);
        }, 1000); // Simular un pequeño delay para dar sensación de procesamiento
        return;
      }
    }
    
    // Intentar el login directamente con HTTP
    this.loginDirectly(this.f.email.value, this.f.password.value);
  }

  // Método para manejar login en modo offline (solo para desarrollo)
  handleOfflineLogin(email: string, password: string) {
    const offlineResponse = this.connectionService.getOfflineLoginResponse(email, password);
    
    if (offlineResponse.status) {
      // Simular una respuesta exitosa
      this.handleLoginResponse(offlineResponse);
    } else {
      this.isLoading = false;
      basicAlert(TYPE_ALERT.WARNING, offlineResponse.message || 'Credenciales inválidas en modo offline');
    }
  }

  // Usar HTTP directo para el login para evitar problemas con Apollo
  loginDirectly(email: string, password: string) {
    // Validar que el email y la contraseña no estén vacíos
    if (!email || !password) {
      console.error('Email o contraseña vacíos');
      basicAlert(TYPE_ALERT.WARNING, 'Por favor, ingrese un correo electrónico y una contraseña válidos.');
      this.isLoading = false;
      return;
    }

    // console.log('Intentando login directo con:', email);

    // Crear la solicitud GraphQL manualmente - Usando la estructura correcta de query según endpoint real
    const query = `
      query Login($email: String!, $password: String!, $include: Boolean!) {
        login(email: $email, password: $password, include: $include) {
          status
          message
          token
          user {
            id
            name
            lastname
            email
            role
            active
            phone
            policy
            stripeCustomer
          }
        }
      }
    `;

    const variables = {
      email: email,
      password: password,
      include: false
    };

    // console.log('Datos enviados en la solicitud:', { email, password });

    // Usar la URL del backend directamente desde environment
    const backendUrl = environment.backend;
    // console.log('Usando URL del backend:', backendUrl);

    // Hacer una solicitud HTTP POST directa
    this.http.post(backendUrl, { 
      query: query,
      variables: variables
    }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    })
    .pipe(
      timeout(10000), // 10 segundos de timeout
      retry(1),      // 1 reintento
      catchError(error => {
        this.isLoading = false;
        console.error('Error en login directo:', error);
        
        if (error.status === 400 || error.status === 500) {
          // Intentar obtener detalles del error GraphQL si están disponibles
          try {
            if (error.error && error.error.errors && error.error.errors.length > 0) {
              const graphqlError = error.error.errors[0];
              console.error('Error GraphQL detallado:', graphqlError);
              basicAlert(TYPE_ALERT.WARNING, graphqlError.message || 'Error en la consulta GraphQL');
            } else {
              basicAlert(TYPE_ALERT.ERROR, 'Error en la comunicación con el servidor');
            }
          } catch (parseError) {
            console.error('Error al analizar la respuesta del servidor:', parseError);
            basicAlert(TYPE_ALERT.ERROR, 'Error inesperado en la comunicación con el servidor');
          }
        } else if (error.name === 'TimeoutError') {
          basicAlert(TYPE_ALERT.ERROR, 'La solicitud tomó demasiado tiempo. El servidor podría estar sobrecargado.');

          // Solo sugerir modo offline en ambiente de desarrollo
          if (!environment.production) {
            setTimeout(() => {
              if (confirm('¿Desea intentar iniciar sesión en modo offline? (Solo para desarrollo)')) {
                this.loginForm.patchValue({ offlineMode: true });
                this.onSubmit();
              }
            }, 500);
          }
        } else if (error.status === 0) {
          basicAlert(TYPE_ALERT.ERROR, 'No se pudo conectar con el servidor. Por favor, verifique su conexión a internet.');
          this.connectionService.checkServerStatus();
        } else if (error.status === 401) {
          basicAlert(TYPE_ALERT.WARNING, 'Usuario o contraseña incorrectos.');
        } else if (error.status === 403) {
          basicAlert(TYPE_ALERT.WARNING, 'Acceso denegado. No tiene permisos para acceder.');
        } else {
          basicAlert(TYPE_ALERT.ERROR, `Error de comunicación con el servidor (${error.status || 'desconocido'}): ${error.message || 'Sin detalles'}`);
        }

        return of(null);
      })
    )
    .subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (response === null) {
          return; // Error ya manejado en catchError
        }

        // console.log('Respuesta del servidor:', response);

        // Verificar si hay datos de login en la respuesta
        if (response.data && response.data.login) {
          this.handleLoginResponse(response.data.login);
        } else if (response.errors && response.errors.length > 0) {
          // Mostrar el primer error GraphQL
          const errorMsg = response.errors[0].message || 'Error de autenticación';
          basicAlert(TYPE_ALERT.WARNING, errorMsg);
        } else {
          basicAlert(TYPE_ALERT.WARNING, 'Respuesta del servidor inválida. Por favor, inténtelo nuevamente.');
        }
      }
    });
  }
  
  // Método para probar login con diferentes nombres de mutación
  tryAlternativeLogin(email: string, password: string, mutationName: string) {
    // console.log(`Intentando login con mutación ${mutationName}...`);
    
    const query = `
      mutation {
        ${mutationName}(email: "${email}", password: "${password}") {
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
    
    // Hacer una solicitud HTTP POST directa
    this.http.post(backendUrl, { query }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    })
    .pipe(
      timeout(10000),
      catchError(error => {
        if (error.error && error.error.errors && error.error.errors.length > 0) {
          const graphqlError = error.error.errors[0];
          console.error(`Error con mutación ${mutationName}:`, graphqlError.message);
          
          // Si fallamos con signin, intentar con authUser
          if (mutationName === "signin" && graphqlError.message.includes("Cannot query field")) {
            // console.log("Intentando con mutación authUser...");
            return this.tryAlternativeLogin(email, password, "authUser");
          }
          // Si fallamos con authUser, intentar con signIn (mayúscula)
          else if (mutationName === "authUser" && graphqlError.message.includes("Cannot query field")) {
            // console.log("Intentando con mutación signIn (mayúscula)...");
            return this.tryAlternativeLogin(email, password, "signIn");
          }
          // Si fallamos con signIn, mostrar alerta con los nombres que hemos probado
          else if (mutationName === "signIn" && graphqlError.message.includes("Cannot query field")) {
            // console.log("Todas las mutaciones comunes de login fallaron");
            basicAlert(TYPE_ALERT.WARNING, 'No se pudo encontrar la mutación correcta para inicio de sesión. Prueba en modo offline o contacta al administrador.');
            this.verifyMutations(); // Obtener lista completa de mutaciones
            return of(null);
          }
        }
        
        // Si hay otros errores, manejamos normalmente
        this.isLoading = false;
        console.error(`Error con mutación ${mutationName}:`, error);
        basicAlert(TYPE_ALERT.ERROR, 'Error intentando autenticación');
        return of(null);
      })
    )
    .subscribe({
      next: (response: any) => {
        if (response === null) {
          return; // Error ya manejado
        }
        
        // console.log(`Respuesta de mutación ${mutationName}:`, response);
        
        // Verificar si hay datos de login en la respuesta usando el nombre de mutación dinámico
        if (response.data && response.data[mutationName]) {
          this.isLoading = false;
          this.handleLoginResponse(response.data[mutationName]);
        } else if (response.errors) {
          // Error ya manejado en catchError
        } else {
          this.isLoading = false;
          basicAlert(TYPE_ALERT.WARNING, 'Respuesta del servidor inválida');
        }
      }
    });
    
    // Devolver observable vacío para mantener la cadena
    return of(null);
  }
  
  // Manejar la respuesta de login
  handleLoginResponse(result: any) {
    if (result.status && result.token) {
      // console.log('Login exitoso, token recibido:', result.token);

      try {
        // Guardar el token en localStorage
        localStorage.setItem('userToken', result.token);
        // console.log('Token guardado en localStorage:', localStorage.getItem('userToken'));

        // Crear un objeto de sesión y guardarlo
        const session = {
          token: result.token,
          expiresIn: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
        };
        localStorage.setItem('session', JSON.stringify(session));
        // console.log('Sesión guardada en localStorage:', localStorage.getItem('session'));

        // Actualizar el servicio de autenticación
        this.authService.updateSession({ status: true });

        // Redirigir al usuario a la URL de retorno
        setTimeout(() => {
          this.router.navigateByUrl(this.returnUrl);
        }, 500);
      } catch (error) {
        console.error('Error al guardar datos de sesión:', error);
        basicAlert(TYPE_ALERT.ERROR, 'Error interno al procesar la sesión. Por favor, intente nuevamente.');
      }
    } else {
      this.isLoading = false;
      basicAlert(TYPE_ALERT.WARNING, result.message || 'Error de autenticación');
    }
  }

  lsRememberMe(): void {
    if (this.f.remember && this.f.email.value !== '') {
      localStorage.setItem('email', this.f.email.value);
      localStorage.setItem('remember', this.f.remember.value);
    } else {
      localStorage.setItem('email', '');
      localStorage.setItem('remember', 'false');
    }
  }

  togglePasswordVisibility() {
    var passwordInput = document.getElementById("password") as HTMLInputElement;
    var toggleBtn = document.getElementById("password-addon");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      if (toggleBtn) {
        toggleBtn.textContent = "Ocultar";
      }
    } else {
      passwordInput.type = "password";
      if (toggleBtn) {
        toggleBtn.textContent = "Mostrar";
      }
    }
  }
  
  // Método para reintentar la conexión con el servidor
  retryConnection() {
    this.connectionService.checkServerStatus();
  }
  
  // Alternar entre modo online y offline
  toggleOfflineMode() {
    const currentValue = this.loginForm.get('offlineMode').value;
    this.loginForm.patchValue({ offlineMode: !currentValue });
    
    if (!currentValue) {
      basicAlert(TYPE_ALERT.INFO, 'Modo offline activado (solo para desarrollo)');
    } else {
      basicAlert(TYPE_ALERT.INFO, 'Modo offline desactivado');
    }
  }

  // Método para verificar mutaciones disponibles
  verifyMutations() {
    const introspectionQuery = `
      {
        __schema {
          types {
            name
            kind
            fields {
              name
            }
          }
        }
      }
    `;

    // // Usar la URL del backend directamente desde environment
    // const backendUrl = environment.backend;

    // this.http.post(backendUrl, { query: introspectionQuery }, {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json'
    //   })
    // }).subscribe({
    //   next: (response: any) => {
    //     console.log('Esquema del servidor:', response);
    //     // Buscar el tipo Mutation para ver qué campos tiene disponibles
    //     const types = response?.data?.__schema?.types || [];
    //     const mutationType = types.find(type => type.name === 'Mutation');
    //     if (mutationType && mutationType.fields) {
    //       console.log('Mutaciones disponibles:', mutationType.fields);
    //     } else {
    //       console.log('No se encontró el tipo Mutation o no tiene campos');
    //       // Buscar información sobre el tipo Query también
    //       const queryType = types.find(type => type.name === 'Query');
    //       if (queryType && queryType.fields) {
    //         console.log('Queries disponibles:', queryType.fields);
    //       }
    //     }
    //   },
    //   error: (error) => {
    //     console.error('Error al realizar introspección del esquema:', error);
    //   }
    // });
  }
}
