import { Injectable } from '@angular/core';
import { ADD_PRODUCT, ADD_PRODUCT_LIST, BLOCK_PRODUCT, UPDATE_PRODUCT } from '@graphql/operations/mutation/product';
import { PRODUCTS_LIST_QUERY, PRODUCT_FIELD_QUERY, PRODUCT_ICECAT_QUERY, PRODUCT_ID_QUERY, PRODUCT_QUERY } from '@graphql/operations/query/product';
import { ApiService } from '@graphql/services/api.service';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ACTIVE_FILTERS } from '@core/constants/filters';
import { Product } from '@core/models/product.models';

@Injectable({
  providedIn: 'root'
})
export class ProductsService extends ApiService {

  constructor(apollo: Apollo, public http: HttpClient) {
    super(apollo);
  }

  add(product: Product) {
    console.log('producto: ', product);
    return this.set(
      ADD_PRODUCT,
      {
        product
      }, {}).pipe(map((result: any) => {
        return result.addProduct;
      })
      );
  }

  addList(products: [Product]) {
    return this.set(
      ADD_PRODUCT_LIST,
      {
        products
      }, {}).pipe(map((result: any) => {
        return result.addProducts;
      })
      );
  }

  update(product: Product) {
    return this.set(
      UPDATE_PRODUCT,
      {
        product
      }, {}).pipe(map((result: any) => {
        return result.updateProduct;
      })
      );
  }

  unblock(id: string, unblock: boolean = false, admin: boolean = false) {
    return this.set(
      BLOCK_PRODUCT,
      {
        id,
        unblock,
        admin
      }, {}).pipe(map((result: any) => {
        return result.blockProduct;
      })
      );
  }

  async getProducts(page: number = 1, itemsPage: number = 10, filterActiveValues: ACTIVE_FILTERS = ACTIVE_FILTERS.ACTIVE): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(PRODUCTS_LIST_QUERY, {
        itemsPage, page, filterActiveValues
      }, {}).subscribe(
        (result: any) => {
          resolve(result.products);
        },
        (error: any) => {
          reject(error);
        });
    });
  }

  async getProduct(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(PRODUCT_QUERY, {}, {}).subscribe(
        (result: any) => {
          resolve(result.product);
        },
        (error: any) => {
          reject(error);
        });
    });
  }

  async getProductField(partNumber: String): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(PRODUCT_FIELD_QUERY, { partNumber }, {}).subscribe(
        (result: any) => {
          console.log('result: ', result);
          resolve(result.product);
        },
        (error: any) => {
          reject(error);
        });
    });
  }

  async getIcecatProduct(brandIcecat: String, productIcecat: String): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(PRODUCT_ICECAT_QUERY, { brandIcecat, productIcecat }, {}).subscribe(
        (result: any) => {
          console.log('result: ', result);
          resolve(result.icecatProductLocal);
        },
        (error: any) => {
          reject(error);
        });
    });
  }

  next() {
    return this.get(
      PRODUCT_ID_QUERY, {}, {}, false
    ).pipe(map((result: any) => {
      return result.productId.productId;
    }));
  }

  addImages(formData: FormData) {
    const boundary = '---------------------------' + Date.now();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'multipart/form-data; boundary=' + boundary);
    const options = { headers };
    console.log('options: ', options);
    console.log('service.addImages/formData. ', formData);
    return this.http.post('http://api.daru.mx:3000/uploadFile', formData, options)
      .subscribe({
        next: (response) => console.log('response: ', response),
        error: (error) => console.log('error: ', error)
      });
  }
}
