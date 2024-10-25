import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ICatalog } from 'src/app/@core/interfaces/catalog.interface';
import { ADD_DICTIONARY, ADD_DICTIONARY_LIST, BLOCK_DICTIONARY, UPDATE_DICTIONARY } from 'src/app/@graphql/operations/mutation/dictionarys';
import { DICTIONARYS_LIST_QUERY, DICTIONARY_ID_QUERY } from 'src/app/@graphql/operations/query/dictionarys';
import { ApiService } from 'src/app/@graphql/services/api.service';
import { map } from 'rxjs/operators';
import { ISupplier } from '@core/interfaces/supplier.interface';
import { ACTIVE_FILTERS } from '@core/constants/filters';

@Injectable({
  providedIn: 'root'
})
export class DictionarysService extends ApiService {

  constructor(apollo: Apollo) {
    super(apollo);
  }

  add(dictionary: ICatalog) {
    return this.set(
      ADD_DICTIONARY,
      {
        dictionary
      }, {}).pipe(map((result: any) => {
        return result.addDictionary;
      })
      );
  }

  addList(dictionarys: [ICatalog], supplier: ISupplier) {
    return this.set(
      ADD_DICTIONARY_LIST,
      {
        dictionarys,
        supplier
      }, {}).pipe(map((result: any) => {
        return result.addDictionarys;
      })
      );
  }

  update(dictionary: ICatalog) {
    return this.set(
      UPDATE_DICTIONARY,
      {
        dictionary
      }, {}).pipe(map((result: any) => {
        return result.updateDictionary;
      })
      );
  }

  unblock(id: string, unblock: boolean = false, admin: boolean = false) {
    return this.set(
      BLOCK_DICTIONARY,
      {
        id,
        unblock,
        admin
      }, {}).pipe(map((result: any) => {
        return result.blockDictionary;
      })
      );
  }

  getDictionarys(page: number = 1, itemsPage: number = 10, filterActiveValues: ACTIVE_FILTERS = ACTIVE_FILTERS.ACTIVE) {
    return this.get(DICTIONARYS_LIST_QUERY, {
      itemsPage, page, filterActiveValues
    }).pipe(map((result: any) => {
      return result.dictionarys;
    }));
  }

  next() {
    return this.get(
      DICTIONARY_ID_QUERY, {}, {}, false
    ).pipe(map((result: any) => {
      return result.dictionaryId.dictionaryId;
    }));
  }
}
