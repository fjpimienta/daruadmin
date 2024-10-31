export class xProductCt {
  idProducto?: string;
  clave?: string;
  numParte?: string;
  nombre?: string;
  modelo: string;
  idMarca: number;
  idSubCategoria: number;
  subcategoria: string;
  idCategoria: number;
  categoria: string;
  descripcion_corta: string;
  ean: string;
  upc: string;
  sustituto: string;
  activo: number;
  protegido: number;
  existencia: Existencia[];
  price: number;
  moneda: string;
  tipoCambio: number;
  promociones: Promociones[];
  especificaciones: IEspecificaciones[];
}

export class IEspecificaciones {
  agrupadoPor: string;
  tipo: string;
  valor: string;
}

export class Existencia {
  almacen: string;
  cantidad: number;
}

export class Promociones {
  tipo: string;
  promocion: string;
  vigencia: Vigencia;
}

export class Vigencia {
  inicio: string;
  fin: string;
}
