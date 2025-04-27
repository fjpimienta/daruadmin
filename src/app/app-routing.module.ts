import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './@core/guards/auth.guard';
import { LayoutComponent } from './@layouts/layout.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./@account/account.module').then(m => m.AccountModule)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: '',
        loadChildren: () => import('./@pages/pages.module').then(m => m.PagesModule)
      },
      {
        path: 'pages',
        loadChildren: () => import('./@extrapages/extrapages.module').then(m => m.ExtrapagesModule)
      },
      {
        path: 'catalogs',
        loadChildren: () => import('./@pages/catalogs/catalogs.module').then(m => m.CatalogsModule)
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      relativeLinkResolution: 'legacy',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
