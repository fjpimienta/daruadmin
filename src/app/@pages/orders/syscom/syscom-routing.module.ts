import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListOrdersSyscomComponent } from './list-orders-syscom/list-orders-syscom.component';
import { DetailOrderSyscomComponent } from './detail-order-syscom/detail-order-syscom.component';

const routes: Routes = [
  {
    path: 'list',
    component: ListOrdersSyscomComponent
  },
  {
    path: 'detail',
    component: DetailOrderSyscomComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SyscomRoutingModule { }
