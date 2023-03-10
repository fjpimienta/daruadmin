import { Injectable } from '@angular/core';
import { Config } from '@core/models/config.models';
import { UPDATE_CONFIG } from '@graphql/operations/mutation/configs';
import { CONFIG_QUERY } from '@graphql/operations/query/config';
import { ApiService } from '@graphql/services/api.service';
import { Apollo } from 'apollo-angular';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfigsService extends ApiService {

  configs = new Subject<Config[]>();
  configs$ = this.configs.asObservable();

  constructor(apollo: Apollo) {
    super(apollo);
  }

  getConfig(id: string) {
    return this.get(CONFIG_QUERY, { id })
      .pipe(map((result: any) => {
        return result.config.config;
      }));
  }

  update(config: Config) {
    return this.set(
      UPDATE_CONFIG,
      {
        config
      }, {}).pipe(map((result: any) => {
        return result.updateConfig;
      })
      );
  }
}
