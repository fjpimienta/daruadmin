import { Component, OnInit, ViewChild } from '@angular/core';
import { supplierBarChart, weeklyEarningChart, monthlyEarningChart } from './data';
import { ChartType } from './dashboard.model';
import { EventService } from '../../../@core/services/event.service';
import { DashboardsService } from '@core/services/dashboard.service';
import { DashMonthImport, DashSupplierImport, DashWeekImport, WeekDates } from '@core/models/dashboard.models';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {

  isVisible: string;

  supplierBarChart: ChartType;
  weeklyEarningChart: ChartType;
  monthlyEarningChart: ChartType;
  transactions: any[] = []
  statData: Array<[]>;

  isActive: string;
  CtToken: string;
  SyscomToken: string;

  importBySupplier: DashSupplierImport[] = [];
  importBySupplierByMonth: DashMonthImport[] = [];
  importBySupplierByWeek: DashWeekImport[] = [];
  currentMonth: DashMonthImport;
  currentWeek: DashWeekImport;
  currentWeekDates: WeekDates;
  importTotal: number = 0;
  importTotalWeek: number = 0;
  lastDayOfMonth: number = 0;
  year: number = 0;
  month: string = '';
  supplierId: string = '';
  uniqueSuppliers: string[] = [];

  @ViewChild('content') content;
  constructor(
    private eventService: EventService,
    private dashboardsService: DashboardsService
  ) {
  }

  async ngOnInit() {
    try {
      this.isActive = '';
      const importBySupplier = await this.dashboardsService.getImportBySupplier();
      this.importBySupplier = importBySupplier.importBySupplier;
      this.importBySupplier.forEach(supplier => {
        supplier.supplierId = supplier.supplierId.toUpperCase();
        this.importTotal += supplier.totalAmount;
      });
      this.year = new Date().getFullYear();
      const importBySupplierByMonth = await this.dashboardsService.getImportBySupplierByMonth(
        this.year, this.month, this.supplierId
      );
      this.importBySupplierByMonth = importBySupplierByMonth.importBySupplierByMonth
      const currentDate = new Date();
      this.lastDayOfMonth = this.getLastDayOfMonth(currentDate);
      this.currentMonth = this.getCurrentMonth(this.importBySupplierByMonth, currentDate);
      this.uniqueSuppliers = this.getUniqueSuppliers(this.importBySupplierByMonth);

      const importBySupplierByWeek = await this.dashboardsService.getImportBySupplierByWeek();
      this.currentWeek = importBySupplierByWeek;
      const { totalSales, weekDates } = this.getLastWeekSales(importBySupplierByWeek.importBySupplierByWeek);
      this.importTotalWeek = totalSales;
      this.currentWeekDates = weekDates;

      const attribute = document.body.getAttribute('data-layout');
      this.isVisible = attribute;
      const vertical = document.getElementById('layout-vertical');
      if (vertical != null) {
        vertical.setAttribute('checked', 'true');
      }
      if (attribute === 'horizontal') {
        const horizontal = document.getElementById('layout-horizontal');
        if (horizontal != null) {
          horizontal.setAttribute('checked', 'true');
          console.log(horizontal);
        }
      }
      const deliverys = await this.dashboardsService.getDeliverys();
      if (deliverys && deliverys.deliverys && deliverys.deliverys.length > 0) {
        for (const delivery of deliverys.deliverys) {
          const transaction = {
            id: delivery.id,
            cliente: delivery.cliente,
            importe: delivery.importe,
            messageError: delivery.messageError,
            registerDate: delivery.registerDate,
            status: delivery.status,
            data: delivery
          };
          this.transactions.push(transaction);
        }
      }
      this.fetchData();
    } catch (error) {
      console.log('error: ', error);
    }
  }

  // Primero, definimos una función para obtener una lista única de proveedores
  getUniqueSuppliers(data: any[]): string[] {
    let uniqueSuppliers: string[] = [];
    data.forEach(monthData => {
      monthData.suppliers.forEach(supplier => {
        if (!uniqueSuppliers.includes(supplier.supplierId)) {
          uniqueSuppliers.push(supplier.supplierId);
        }
      });
    });
    return uniqueSuppliers;
  }

  getLastWeekSales(weeklySales: DashWeekImport[]): { totalSales: number; weekDates: WeekDates } {
    const lastWeek = weeklySales.reduce((maxWeek, currentWeek) => {
      const currentWeekNumber = parseInt(currentWeek.weekOfYear);
      return currentWeekNumber > maxWeek ? currentWeekNumber : maxWeek;
    }, 0);
    const lastWeekSales = weeklySales.filter(week => parseInt(week.weekOfYear) === lastWeek);
    const totalSales = lastWeekSales.reduce((total, week) => total + week.totalAmount, 0);
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthIndex = monthNames.indexOf(lastWeekSales[0].monthName) + 1;
    const year = parseInt(lastWeekSales[0].year);
    const startDate = new Date(year, monthIndex - 1, 1);
    const endDate = new Date(year, monthIndex, 0);
    return {
      totalSales: totalSales,
      weekDates: {
        startDate: startDate,
        endDate: endDate
      }
    };
  }

  formatarFecha(date: Date): string {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
  }

  getLastDayOfMonth(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return new Date(year, month, 0).getDate();
  }

  getCurrentMonth(monthlyData: DashMonthImport[], currentDate: Date): DashMonthImport | null {
    const currentMonthString = currentDate.toLocaleString('default', { month: 'long' });
    const currentMonthData = monthlyData.find(monthData => monthData.monthName.toUpperCase() === currentMonthString.toUpperCase());
    if (currentMonthData) {
      return currentMonthData;
    } else {
      return null;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.openModal();
    }, 2000);
  }

  obtenerRangoDeFechas(start: Date, end: Date): string {
    const diaInicio = start.getDate();
    const diaFin = end.getDate();
    const mes = start.toLocaleString('default', { month: 'long' });
    return `Del ${diaInicio} al ${diaFin} de ${mes}`;
  }

  /**
   * Fetches the data
   */
  private fetchData() {
    this.supplierBarChart = supplierBarChart;
    if (this.currentMonth && this.currentMonth.totalAmount > 0 && this.importTotal > 0) {
      const totalMonthP = (this.currentMonth.totalAmount / this.importTotal) * 100;
      const totalMonthPF = Math.round(totalMonthP * 100) / 100;
      this.monthlyEarningChart = monthlyEarningChart;
      this.monthlyEarningChart.series = [totalMonthPF];
      const labelMonth = '1 al ' + this.lastDayOfMonth + ' de ' + this.currentMonth.monthName;
      this.monthlyEarningChart.labels = [labelMonth];
    }

    if (this.currentWeek && this.importTotal > 0 && this.importTotalWeek > 0) {
      const totalWeekP = (this.importTotalWeek / this.importTotal) * 100;
      const totalWeekPF = Math.round(totalWeekP * 100) / 100;
      this.weeklyEarningChart = weeklyEarningChart;
      this.weeklyEarningChart.series = [totalWeekPF];
      const rangoFechas = this.obtenerRangoDeFechas(this.currentWeekDates.startDate, this.currentWeekDates.endDate);
      const labelMonth = rangoFechas;
      this.weeklyEarningChart.labels = [labelMonth];
    }
    this.supplierReport('');
  }

  openModal() {
    // Abre el modal de la subscripción.
    // this.modalService.open(this.content, { centered: true });
  }

  supplierReport(supplierId: string = '') {
    this.isActive = supplierId;
    let data: number[] = [];
    let categories: string[] = [];
    const filterBySupplier = supplierId !== '';
    this.importBySupplierByMonth.forEach(monthData => {
      let totalAmountMonth = 0;
      monthData.suppliers.forEach(supplier => {
        if (!filterBySupplier || supplier.supplierId === supplierId) {
          totalAmountMonth += supplier.totalAmount;
        }
      });
      data.push(totalAmountMonth);
      categories.push(monthData.monthName);
    });

    const monthNamesInOrder = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    categories.sort((a, b) => {
      return monthNamesInOrder.indexOf(a) - monthNamesInOrder.indexOf(b);
    });

    this.supplierBarChart.series = [{
      name: 'Ventas del Mes',
      data: data
    }];
    this.supplierBarChart.xaxis = {
      categories: categories,
    };
    this.supplierBarChart.yaxis = {
      labels: {
        formatter: function (value) {
          const valorData = parseFloat(value.toFixed(2));
          return valorData.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
        }
      }
    };
    this.supplierBarChart.dataLabels = {
      formatter: function (value) {
        const valorData = parseFloat(value.toFixed(2));
        return valorData.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
      }
    };
  }

  /**
   * Change the layout onclick
   * @param layout Change the layout
   */
  changeLayout(layout: string) {
    this.eventService.broadcast('changeLayout', layout);
  }
}
