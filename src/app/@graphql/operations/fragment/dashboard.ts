import gql from 'graphql-tag';

export const IMPORT_SUPPLIER_FRAGMENT = gql`
  fragment ImportBySupplierObject on DashSupplierImport {
    supplierId
    totalAmount
  }
`;

export const IMPORT_SUPPLIER_MONTH_FRAGMENT = gql`
  fragment ImportBySupplierByMontObject on DashMonthImport {
    year
    monthName
    totalAmount
    suppliers {
      supplierId
      totalAmount
    }
  }
`;

export const IMPORT_SUPPLIER_WEEK_FRAGMENT = gql`
  fragment ImportBySupplierByWeekObject on DashWeekImport {
    supplierId
    year
    monthName
    weekOfYear
    totalAmount
  }
`;
