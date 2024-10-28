import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DictionaryRoutingModule } from './dictionary-routing.module';
import { DictionaryComponent } from './dictionary.component';
import { ImportarModule } from '@shared/importar/importar.module';
import { TablePaginationModule } from '@shared/table-pagination/table-pagination.module';
import { CaptureDictionaryModule } from './capture-dictionary/capture-dictionary.module';


@NgModule({
  declarations: [
    DictionaryComponent
  ],
  imports: [
    CommonModule,
    DictionaryRoutingModule,
    ImportarModule,
    TablePaginationModule,
    CaptureDictionaryModule
  ]
})
export class DictionaryModule { }
