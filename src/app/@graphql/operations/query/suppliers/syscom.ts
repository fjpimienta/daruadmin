import gql from 'graphql-tag';
import { PRODUCT_FRAGMENT } from '@graphql/operations/fragment/product';
import { FACTURASSYSCOM_FRAGMENT } from '@graphql/operations/fragment/suppliers/syscom';

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

export const ORDERSSYSCOM_LIST_QUERY = gql`
  query facturasSyscom {
    facturasSyscom {
      status
      message
      facturasSyscom {
        ...ListFacturaSyscomObject
      }
    }
  }
  ${FACTURASSYSCOM_FRAGMENT}
`;
