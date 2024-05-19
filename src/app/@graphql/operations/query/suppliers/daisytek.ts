import gql from 'graphql-tag';
import { PRODUCT_FRAGMENT } from '@graphql/operations/fragment/product';
import { ORDERSDAISYTEK_FRAGMENT } from '@graphql/operations/fragment/suppliers/daisytek';

export const PRODUCTOSDAISYTEK_LIST_QUERY = gql`
  query listProductsDaisytek {
  listProductsDaisytek {
      status
      message
      listProductsDaisytek {
        ...ProductObject
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const ORDERSDAISYTEK_LIST_QUERY = gql`
  query ordersDaisytek {
    ordersDaisytek {
      status
      message
      ordersDaisytek {
        ...ListOrdersDaisytekObject
      }
    }
  }
  ${ORDERSDAISYTEK_FRAGMENT}
`;
