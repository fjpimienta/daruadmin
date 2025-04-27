import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { environment } from '../../../environments/environment';

@NgModule({
  imports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ]
})
export class GraphqlModule {
  constructor(apollo: Apollo, httpLink: HttpLink) {
    const errorLink = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        console.error('GraphQL Errors:', graphQLErrors);
      }
      if (networkError) {
        console.error('Network Errors:', networkError);
        console.error('Network Error details:', JSON.stringify(networkError));
      }
    });

    const logLink = new ApolloLink((operation, forward) => {
      // console.log('GraphQL Request:', {
      //   query: operation.query.loc?.source.body,
      //   variables: operation.variables
      // });
      return forward(operation).map((response) => {
        // console.log('GraphQL Response:', response);
        return response;
      });
    });

    // Usar la URL completa desde environment.ts en lugar de la ruta relativa
    const link = ApolloLink.from([
      errorLink,
      logLink,
      httpLink.create({ 
        uri: environment.backend
        // Quitar withCredentials para evitar problemas de CORS
      })
    ]);

    apollo.create({
      link,
      cache: new InMemoryCache({
        addTypename: false
      }),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'network-only',
          errorPolicy: 'all'
        },
        query: {
          fetchPolicy: 'network-only',
          errorPolicy: 'all'
        }
      }
    });
  }
}
