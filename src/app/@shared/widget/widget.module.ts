import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { StatComponent } from './stat/stat.component';
import { TransactionComponent } from './transaction/transaction.component';

@NgModule({
  declarations: [StatComponent, TransactionComponent],
  imports: [
    CommonModule,
    NgbModalModule,
    NgbModule
  ],
  exports: [StatComponent, TransactionComponent]
})
export class WidgetModule { }
