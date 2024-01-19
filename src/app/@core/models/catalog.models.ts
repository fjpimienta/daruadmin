import { Cupon } from './cupon.models';
import { Picture } from './product.models';

export class Catalog {
  id: string;
  description?: string;
  slug?: string;
  order?: number;
  active?: boolean;
  total?: number;
  suppliersCat?: SupplierCat[];
  pictures?: Picture[];
  email?: string;
  name?: string;
  cupon?: string;
}

export class AddCatalog {
  tipo: string;
  item: Catalog;
  list: Catalog[];
  files?: File[];
}

export class AddCupon {
  tipo: string;
  item: Cupon;
  list: Cupon[];
  files?: File[];
}

export class SupplierCat {
  idProveedor: string;
  name: string;
  slug: string;
}
