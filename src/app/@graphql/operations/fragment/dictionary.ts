import gql from 'graphql-tag';

export const DICTIONARY_FRAGMENT = gql`
  fragment DictionaryObject on Brand {
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
