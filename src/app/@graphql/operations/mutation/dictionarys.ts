import gql from 'graphql-tag';
import { DICTIONARY_FRAGMENT } from 'src/app/@graphql/operations/fragment/dictionary';

export const ADD_DICTIONARY = gql`
   mutation addDictionary($dictionary: CatalogInput!) {
      addDictionary(dictionary: $dictionary) {
         status
         message
         dictionary {
            ...DictionaryObject
         }
      }
   }
   ${DICTIONARY_FRAGMENT}
`;

export const ADD_DICTIONARY_LIST = gql`
   mutation addDictionarys($dictionarys: [CatalogInput!]!, $supplier: SupplierInput) {
      addDictionarys(dictionarys: $dictionarys, supplier: $supplier) {
         status
         message
         dictionarys {
            ...DictionaryObject
         }
      }
   }
   ${DICTIONARY_FRAGMENT}
`;

export const UPDATE_DICTIONARY = gql`
   mutation updateDictionary($dictionary: CatalogInput!) {
      updateDictionary(dictionary: $dictionary) {
         status
         message
         dictionary {
            ...DictionaryObject
         }
      }
   }
   ${DICTIONARY_FRAGMENT}
`;

export const BLOCK_DICTIONARY = gql`
   mutation blockDictionary($id: ID!, $unblock: Boolean, $admin: Boolean) {
      blockDictionary(id: $id, unblock: $unblock, admin: $admin) {
         status
         message
      }
   }
`;
