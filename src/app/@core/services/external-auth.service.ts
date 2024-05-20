import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ILoginCTForm, ILoginSyscomForm } from '@core/interfaces/extern-login.interface';
import { IApis, ISupplier } from '@core/interfaces/supplier.interface';
import { Product } from '@core/models/product.models';
import { map } from 'rxjs/operators';
import axios, { } from 'axios';
import { Apollo } from 'apollo-angular';
import { ApiService } from '@graphql/services/api.service';
import { BRANDSCVA_LIST_QUERY, GROUPSCVA_LIST_QUERY, PAQUETERIASCVA_LIST_QUERY, PRODUCTOSCVA_LIST_QUERY, PRODUCTSPRICECVA_LIST_QUERY, SOLUCIONESCVA_LIST_QUERY, SUCURSALESCVA_LIST_QUERY } from '@graphql/operations/query/suppliers/cva';
import { Catalog } from '@core/models/catalog.models';
import { PRODUCTOSCT_LIST_QUERY, PRODUCTSCT_JSON_QUERY, PRODUCTSCT_XML_QUERY, STATUS_ORDER_CT } from '@graphql/operations/query/suppliers/ct';
import { CATALOGSINGRAM_ONE_QUERY, CATALOGSINGRAM_LIST_QUERY, PRODUCTOSINGRAM_LIST_QUERY } from '@graphql/operations/query/suppliers/ingram';
import { PRODUCTOSSYSCOM_LIST_QUERY } from '@graphql/operations/query/suppliers/syscom';
import { PRODUCTOSDAISYTEK_LIST_QUERY } from '@graphql/operations/query/suppliers/daisytek';

declare const require;
const xml2js = require('xml2js');

@Injectable({
  providedIn: 'root'
})
export class ExternalAuthService extends ApiService {
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
    public http: HttpClient,
    apollo: Apollo
  ) {
    super(apollo);
  }

  //#region Token
  async getToken(
    supplier: ISupplier
  ): Promise<any> {
    const headers = new Headers();
    const params = new HttpParams();
    switch (supplier.slug) {
      case 'ct':
        const optionsCT = {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'david.silva@daru.mx',
            cliente: 'VHA2391',
            rfc: 'DIN2206222D3'
          })
        };
        return await fetch('cliente/token', optionsCT)
          .then(response => response.json())
          .then(async response => {
            return await response;
          })
          .catch(err => console.error(err));
      case 'cva':
        const tokenBearer = '7ee694a5bae5098487a5a8b9d8392666';
        return await tokenBearer;
      case 'ingram':
        const username = 'ZpGbzheF2yQlsfA00vuvu4JdXkf76w9L';
        const password = 'WOPaXqEcyG3kQGJw';
        const encodedCredentials = btoa(`${username}:${password}`);
        const optionsIngram = {
          method: 'POST',
          headers: {
            Authorization: `Basic ${encodedCredentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'client_credentials'
          }).toString(),
          redirect: 'manual' as RequestRedirect
        };
        return await fetch('https://api.ingrammicro.com:443/oauth/oauth30/token', optionsIngram)
          .then(response => response.json())
          .then(async response => {
            return await response;
          })
          .catch(err => console.error(err));
      case '99minutos':
        const options = {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            client_id: '18b99050-5cb7-4e67-928d-3f16d109b8c5',
            client_secret: 'gdKeiQVGBxRAY~ICpdnJ_7aKEd'
          })
        };
        return await fetch('99minutos/api/v3/oauth/token', options)
          .then(response => response.json())
          .then(async response => {
            return await response;
          })
          .catch(err => console.error(err));
    }
  }
  //#endregion Token

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

  async getSyscomCatalogAllBrands(supplier: ISupplier, apiSelect: IApis, token: string, catalogValues: Catalog[]): Promise<any> {
    if (apiSelect.parameters) {
      switch (supplier.slug) {
        case 'syscom':
          const products: Product[] = [];
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

        case 'ingram':
          // return await this.onReadTxtIngram().toPromise();
          const filePath = 'assets/uploads/txt/PRICE.TXT';
          const jsonData = [];
          try {
            const data = await this.http.get(filePath, { responseType: 'text' }).toPromise();
            const lines = data.split('\n');
            lines.forEach(line => {
              const fields = line.split(',');
              const rowData = {};
              fields.forEach((field, index) => {
                const fieldName = `field${index + 1}`;
                rowData[fieldName] = field;
              });
              jsonData.push(rowData);
            });
            const cleanedData = await this.cleanUpData(jsonData);
            return cleanedData;
          } catch (error) {
            console.error('Error al leer el archivo:', error);
            throw error;
          }
        default:
          break;
      }
    }
  }

  async getCatalogXMLAllBrands(supplier: ISupplier, apiSelect: IApis, search: string = '', catalogValues: Catalog[]): Promise<any> {
    if (apiSelect.parameters) {
      switch (supplier.slug) {
        case 'cva':
          const products: Product[] = [];
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
                  params = params.set(param.name, param.value);
                } else if (param.name === 'promos' || param.name === 'porcentajes' || param.name === 'sucursales' || param.name === 'TotalSuc') {
                  params = params.set(param.name, param.value);
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
                  return await this.parseXmlToJson(xml, apiSelect.operation);
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
          .catch(err => err);
      case 'marcas2.xml':
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => response.marcas.marca)
          .catch(err => err);
      case 'grupos.xml':
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => response.grupos.grupo)
          .catch(err => err);
      case 'grupos2.xml':
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => response.grupos.grupo)
          .catch(err => err);
      case 'soluciones.xml':
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => response.soluciones.solucion)
          .catch(err => err);
      case 'sucursales.xml':
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => response.sucursales.sucursal)
          .catch(err => err);
      case 'Obtener_Marcas':                                                                // SOAP Exel
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => JSON.parse(response['soap:Envelope']['soap:Body'].Obtener_MarcasResponse.Obtener_MarcasResult))
          .catch(err => new Error(err.message));
      case 'Obtener_Categorias':                                                            // SOAP Exel
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => JSON.parse(response['soap:Envelope']['soap:Body'].Obtener_CategoriasResponse.Obtener_CategoriasResult))
          .catch(err => new Error(err.message));
      case 'Obtener_Productos_Listado':                                                     // SOAP Exel
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => JSON.parse(response['soap:Envelope']['soap:Body']
            .Obtener_Productos_ListadoResponse.Obtener_Productos_ListadoResult))
          .catch(err => new Error(err.message));
      case 'Obtener_Productos_PrecioYExistencia':                                           // SOAP Exel
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => JSON.parse(response['soap:Envelope']['soap:Body']
            .Obtener_Productos_PrecioYExistenciaResponse.Obtener_Productos_PrecioYExistenciaResult))
          .catch(err => new Error(err.message));
      case 'Obtener_GaleriaDeImagenes':                                                     // SOAP Exel
        return await xml2js
          .parseStringPromise(xml, { explicitArray: false })
          .then(response => JSON.parse(response['soap:Envelope']['soap:Body']
            .Obtener_GaleriaDeImagenesResponse.Obtener_GaleriaDeImagenesResult))
          .catch(err => new Error(err.message));
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
          soapBody = 'Obtener_Categorias';
          break;
        case 'Obtener_Productos_Listado':
          soapBody = 'Obtener_Productos_Listado';
          break;
        case 'Obtener_Productos_PrecioYExistencia':
          soapBody = 'Obtener_Productos_PrecioYExistencia';
          break;
        case 'Obtener_GaleriaDeImagenes':
          soapBody = 'Obtener_GaleriaDeImagenes';
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
      const searchParams = new axios.AxiosHeaders();
      const params = new axios.AxiosHeaders();
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

  async onReadTxtIngram(): Promise<any> {
    const filePath = 'assets/uploads/txt/PRICE.TXT';
    const jsonData = [];
    return await this.http.get(filePath, { responseType: 'text' })
      .subscribe(async data => {
        const lines = data.split('\n');
        lines.forEach(line => {
          const fields = line.split(',');
          const rowData = {};
          fields.forEach((field, index) => {
            const fieldName = `field${index + 1}`;
            rowData[fieldName] = field;
          });
          jsonData.push(rowData);
        });
        return await await this.cleanUpData(jsonData);
        // Aquí puedes realizar las operaciones necesarias con los datos JSON
      },
        error => {
          console.error('Error al leer el archivo:', error);
        });
  }

  async cleanUpData(jsonData: any[]) {
    const cleanedData = [];
    jsonData.forEach(item => {
      const cleanedItem = {};
      Object.entries(item).forEach(([key, value]) => {
        const cleanedValue = (value as string).replace(/"/g, '').trim();
        cleanedItem[key] = cleanedValue;
      });
      cleanedData.push(cleanedItem);
    });
    return await cleanedData;
  }

  //#region CVA
  async getBrandsCva(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(BRANDSCVA_LIST_QUERY, {}, {}).subscribe(
        (result: any) => {
          resolve(result.listBrandsCva);
        },
        (error: any) => {
          reject(error);
        });
    });
  }

  async getGroupsCva(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(GROUPSCVA_LIST_QUERY, {}, {}).subscribe(
        (result: any) => {
          resolve(result.listGroupsCva);
        },
        (error: any) => {
          reject(error);
        });
    });
  }

  async getSolucionesCva(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(SOLUCIONESCVA_LIST_QUERY, {}, {}).subscribe(
        (result: any) => {
          resolve(result.listSolucionesCva);
        },
        (error: any) => {
          reject(error);
        });
    });
  }

  async getSucursalesCva(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(SUCURSALESCVA_LIST_QUERY, {}, {}).subscribe(
        (result: any) => {
          resolve(result.listSucursalesCva);
        },
        (error: any) => {
          reject(error);
        });
    });
  }

  async getPaqueteriasCva(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(PAQUETERIASCVA_LIST_QUERY, {}, {}).subscribe(
        (result: any) => {
          resolve(result.listPaqueteriasCva);
        },
        (error: any) => {
          reject(error);
        });
    });
  }

  async getProductsCva(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(PRODUCTOSCVA_LIST_QUERY, {}, {}).subscribe(
        (result: any) => {
          resolve(result.listProductsCva);
        },
        (error: any) => {
          reject(error);
        });
    });
  }

  async getProductsPricesCva(groupName: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(PRODUCTSPRICECVA_LIST_QUERY, {
        groupName
      }, {}).subscribe(
        (result: any) => {
          resolve(result.listPricesCva);
        },
        (error: any) => {
          reject(error);
        });
    });
  }
  //#endregion

  //#region CT
  async getProductsCt(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(PRODUCTOSCT_LIST_QUERY, {}, {}).subscribe(
        (result: any) => {
          resolve(result.listProductsCt);
        },
        (error: any) => {
          reject(error);
        });
    });
  }

  async getProductsCtJson(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(PRODUCTSCT_JSON_QUERY, {}, {}).subscribe(
        (result: any) => {
          resolve(result.jsonProductsCt);
        },
        (error: any) => {
          reject(error);
        });
    });
  }

  async getProductsCtXml(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(PRODUCTSCT_XML_QUERY, {}, {}).subscribe(
        (result: any) => {
          resolve(result.jsonProductsCtHP);
        },
        (error: any) => {
          reject(error);
        });
    });
  }

  async statusOrdersCt(folio: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(STATUS_ORDER_CT, {
        folio
      }, {}).subscribe(
        (result: any) => {
          resolve(result.statusOrdersCt);
        },
        (error: any) => {
          reject(error);
        });
    });
  }
  //#endregion

  //#region Ingram
  async getProductsIngram(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(PRODUCTOSINGRAM_LIST_QUERY, {}, {}).subscribe(
        (result: any) => {
          resolve(result.listProductsIngram);
        },
        (error: any) => {
          reject(error);
        });
    });
  }
  async getCatalogIngrams(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(CATALOGSINGRAM_LIST_QUERY, {}, {}).subscribe(
        (result: any) => {
          resolve(result.catalogIngrams);
        },
        (error: any) => {
          reject(error);
        });
    });
  }
  async getCatalogIngram(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(CATALOGSINGRAM_ONE_QUERY, {}, {}).subscribe(
        (result: any) => {
          resolve(result.catalogIngrams);
        },
        (error: any) => {
          reject(error);
        });
    });
  }
  //#endregion
  //#region Ingram
  async getProductsSyscom(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(PRODUCTOSSYSCOM_LIST_QUERY, {}, {}).subscribe(
        (result: any) => {
          resolve(result.listProductsSyscom);
        },
        (error: any) => {
          reject(error);
        });
    });
  }
  //#endregion
  //#region Daisytek
  async getProductsDaisytek(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(PRODUCTOSDAISYTEK_LIST_QUERY, {}, {}).subscribe(
        (result: any) => {
          resolve(result.listProductsDaisytek);
        },
        (error: any) => {
          reject(error);
        });
    });
  }
  //#endregion
}
