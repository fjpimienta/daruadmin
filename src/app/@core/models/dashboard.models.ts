export class DashSupplierImport {
  supplierId: string;
  totalAmount: number;
}

export class DashMonthImport {
  year: number;
  monthName: string;
  totalAmount: number;
  suppliers: SupplierDash[];
}

export class DashWeekImport {
  supplierId: string;
  year: string;
  monthName: string;
  weekOfYear: string;
  totalAmount: number;
}

export class WeekDates {
  startDate: Date;
  endDate: Date;
}

export class SupplierDash {
  supplierId: string;
  totalAmount: number;
}
