import { OrderCtConfirmResponse, OrderCtResponse } from './orderctresponse.models';


/**
 * Clase de Ordenes para CT
 */
export class OrderCt {
  idPedido: number;
  almacen: string;
  tipoPago: string;
  guiaConnect: GuiaConnect;
  envio: EnvioCt[];
  productoCt: ProductoCt[];
  cfdi: string;
  orderCtResponse?: OrderCtResponse;
  orderCtConfirmResponse?: OrderCtConfirmResponse;
}

export class GuiaConnect {
  generarGuia: boolean;
  paqueteria: string;
}

/**
 * Clase de Envios para CT
 */
export class EnvioCt {
  nombre: string;
  direccion: string;
  entreCalles: string;
  noExterior: string;
  noInterior: string;
  colonia: string;
  estado: string;
  ciudad: string;
  codigoPostal: string;
  telefono: number;
}

/**
 * Clase interna de Productos CT
 */
export class ProductoCt {
  cantidad: number;
  clave: string;
  precio: number;
  moneda: string;
}

export class OrderCtConfirm {
  folio: string;
}
