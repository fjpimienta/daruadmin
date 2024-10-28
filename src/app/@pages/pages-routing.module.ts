import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/@core/guards/auth.guard';

import { CalendarComponent } from './calendar/calendar.component';
import { BrandsComponent } from './catalogs/brands/brands.component';
import { CategoriesComponent } from './catalogs/categories/categories.component';
import { ConfigComponent } from './catalogs/config/config.component';
import { GroupsComponent } from './catalogs/groups/groups.component';
import { ModelsComponent } from './catalogs/models/models.component';
import { ProductsComponent } from './catalogs/products/products.component';
import { SubcategoriesComponent } from './catalogs/subcategories/subcategories.component';
import { TagsComponent } from './catalogs/tags/tags.component';
import { UsersComponent } from './catalogs/users/users.component';
import { ChatComponent } from './chat/chat.component';
import { DefaultComponent } from './dashboards/default/default.component';
import { FilemanagerComponent } from './filemanager/filemanager.component';
import { CuponsComponent } from './catalogs/cupons/cupons.component';
import { ClientsComponent } from './catalogs/clients/clients.component';
import { WelcomesComponent } from './catalogs/welcomes/welcomes.component';
import { DictionaryComponent } from './catalogs/dictionary/dictionary.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard' },

  {
    path: 'dashboard', component: DefaultComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'products', component: ProductsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'brands', component: BrandsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'models', component: ModelsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dictionary', component: DictionaryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'groups', component: GroupsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'categories', component: CategoriesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'subcategories', component: SubcategoriesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'tags', component: TagsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'users', component: UsersComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'clients', component: ClientsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'config', component: ConfigComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'cupons', component: CuponsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'welcomes', component: WelcomesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sales',
    loadChildren: () => import('./sales/sales.module').then(m => m.SalesModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.module').then(m => m.OrdersModule)
  },
  {
    path: 'charges',
    loadChildren: () => import('./charges/charges.module').then(m => m.ChargesModule)
  },


  { path: 'calendar', component: CalendarComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'filemanager', component: FilemanagerComponent },
  { path: 'dashboards', loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule) },
  { path: 'ecommerce', loadChildren: () => import('./ecommerce/ecommerce.module').then(m => m.EcommerceModule) },
  { path: 'crypto', loadChildren: () => import('./crypto/crypto.module').then(m => m.CryptoModule) },
  { path: 'email', loadChildren: () => import('./email/email.module').then(m => m.EmailModule) },
  { path: 'invoices', loadChildren: () => import('./invoices/invoices.module').then(m => m.InvoicesModule) },
  { path: 'projects', loadChildren: () => import('./projects/projects.module').then(m => m.ProjectsModule) },
  { path: 'tasks', loadChildren: () => import('./tasks/tasks.module').then(m => m.TasksModule) },
  { path: 'contacts', loadChildren: () => import('./contacts/contacts.module').then(m => m.ContactsModule) },
  { path: 'blog', loadChildren: () => import('./blog/blog.module').then(m => m.BlogModule) },
  { path: 'pages', loadChildren: () => import('./utility/utility.module').then(m => m.UtilityModule) },
  { path: 'ui', loadChildren: () => import('./ui/ui.module').then(m => m.UiModule) },
  { path: 'form', loadChildren: () => import('./form/form.module').then(m => m.FormModule) },
  { path: 'tables', loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule) },
  { path: 'icons', loadChildren: () => import('./icons/icons.module').then(m => m.IconsModule) },
  { path: 'charts', loadChildren: () => import('./chart/chart.module').then(m => m.ChartModule) },
  { path: 'maps', loadChildren: () => import('./maps/maps.module').then(m => m.MapsModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
