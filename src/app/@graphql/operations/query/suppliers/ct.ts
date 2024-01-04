import gql from 'graphql-tag';
import { ORDERSCT_FRAGMENT, PRODUCTOSCT_FRAGMENT, PRODUCTSCT_FTP_FRAGMENT } from '@graphql/operations/fragment/suppliers/ct';

export const PRODUCTOSCT_LIST_QUERY = gql`
  query stockProductsCt {
    stockProductsCt {
      status
      message
      stockProductsCt {
        ...ProductosCtObject
      }
    }
  }
  ${PRODUCTOSCT_FRAGMENT}
`;

export const PRODUCTSCT_JSON_QUERY = gql`
  query jsonProductsCt {
    jsonProductsCt {
      status
      message
      jsonProductsCt {
        ...ProductsCtFTPObject
      }
    }
  }
  ${PRODUCTSCT_FTP_FRAGMENT}
`;

export const PRODUCTSCT_XML_QUERY = gql`
  query jsonProductsCtHP {
    jsonProductsCtHP {
      status
      message
      jsonProductsCtHP {
        ...ProductsCtFTPObject
      }
    }
  }
  ${PRODUCTSCT_FTP_FRAGMENT}
`;

export const ORDERSCT_LIST_QUERY = gql`
  query listOrdersCt {
    listOrdersCt {
      status
      message
      listOrdersCt {
        ...OrdersCtObject
      }
    }
  }
  ${ORDERSCT_FRAGMENT}
`;
