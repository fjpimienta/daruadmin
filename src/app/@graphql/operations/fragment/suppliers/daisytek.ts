import gql from 'graphql-tag';

export const PRODUCTSDAISYTEK_FRAGMENT = gql`
  fragment ProductObject on ProductDaisytek {
    sku
    manufacturer_sku
    manufacturer
    ean
    title
    description
    currency
    price
    warehouses {
      CDMX {
        stock
        location
      }
      VHM {
        stock
        location
      }
      MTY {
        stock
        location
      }
      GDL {
        stock
        location
      }
      SUR {
        stock
        location
      }
    }
  }
`;

export const ORDERSDAISYTEK_FRAGMENT = gql`
  fragment ListOrdersDaisytekObject on ListOrdersDaisytek {
    subtotal
    total
    currencyCode
    order_number
  }
`;
