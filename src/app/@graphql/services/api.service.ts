import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { DocumentNode } from 'graphql';
import { map, timeout, catchError, retry } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Tiempo de espera máximo para peticiones (en ms)
  private requestTimeout = 45000; // 45 segundos
  // Número de reintentos en caso de error de red
  private retryAttempts = 3;

  constructor(private apollo: Apollo) { }

  // Anadir metodos para consumir la info de la API
  // Metodo principal reutilizable
  protected get(query: DocumentNode, variables: object = {}, context: object = {}, cache: boolean = true) {
    // console.log(`Executing GraphQL query with variables:`, variables);
    return this.apollo.watchQuery({
      query,
      variables,
      context,
      fetchPolicy: (cache) ? 'network-only' : 'no-cache'
    }).valueChanges.pipe(
      timeout(this.requestTimeout),
      retry(this.retryAttempts), // Usamos la versión simple de retry en lugar de la configuración avanzada
      catchError(error => {
        // Personalizar mensaje de error según el tipo
        console.warn('GraphQL error:', error);
        
        // Verificar si la URL está accesible
        this.checkServerConnection();
        
        if (error.name === 'TimeoutError') {
          return throwError({
            message: 'La solicitud tardó demasiado tiempo. Por favor, inténtalo de nuevo.',
            originalError: error
          });
        }
        if (error.networkError) {
          return throwError({
            message: 'Error de conexión con el servidor. Por favor verifica tu conexión a internet o que el servidor esté disponible.',
            originalError: error
          });
        }
        // Para otros errores, devolver el original
        return throwError(error);
      }),
      map((result) => {
        return result.data;
      })
    );
  }

  protected set(mutation: DocumentNode, variables: object = {}, context: object = {}) {
    // console.log(`Executing GraphQL mutation with variables:`, variables);
    return this.apollo.mutate({
      mutation,
      variables,
      context
    }).pipe(
      timeout(this.requestTimeout),
      retry(this.retryAttempts), // Usamos la versión simple de retry en lugar de la configuración avanzada
      catchError(error => {
        console.warn('GraphQL mutation error:', error);
        
        // Verificar si la URL está accesible
        this.checkServerConnection();
        
        if (error.name === 'TimeoutError') {
          return throwError({
            message: 'La operación tardó demasiado tiempo. Por favor, inténtalo de nuevo.',
            originalError: error
          });
        }
        if (error.networkError) {
          return throwError({
            message: 'Error de conexión con el servidor. Por favor verifica tu conexión a internet o que el servidor esté disponible.',
            originalError: error
          });
        }
        return throwError(error);
      }),
      map((result) => {
        return result.data;
      })
    );
  }

  protected subscription(subscription: DocumentNode, variables: object = {}) {
    return this.apollo.subscribe({
      query: subscription,
      variables
    }).pipe(
      timeout(this.requestTimeout),
      catchError(error => {
        console.warn('GraphQL subscription error:', error);
        if (error.networkError) {
          return throwError({
            message: 'Error de conexión con el servidor. Por favor verifica tu conexión a internet o que el servidor esté disponible.',
            originalError: error
          });
        }
        return throwError(error);
      }),
      map((result) => {
        return result.data;
      })
    );
  }

  // Método para verificar si el servidor GraphQL está disponible
  private async checkServerConnection() {
    try {
      const url = environment.backend;
      // console.log(`Checking server availability: ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      // console.log(`Server responded with status: ${response.status}`);
    } catch (error) {
      console.error('Server connection check failed:', error);
    }
  }
}
