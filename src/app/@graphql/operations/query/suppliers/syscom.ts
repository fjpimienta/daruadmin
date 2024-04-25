import gql from 'graphql-tag';
import { PRODUCT_FRAGMENT } from '@graphql/operations/fragment/product';

export const PRODUCTOSSYSCOM_LIST_QUERY = gql`
  query listProductsSyscom {
  listProductsSyscom {
      status
      message
      listProductsSyscom {
        ...ProductObject
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;
