import gql from 'graphql-tag';

export const PRODUCTSINTTELEC_FRAGMENT = gql`
  fragment ProductObject on ProductInttelec {
      sku
      manufacturer_sku
      manufacturer
      ean
      upc
      asin
      title
      description
      currency
      price {
        price_unit
      }
      warehouses {
        location_id {
          id
        }
        available_quantity
      }
  }
`;

export const ORDERSINTTELEC_FRAGMENT = gql`
  fragment ListOrdersInttelecObject on ListOrdersInttelec {
    subtotal
    total
    currencyCode
    order_number
  }
`;
