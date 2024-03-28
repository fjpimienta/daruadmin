import { Component, OnInit, ViewChild } from '@angular/core';
import { emailSentBarChart, weeklyEarningChart, monthlyEarningChart } from './data';
import { ChartType } from './dashboard.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventService } from '../../../@core/services/event.service';
import { ConfigService } from '../../../@core/services/xconfig.service';
import { DashboardsService } from '@core/services/dashboard.service';
import { DashMonthImport, DashSupplierImport, DashWeekImport, WeekDates } from '@core/models/dashboard.models';
import { tryCatch } from 'rxjs/internal-compatibility';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {

  isVisible: string;

  emailSentBarChart: ChartType;
  weeklyEarningChart: ChartType;
  monthlyEarningChart: ChartType;
  transactions: Array<[]>;
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

  @ViewChild('content') content;
  constructor(
    private modalService: NgbModal,
    private configService: ConfigService,
    private eventService: EventService,
    private dashboardsService: DashboardsService
  ) {
  }

  async ngOnInit() {
    try {
      const importBySupplier = await this.dashboardsService.getImportBySupplier();
      this.importBySupplier = importBySupplier.importBySupplier;
      this.importBySupplier.forEach(supplier => {
        supplier.supplierId = supplier.supplierId.toUpperCase();
        this.importTotal += supplier.totalAmount;
      });
      const importBySupplierByMonth = await this.dashboardsService.getImportBySupplierByMonth();
      this.importBySupplierByMonth = importBySupplierByMonth.importBySupplierByMonth
      const currentDate = new Date();
      this.lastDayOfMonth = this.getLastDayOfMonth(currentDate);
      this.currentMonth = this.getCurrentMonth(this.importBySupplierByMonth, currentDate);

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
      this.fetchData();
    } catch (error) {
      console.log('error: ', error);
    }
  }

  getLastWeekSales(weeklySales: DashWeekImport[]): { totalSales: number; weekDates: WeekDates } {
    // Encontrar la última semana registrada
    const lastWeek = weeklySales.reduce((maxWeek, currentWeek) => {
      const currentWeekNumber = parseInt(currentWeek.weekOfYear);
      return currentWeekNumber > maxWeek ? currentWeekNumber : maxWeek;
    }, 0);

    // Filtrar ventas correspondientes a la última semana
    const lastWeekSales = weeklySales.filter(week => parseInt(week.weekOfYear) === lastWeek);

    // Calcular total de ventas para la última semana
    const totalSales = lastWeekSales.reduce((total, week) => total + week.totalAmount, 0);

    // Obtener la fecha de inicio y fin de la última semana
    const startDate = new Date(`${lastWeekSales[0].year}-${lastWeekSales[0].monthName}-01`);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // Agregar 6 días para obtener el último día de la semana

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
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
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
    this.emailSentBarChart = emailSentBarChart;
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

    this.isActive = 'year';
    this.configService.getConfig().subscribe(data => {
      this.transactions = data.transactions;
      this.statData = data.statData;
    });
  }

  openModal() {
    // Abre el modal de la subscripción.
    // this.modalService.open(this.content, { centered: true });
  }

  weeklyreport() {
    this.isActive = 'week';
    this.emailSentBarChart.series =
      [{
        name: 'Series A',
        data: [44, 55, 41, 67, 22, 43, 36, 52, 24, 18, 36, 48]
      }, {
        name: 'Series B',
        data: [11, 17, 15, 15, 21, 14, 11, 18, 17, 12, 20, 18]
      }, {
        name: 'Series C',
        data: [13, 23, 20, 8, 13, 27, 18, 22, 10, 16, 24, 22]
      }];
  }

  monthlyreport() {
    this.isActive = 'month';
    this.emailSentBarChart.series =
      [{
        name: 'Series A',
        data: [44, 55, 41, 67, 22, 43, 36, 52, 24, 18, 36, 48]
      }, {
        name: 'Series B',
        data: [13, 23, 20, 8, 13, 27, 18, 22, 10, 16, 24, 22]
      }, {
        name: 'Series C',
        data: [11, 17, 15, 15, 21, 14, 11, 18, 17, 12, 20, 18]
      }];
  }

  yearlyreport() {
    this.isActive = 'year';
    this.emailSentBarChart.series =
      [{
        name: 'Series A',
        data: [13, 23, 20, 8, 13, 27, 18, 22, 10, 16, 24, 22]
      }, {
        name: 'Series B',
        data: [11, 17, 15, 15, 21, 14, 11, 18, 17, 12, 20, 18]
      }, {
        name: 'Series C',
        data: [44, 55, 41, 67, 22, 43, 36, 52, 24, 18, 36, 48]
      }];
  }

  /**
   * Change the layout onclick
   * @param layout Change the layout
   */
  changeLayout(layout: string) {
    this.eventService.broadcast('changeLayout', layout);
  }
}
