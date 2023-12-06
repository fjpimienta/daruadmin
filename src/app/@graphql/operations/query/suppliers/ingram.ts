import gql from 'graphql-tag';
import { CATALOGINGRAM_FRAGMENT, PRODUCTSINGRAM_FRAGMENT } from '@graphql/operations/fragment/suppliers/ingram';

export const PRODUCTSINGRAM_LIST_QUERY = gql`
  query pricesIngram {
    pricesIngram {
      status
      message
      pricesIngram {
        ...ProductsIngramObject
      }
    }
  }
  ${PRODUCTSINGRAM_FRAGMENT}
`;

export const CATALOGSINGRAM_ONE_QUERY = gql`
  query catalogIngram($imSKU: String) {
    catalogIngram(imSKU: $imSKU){
      status
      message
      catalogIngram {
        ...CatalogIngramObject
      }
    }
  }
  ${CATALOGINGRAM_FRAGMENT}
`;

export const CATALOGSINGRAM_LIST_QUERY = gql`
  query catalogIngrams{
    catalogIngrams{
      status
      message
      catalogIngrams {
        ...CatalogIngramObject
      }
    }
  }
  ${CATALOGINGRAM_FRAGMENT}
`;
