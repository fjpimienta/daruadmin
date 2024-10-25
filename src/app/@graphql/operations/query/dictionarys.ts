import gql from 'graphql-tag';
import { DICTIONARY_FRAGMENT } from '../fragment/dictionary';
import { RESULT_INFO_FRAGMENT } from '../fragment/result-info';

export const DICTIONARYS_LIST_QUERY = gql`
  query dictionaryList($page: Int, $itemsPage: Int, $active: ActiveFilterEnum, $filterName: String) {
    dictionarys(page: $page, itemsPage: $itemsPage, active: $active, filterName: $filterName) {
      info {
        ...ResultInfoObject
      }
      status
      message
      dictionarys {
        ...DictionaryObject
      }
    }
  }
  ${DICTIONARY_FRAGMENT}
  ${RESULT_INFO_FRAGMENT}
`;

export const DICTIONARY_DATA_QUERY = gql`
   query dictionaryData($include: Boolean!) {
      dictionary{
         status
         message
         dictionary {
            ...DictionaryObject
         }
      }
   }
   ${DICTIONARY_FRAGMENT}
`;

export const DICTIONARY_ID_QUERY = gql`
query {
   dictionaryId{
      status
      message
      dictionaryId
   }
}
`;
