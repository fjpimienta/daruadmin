import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DictionaryRoutingModule } from './dictionary-routing.module';
import { DictionaryComponent } from './dictionary.component';
import { ImportarModule } from '@shared/importar/importar.module';
import { TablePaginationModule } from '@shared/table-pagination/table-pagination.module';


@NgModule({
  declarations: [
    DictionaryComponent
  ],
  imports: [
    CommonModule,
    DictionaryRoutingModule,
    ImportarModule,
    TablePaginationModule
  ]
})
export class DictionaryModule { }
