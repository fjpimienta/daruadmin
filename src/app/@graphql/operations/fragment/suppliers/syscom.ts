import gql from 'graphql-tag';

export const PRODUCTSSYSCOM_FRAGMENT = gql`
  fragment productSyscomObject on ProductsSyscom {
    producto_id
    modelo
    total_existencia
    titulo
    marca
    sat_key
    img_portada
    link_privado
    categorias {
      id
      nombre
      nivel
    }
    pvol
    marca_logo
    link
    iconos
    peso
    unidad_de_medida {
      codigo_unidad
      nombre
      clave_unidad_sat
    }
    alto
    largo
    ancho
    precios {
      precio_1
      precio_especial
      precio_descuento
      precio_lista
    }
    existencia {
      nuevo
      asterisco {
        a
        b
        c
        d
        e
      }
      detalle {
        detalle1
      }
    }
  }
`;

export const FACTURASSYSCOM_FRAGMENT = gql`
  fragment ListFacturaSyscomObject on ListFacturaSyscom {
    folio_factura
    fecha
    total
    texto
    moneda
    pago_aplicado
    estatus_fiscal
    estatus
    plazo
    folio_pedido
    uuid
  }
`;
