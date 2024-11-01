import gql from 'graphql-tag';

export const PRODUCT_FRAGMENT = gql`
  fragment ProductObject on Product {
    id
    name
    slug
    short_desc
    price
    sale_price
    exchangeRate
    review
    ratings
    until
    stock
    top
    featured
    new
    author
    sold
    partnumber
    sku
    upc
    category {
      name
      slug
      pivot {
        product_id
        product_category_id
      }
    }
    subCategory {
      name
      slug
      pivot {
        product_id
        product_category_id
      }
    }
    brand
    brands {
      name
      slug
      pivot {
        product_id
        brand_id
      }
    }
    model
    peso
    pictures {
      width
      height
      url
      pivot {
        related_id
        upload_file_id
      }
    }
    sm_pictures {
      width
      height
      url
      pivot {
        related_id
        upload_file_id
      }
    }
    variants {
      id
      color
      color_name
      price
      pivot {
        product_id
        component_id
      }
      size {
        id
        name
        slug
        pivot {
          components_variants_variant_id
          component_id
        }
      }
    }
    unidadDeMedida {
      id
      name
      slug
    }
    active
    suppliersProd {
      idProveedor
      codigo
      price
      sale_price
      moneda
      branchOffices {
        name
        estado
        cantidad
      }
    }
    descuentos {
      total_descuento
      moneda_descuento
      precio_descuento
    }
    promociones {
      clave_promocion
      descripcion_promocion
      vencimiento_promocion
      disponible_en_promocion
      porciento
    }
    especificaciones {
      agrupadoPor
      tipo
      valor
    }
    sheetJson
  }
`;

export const PRODUCT_ADMIN_FRAGMENT = gql`
  fragment ProductObjectAdmin on Product {
    id
    name
    price
    sale_price
    exchangeRate
    stock
    top
    featured
    partnumber
    sku
    brand
    pictures {
      width
      height
      url
      pivot {
        related_id
        upload_file_id
      }
    }
    active
    suppliersProd {
      idProveedor
      codigo
      price
      sale_price
      moneda
      branchOffices {
        name
        estado
        cantidad
      }
    }
    sheetJson
  }
`;
