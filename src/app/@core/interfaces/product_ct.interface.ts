export interface xIProductCt {
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
  existencia: IExistencia[];
  price: number;
  moneda: string;
  tipoCambio: number;
  promociones: IPromociones[];
  especificaciones: IEspecificaciones[];
}

export interface IEspecificaciones {
  agrupadoPor: string;
  tipo: string;
  valor: string;
}

export interface IExistencia {
  almacen: string;
  cantidad: number;
}

export interface IPromociones {
  tipo: string;
  promocion: string;
  vigencia: IVigencia;
}

export interface IVigencia {
  inicio: string;
  fin: string;
}
