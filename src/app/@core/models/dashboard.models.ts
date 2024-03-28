export class DashSupplierImport {
  supplierId: string;
  totalAmount: number;
}

export class DashMonthImport {
  // supplierId: string;
  // year: string;
  monthName: string;
  totalAmount: number;
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
