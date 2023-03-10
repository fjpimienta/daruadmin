import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICatalog } from '@core/interfaces/catalog.interface';
import { ILoginCTForm, ILoginSyscomForm } from '@core/interfaces/extern-login.interface';
import { IApis, ISupplier } from '@core/interfaces/supplier.interface';
import { Product } from '@core/models/product.models';
import { map } from 'rxjs/operators';
import axios, { isCancel, AxiosError } from 'axios';

declare const require;
const xml2js = require('xml2js');

@Injectable({
  providedIn: 'root'
})
export class ExternalAuthService {
  loginCTForm: ILoginCTForm = {
    email: '',
    cliente: '',
    rfc: ''
  };
  loginSyscomForm: ILoginSyscomForm = {
    client_id: '',
    client_secret: '',
    grant_type: ''
  };

  constructor(
    public http: HttpClient
  ) {
  }

  async getSyscomToken(supplier: ISupplier, apiSelect: IApis): Promise<any> {
    // application/x-www-form-urlencoded
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');

    let params = new HttpParams();
    if (supplier.token.body_parameters.length > 0) {
      supplier.token.body_parameters.forEach(param => {
        params = params.set(param.name, param.value);
      });
    }

    const options = { headers };

    return await this.http.post(supplier.token.url_base_token, params, options).toPromise();
  }

  async getSyscomCatalog(supplier: ISupplier, apiSelect: IApis, token: string, search: string = ''): Promise<any> {
    if (apiSelect.parameters) {
      switch (supplier.slug) {
        case 'syscom':
          let params = new HttpParams();
          // Parámetros del token
          if (supplier.token.body_parameters.length > 0) {
            supplier.token.body_parameters.forEach(param => {
              params = params.set(param.name, param.value);
            });
          }
          // Parámetros de url
          if (apiSelect.parameters.length > 0) {
            apiSelect.parameters.forEach(param => {
              params = params.set(param.name, search);
            });
          }

          return await this.http.get(
            supplier.url_base_api + apiSelect.operation,
            {
              headers: { Authorization: 'Bearer ' + token },
              params,
            }).toPromise();
          break;
        case 'ct':
          return await this.http.get(
            supplier.url_base_api + apiSelect.operation,
            {
              headers: {
                'x-auth': token,
                Accept: 'application/json',
                'Content-type': 'application/json'
              }
            }).toPromise();
        default:
          break;
      }
    }
  }

  async getSyscomCatalogAllBrands(supplier: ISupplier, apiSelect: IApis, token: string, catalogValues: ICatalog[]): Promise<any> {
    if (apiSelect.parameters) {
      switch (supplier.slug) {
        case 'syscom':
          let products: Product[] = [];
          const promises = [];
          catalogValues.forEach(async item => {
            let params = new HttpParams();
            // Parámetros del token
            if (supplier.token.body_parameters.length > 0) {
              supplier.token.body_parameters.forEach(param => {
                params = params.set(param.name, param.value);
              });
            }
            // Parámetros de url
            if (apiSelect.parameters.length > 0) {
              apiSelect.parameters.forEach(param => {
                params = params.set(param.name, item.slug);
              });
            }
            promises.push(
              this.http.get(
                supplier.url_base_api + apiSelect.operation,
                {
                  headers: { Authorization: 'Bearer ' + token },
                  params,
                }).toPromise()
            );
          });
          const getPromiseAll = () => {
            return Promise.all(promises)
              .then(async (responses) => {
                responses.forEach(response => {
                  response.productos.forEach(prod => {
                    products.push(prod);
                  });
                });
                return await products;
              });
          };
          return await getPromiseAll().then(async (res) => {
            return await res;
          });

        case 'ct':
          return await this.http.get(
            supplier.url_base_api + apiSelect.operation + '/' + apiSelect.suboperation,
            {
              headers: {
                'x-auth': token,
                Accept: 'application/json',
                'Content-type': 'application/json'
              }
            }).toPromise();
        default:
          break;
      }
    }
  }

  async getCatalogXMLAllBrands(supplier: ISupplier, apiSelect: IApis, search: string = '', catalogValues: ICatalog[]): Promise<any> {
    if (apiSelect.parameters) {
      switch (supplier.slug) {
        case 'cva':
          let products: Product[] = [];
          const promises = [];
          catalogValues.forEach(item => {
            const headers = new HttpHeaders();
            let params = new HttpParams();
            // Parámetros del token
            if (supplier.token) {
              if (supplier.token.body_parameters.length > 0) {
                supplier.token.body_parameters.forEach(param => {
                  params = params.set(param.name, param.value);
                });
              }
            }
            // Parámetros de url
            if (apiSelect.parameters) {
              apiSelect.parameters.forEach(param => {
                if (param.name === 'cliente') {
                  params = params.set(param.name, '23534');
                } else if (param.name === 'promos' || param.name === 'porcentajes') {
                  params = params.set(param.name, '1');
                } else {
                  params = params.set(param.name, item.slug.toUpperCase());
                }
              });
            }
            promises.push(
              this.http.get(
                supplier.url_base_api + apiSelect.operation,
                {
                  headers,
                  params,
                  responseType: 'text'
                })
                .pipe(map(async (xml: any) => {
                  return await this.parseXmlToJson(xml, apiSelect.operation)
                }))
                .toPromise()
            );
          });
          const getPromiseAll = () => {
            return Promise.all(promises)
              .then(async (responses) => {
                if (responses.length > 0) {
                  responses.forEach(response => {
                    if (response) {
                      if (response.length > 0) {
                        response.forEach(prod => {
                          products.push(prod);
                        });
                      } else {
                        return response;
                      }
                    }
                  });
                }
                if (products.length > 0) {
                  return await products;
                }
                return responses;
              })
              .catch(async (error) => {
                return await error;
              });
          };
          return await getPromiseAll()
            .then(async (res) => {
              return await res;
            }).catch(async (error) => {
              return await error;
            });
        default:
          break;
      }
    }
  }

  getCatalogXML(supplier: ISupplier, apiSelect: IApis, search: string = ''): Promise<any> {
    if (supplier) {
      const headers = new HttpHeaders();
      let params = new HttpParams();
      // Parámetros del token
      if (supplier.token) {
        if (supplier.token.body_parameters.length > 0) {
          supplier.token.body_parameters.forEach(param => {
            params = params.set(param.name, param.value);
          });
        }
      }
      // Parámetros de url
      if (apiSelect.parameters) {
        apiSelect.parameters.forEach(param => {
          params = params.set(param.name, param.value || search);
        });
      }

      return this.http.get(
        supplier.url_base_api + apiSelect.operation,
        {
          headers,
          params,
          responseType: 'text'
        }
      ).pipe(
        map(async xml => await this.parseXmlToJson(xml, apiSelect.operation))
      ).toPromise();
    }
  }

  async parseXmlToJson(xml, catalog) {
    switch (catalog) {
      case 'lista_precios.xml':
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => response.articulos.item)
          .catch(err => { return err });
      case 'marcas2.xml':
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => response.marcas.marca)
          .catch(err => { return err });
      case 'grupos.xml':
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => response.grupos.grupo)
          .catch(err => { return err });
      case 'grupos2.xml':
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => response.grupos.grupo)
          .catch(err => { return err });
      case 'soluciones.xml':
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => response.soluciones.solucion)
          .catch(err => { return err });
      case 'Obtener_Marcas':                                                                // SOAP Exel
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => JSON.parse(response['soap:Envelope']['soap:Body']['Obtener_MarcasResponse']['Obtener_MarcasResult']))
          .catch(err => { return new Error(err.message) });
      case 'Obtener_Categorias':                                                            // SOAP Exel
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => JSON.parse(response['soap:Envelope']['soap:Body']['Obtener_Productos_HuellaLogisticaResponse']['Obtener_Productos_HuellaLogisticaResult']))
          .catch(err => { return new Error(err.message) });
      case 'Obtener_Productos_Listado':                                                     // SOAP Exel
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => JSON.parse(response['soap:Envelope']['soap:Body']['Obtener_Productos_ListadoResponse']['Obtener_Productos_ListadoResult']))
          .catch(err => { return new Error(err.message) });
      case 'Obtener_Productos_PrecioYExistencia':                                           // SOAP Exel
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => JSON.parse(response['soap:Envelope']['soap:Body']['Obtener_Productos_PrecioYExistenciaResponse']['Obtener_Productos_PrecioYExistenciaResult']))
          .catch(err => { return new Error(err.message) });
      case 'Obtener_GaleriaDeImagenes':                                                     // SOAP Exel
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => JSON.parse(response['soap:Envelope']['soap:Body']['Obtener_GaleriaDeImagenesResponse']['Obtener_GaleriaDeImagenesResult']))
          .catch(err => { return new Error(err.message) });
      default:
        break;
    }
  }

  getCatalogSOAP(supplier: ISupplier, apiSelect: IApis, search: string = '', codigos: string = ''): Promise<any> {
    if (supplier) {
      let soapBody = '';
      switch (apiSelect.operation) {
        case 'Obtener_Marcas':
          soapBody = 'Obtener_Marcas';
          break;
        case 'Obtener_Categorias':
          soapBody = 'Obtener_Productos_HuellaLogistica';
          break;
        case 'Obtener_Productos_Listado':
          soapBody = 'Obtener_Productos_Listado';
          break;
        case 'Obtener_Productos_PrecioYExistencia':
          soapBody = 'Obtener_Productos_PrecioYExistencia'
          break;
        case 'Obtener_GaleriaDeImagenes':
          soapBody = 'Obtener_GaleriaDeImagenes'
          break;
        default:
          break;
      }
      const body = `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <${soapBody} xmlns="http://ws.exel.com.mx:8181/">
              <Usuario>ws_prcom</Usuario>
              <Password>LEMD4#O</Password>
              ${codigos}
            </${soapBody}>
          </soap:Body>
        </soap:Envelope>`;
      var searchParams = new axios.AxiosHeaders();
      var params = new axios.AxiosHeaders();
      searchParams.set('Content-Type', 'text/xml');
      if (supplier.token) {
        if (supplier.token.body_parameters.length > 0) {
          supplier.token.body_parameters.forEach(param => {
            params.set(param.name, param.value);
          });
        }
      }
      // Parámetros de url
      if (apiSelect.parameters) {
        apiSelect.parameters.forEach(param => {
          // params = params.set(param.name, param.value || search);
          params.set(param.name + '=' + param.value || search);
        });
      }

      return new Promise((resolve, reject) => {
        axios.post(supplier.url_base_api,
          body,
          {
            headers: searchParams,
            params
          }).then(async response => {
            const datos = await this.parseXmlToJson(response.data, apiSelect.operation);
            resolve(datos);
          }).catch(error => {
            reject(new Error(error.message));
          });
      });
    }
  }

}
