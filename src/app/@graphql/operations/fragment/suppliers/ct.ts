import gql from 'graphql-tag';

export const TOKENCT_FRAGMENT = gql`
  fragment TokenCtObject on TokenCt {
    token
    time
  }
`;

export const PRODUCTOSCT_FRAGMENT = gql`
  fragment ProductosCtObject on ResponseCtsStockProducts {
    precio
    moneda
    almacenes {
      almacenPromocion {
        key
        value
        promocionString
      }
    }
    codigo
  }
`;

export const PRODUCTSCT_FTP_FRAGMENT = gql`
  fragment ProductsCtFTPObject on ResponseCtsJsonProducts {
      idProducto
      clave
      numParte
      nombre
      modelo
      idMarca
      marca
      idSubCategoria
      subcategoria
      idCategoria
      categoria
      descripcion_corta
      ean
      upc
      sustituto
      activo
      protegido
      existencia {
        HMO
        OBR
        LMO
        CLN
        DGO
        TRN
        CHI
        AGS
        QRO
        SLP
        LEO
        GDL
        MOR
        SLT
        XLP
        VER
        COL
        CTZ
        TAM
        PUE
        VHA
        TXA
        MTY
        TPC
        MID
        OAX
        MAZ
        CUE
        TOL
        PAC
        CUN
        DFP
        DFA
        ZAC
        DFT
        ACA
        IRA
        DFC
        TXL
        CAM
        ACX
        URP
        CDV
        CEL
        D2A
        CMT
      }
      precio
      moneda
      tipoCambio
      especificaciones {
        tipo
        valor
      }
      promociones{
        tipo
        promocion
        vigencia {
          inicio
          fin
        }
      }
      imagen
  }
`;

export const ORDERSCT_FRAGMENT = gql`
  fragment OrdersCtObject on ResponseCtsListOrders {
    idPedido
    almacen
    tipoPago
    guiaConnect {
      generarGuia
      paqueteria
    }
    productoCt {
      cantidad
      clave
      precio
      moneda
    }
    respuestaCT {
      pedidoWeb
      fecha
      tipoDeCambio
      estatus
      errores {
        errorCode
        errorMessage
        errorReference
      }
    }
  }
`;
