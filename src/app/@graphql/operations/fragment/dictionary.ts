import gql from 'graphql-tag';

export const DICTIONARY_FRAGMENT = gql`
  fragment DictionaryObject on Dictionary {
    id
    orderHeader
    headerName
    headerDisplay
    orderAttribute
    attributeName
    attributeDisplay
    active
    registerDate
  }
`;
