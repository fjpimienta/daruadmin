import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'cva',
    loadChildren: () => import('./cva/cva.module').then(m => m.CvaModule)
  },
  {
    path: 'ct',
    loadChildren: () => import('./ct/ct.module').then(m => m.CtModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
