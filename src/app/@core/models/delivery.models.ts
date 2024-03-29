
import { Cupon } from './cupon.models';
import { InvoiceConfigInput } from './delivery/invoiceConfig.models';
import { ChargeOpenpayInput } from './delivery/_openpay.models';
import { OrderCt } from './delivery/orderct.models';
import { OrderCva } from './delivery/ordercva.models';
import { UserInput } from './delivery/user.models';
import { Warehouse } from './delivery/warehouse.models';

/**
 * Clase de Envios
 */
export class Delivery {
  id?: string;
  deliveryId?: string;
  cliente?: string;
  cupon?: Cupon;
  discount?: number;
  importe?: number;
  registerDate?: string;
  user?: UserInput;
  chargeOpenpay?: ChargeOpenpayInput;
  warehouses?: Warehouse[];
  ordersCt?: OrderCt[];
  ordersCva?: OrderCva[];
  invoiceConfig?: InvoiceConfigInput;
  statusError?: boolean;
  messageError?: string;
  status?: string;
  lastUpdate?: string;
}
