import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'config',
    loadChildren: () => import('./config/config.module').then(m => m.ConfigModule),
    data: { pageTitle: 'Configuraciones' }
  },
  {
    path: 'cupons',
    loadChildren: () => import('./cupons/cupons.module').then(m => m.CuponsModule),
    data: { pageTitle: 'Cupones' }
  },
  {
    path: 'dictionary',
    loadChildren: () => import('./dictionary/dictionary.module').then(m => m.DictionaryModule),
    data: { pageTitle: 'Diccionario de Datos' }
  },
  {
    path: 'brands',
    loadChildren: () => import('./brands/brands.module').then(m => m.BrandsModule),
    data: { pageTitle: 'Marcas' }
  },
  {
    path: 'models',
    loadChildren: () => import('./models/models.module').then(m => m.ModelsModule),
    data: { pageTitle: 'Modelos' }
  },
  {
    path: 'groups',
    loadChildren: () => import('./groups/groups.module').then(m => m.GroupsModule),
    data: { pageTitle: 'Grupos' }
  },
  {
    path: 'categories',
    loadChildren: () => import('./categories/categories.module').then(m => m.CategoriesModule),
    data: { pageTitle: 'Categorias' }
  },
  {
    path: 'subcategories',
    loadChildren: () => import('./subcategories/subcategories.module').then(m => m.SubcategoriesModule),
    data: { pageTitle: 'SubCategorias' }
  },
  {
    path: 'tags',
    loadChildren: () => import('./tags/tags.module').then(m => m.TagsModule),
    data: { pageTitle: 'Etiquetas' }
  },
  {
    path: 'products',
    loadChildren: () => import('./products/products.module').then(m => m.ProductsModule),
    data: { pageTitle: 'Productos' }
  },
  {
    path: 'users',
    loadChildren: () => import('./users/users.module').then(m => m.UsersModule),
    data: { pageTitle: 'Usuarios' }
  },
  {
    path: 'clients',
    loadChildren: () => import('./clients/clients.module').then(m => m.ClientsModule),
    data: { pageTitle: 'Clientes' }
  },
  {
    path: 'welcomes',
    loadChildren: () => import('./welcomes/welcomes.module').then(m=> m.WelcomesModule),
    data: { pageTitle: 'Bienvenidos' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogsRoutingModule { }
