import { Injectable } from '@angular/core';
import { IMPORT_SUPPLIER, IMPORT_SUPPLIER_MONTH, IMPORT_SUPPLIER_WEEK } from '@graphql/operations/query/dashboards';
import { ApiService } from '@graphql/services/api.service';
import { Apollo } from 'apollo-angular';

@Injectable({
  providedIn: 'root'
})
export class DashboardsService extends ApiService {

  constructor(apollo: Apollo) {
    super(apollo);
  }

  async getImportBySupplier(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(IMPORT_SUPPLIER, {}, {}).subscribe(
        (result: any) => {
          resolve(result.importBySupplier);
        },
        (error: any) => {
          reject(error);
        });
    });
  }

  async getImportBySupplierByMonth(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(IMPORT_SUPPLIER_MONTH, {}, {}).subscribe(
        (result: any) => {
          resolve(result.importBySupplierByMonth);
        },
        (error: any) => {
          reject(error);
        });
    });
  }

  async getImportBySupplierByWeek(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(IMPORT_SUPPLIER_WEEK, {}, {}).subscribe(
        (result: any) => {
          resolve(result.importBySupplierByWeek);
        },
        (error: any) => {
          reject(error);
        });
    });
  }
}
