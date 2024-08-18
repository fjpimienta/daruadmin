import gql from 'graphql-tag';
import { PRODUCT_FRAGMENT } from '@graphql/operations/fragment/product';
import { ORDERSINTTELEC_FRAGMENT } from '@graphql/operations/fragment/suppliers/inttelec';

export const PRODUCTOSINTTELEC_LIST_QUERY = gql`
  query listProductsInttelec {
  listProductsInttelec {
      status
      message
      listProductsInttelec {
        ...ProductObject
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const ORDERSINTTELEC_LIST_QUERY = gql`
  query ordersInttelec {
    ordersInttelec {
      status
      message
      ordersInttelec {
        ...ListOrdersInttelecObject
      }
    }
  }
  ${ORDERSINTTELEC_FRAGMENT}
`;
