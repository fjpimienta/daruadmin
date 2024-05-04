import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SyscomRoutingModule } from './syscom-routing.module';
import { ListOrdersSyscomComponent } from './list-orders-syscom/list-orders-syscom.component';
import { DetailOrderSyscomComponent } from './detail-order-syscom/detail-order-syscom.component';
import { TablePaginationModule } from '@shared/table-pagination/table-pagination.module';


@NgModule({
  declarations: [
    ListOrdersSyscomComponent,
    DetailOrderSyscomComponent
  ],
  imports: [
    CommonModule,
    SyscomRoutingModule,
    TablePaginationModule
  ]
})
export class SyscomModule { }
