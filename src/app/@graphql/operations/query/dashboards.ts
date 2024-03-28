import gql from 'graphql-tag';
import { IMPORT_SUPPLIER_FRAGMENT, IMPORT_SUPPLIER_MONTH_FRAGMENT, IMPORT_SUPPLIER_WEEK_FRAGMENT } from '../fragment/dashboard';

export const IMPORT_SUPPLIER = gql`
  query importBySupplier {
    importBySupplier {
      status
      message
      importBySupplier {
        ...ImportBySupplierObject
      }
    }
  }
  ${IMPORT_SUPPLIER_FRAGMENT}
`;

export const IMPORT_SUPPLIER_MONTH = gql`
  query importBySupplierByMonth {
    importBySupplierByMonth {
      status
      message
      importBySupplierByMonth {
        ...ImportBySupplierByMontObject
      }
    }
  }
  ${IMPORT_SUPPLIER_MONTH_FRAGMENT}
`;

export const IMPORT_SUPPLIER_WEEK = gql`
  query importBySupplierByWeek {
    importBySupplierByWeek {
      status
      message
      importBySupplierByWeek {
        ...ImportBySupplierByWeekObject
      }
    }
  }
  ${IMPORT_SUPPLIER_WEEK_FRAGMENT}
`;
