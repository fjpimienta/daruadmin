import gql from 'graphql-tag';

export const CATEGORYGROUP_FRAGMENT = gql`
  fragment CategoryGroupObject on CategoryGroup {
    _id {
      name
      slug
    }
    total
  }
`;

export const CATEGORIE_FRAGMENT = gql`
  fragment CategorieObject on Categorie {
    id
    description
    slug
    order
    active
    suppliersCat {
      idProveedor
      name
      slug
    }
  }
`;
