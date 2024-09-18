import gql from 'graphql-tag';
import { PRODUCT_FRAGMENT } from '../fragment/product';
import { RESULT_INFO_FRAGMENT } from '../fragment/result-info';
import { PRODUCT_ICECAT_FRAGMENT } from '../fragment/productIcecat';

export const PRODUCTS_LIST_QUERY = gql`
  query productList($page: Int, $itemsPage: Int, $active: ActiveFilterEnum, $filterName: String,
    $withImages: Boolean) {
    products(page: $page, itemsPage: $itemsPage, active: $active, filterName: $filterName,
      withImages: $withImages) {
      info {
        ...ResultInfoObject
      }
      status
      message
      products {
        ...ProductObject
      }
    }
  }
  ${PRODUCT_FRAGMENT}
  ${RESULT_INFO_FRAGMENT}
`;

export const PRODUCT_QUERY = gql`
  query product($id: ID) {
    product(id: $id) {
      status
      message
      product {
        ...ProductObject
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const PRODUCT_FIELD_QUERY = gql`
  query productField($partNumber: String) {
    productField(partNumber: $partNumber) {
      status
      message
      productField {
        ...ProductObject
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const PRODUCT_ICECAT_QUERY = gql`
  query icecatProductLocal($brandIcecat: String, $productIcecat: String) {
    icecatProductLocal(brandIcecat: $brandIcecat, productIcecat: $productIcecat) {
      status
      message
      icecatProductLocal {
        ...ProductIcecatObject
      }
    }
  }
  ${PRODUCT_ICECAT_FRAGMENT}
`;

export const PRODUCT_DATA_QUERY = gql`
   query productData($include: Boolean!) {
      product{
         status
         message
         product {
            ...ProductObject
         }
      }
   }
   ${PRODUCT_FRAGMENT}
`;

export const PRODUCT_ID_QUERY = gql`
query {
   productId{
      status
      message
      productId
   }
}
`;

export const ADD_IMAGES = gql`
  mutation addImages($supplierId: String) {
    addImages(supplierId: $supplierId) {
        status
        message
        products {
          ...ProductObject
        }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const ADD_JSONS = gql`
  mutation addJsons($supplierId: String) {
    addJsons(supplierId: $supplierId) {
        status
        message
        products {
          ...ProductObject
        }
    }
  }
  ${PRODUCT_FRAGMENT}
`;
