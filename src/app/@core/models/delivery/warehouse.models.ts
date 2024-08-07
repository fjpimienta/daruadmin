import { SupplierProd } from '../product.models';
import { CartItem } from './cart-item';
import { ProductShipment } from './productShipment.models';
import { Shipment } from './shipment.models';

/**
 * Clase de los almacenes de envios.
 */
export class Warehouse {
  id?: string;
  cp: string;
  name: string;
  estado: string;
  latitud: string;
  longitud: string;
  suppliersProd: SupplierProd;
  products: CartItem[];
  productShipments: ProductShipment[];
  shipments: Shipment[];
}

