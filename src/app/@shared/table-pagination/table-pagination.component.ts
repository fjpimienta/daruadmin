import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DocumentNode } from 'graphql';
import { TablePaginationService } from './table-pagination.service';
import { IInfoPage, IResultData } from 'src/app/@core/interfaces/result-data.interface';
import { ITableColumns } from 'src/app/@core/interfaces/table-columns.interface';
import { ACTIVE_FILTERS } from 'src/app/@core/constants/filters';
import { Observable } from 'rxjs';
import { closeAlert, loadData } from 'src/app/@shared/alert/alerts';
import { map } from 'rxjs/operators';
import { ImportarService } from '@shared/importar/importar.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-table-pagination',
  templateUrl: './table-pagination.component.html',
  styleUrls: ['./table-pagination.component.scss']
})
export class TablePaginationComponent implements OnInit {
  @Input() query: DocumentNode;
  @Input() context: object;
  @Input() itemsPage = 10;
  @Input() include = true;
  @Input() filterName = '';
  // @Input() filterBranch = '0';
  // @Input() filtroProduct = false;
  @Input() onlySearch = false;
  @Input() onlyCupons = false;
  @Input() mostrarBoton = true;
  @Input() mostrarImport = false;
  @Input() mostrarAgregar = true;
  @Input() mostrarActivos = true;
  @Input() resultData: IResultData;
  @Input() tableColumns: Array<ITableColumns> = undefined;
  @Input() filterActiveValues: ACTIVE_FILTERS = ACTIVE_FILTERS.ALL;
  @Input() title: string;
  @Output() manageItem = new EventEmitter<Array<any>>();
  infoPage: IInfoPage;
  data$: Observable<any>;
  loading: boolean;
  shopProducts = false;
  products = false;
  MuestraFiltros = true;
  queryBranch: DocumentNode;
  totalData: number;
  tagFilter: string;
  private tiposPagos: any[] = [];

  constructor(
    private httpClient: HttpClient,
    private service: TablePaginationService,
    private importarService: ImportarService,
  ) {
    service.$emitter.subscribe(() => {
      this.loadData();
    });
    // Obtener los tipos de pagos en el constructor
    this.getTiposPagosCt().then(tiposPagos => {
      this.tiposPagos = tiposPagos;
    });
  }

  // Define requests
  private tiposPagosCt$: Observable<any> = this.httpClient.get('assets/uploads/json/ct_tipos_pago.json');

  ngOnInit(): void {
    if (this.query === undefined) {
      throw new Error('Query indefinida, agregar por favor.');
    }
    if (this.resultData === undefined) {
      throw new Error('ResultData indefinida, agregar por favor.');
    }
    if (this.tableColumns === undefined) {
      throw new Error('Table Columns indefinida, agregar por favor.');
    }
    this.infoPage = {
      page: 1,
      pages: 10,
      itemsPage: this.itemsPage,
      total: 1
    };
    this.tagFilter = 'Todos(Activos/Inactivos)';
    this.loadData();
  }

  loadData() {
    this.loading = true;
    loadData('Cargando informacion...', 'Espera mientras carga la informacion');
    const variables = {
      page: this.infoPage.page,
      itemsPage: this.infoPage.itemsPage,
      include: this.include,
      active: this.filterActiveValues,
      filterName: this.filterName,
      // filterBranch: this.filterBranch
    };

    if (this.query) {
      this.data$ = this.service.getCollectionData(this.query, variables, {}).pipe(
        map((result: any) => {
          const data = result[this.resultData.definitionKey];
          if (!data) {
            this.loading = false;
            closeAlert();
            return result;
          }
          if (data.info) {
            this.infoPage.pages = data.info.pages;
            this.infoPage.total = data.info.total;
            this.totalData = data.info.total;
          }

          // Ordenar la lista por el campo 'id' en orden ascendente cuando es tabla de cupones.
          if (this.onlyCupons) {
            if (data[this.resultData.listKey]) {
              data[this.resultData.listKey] = data[this.resultData.listKey].sort((a, b) => {
                return a.id - b.id;
              });
            }
          }

          this.loading = false;
          closeAlert();
          return data[this.resultData.listKey];
        })
      );
    } else {
      this.loading = false;
      closeAlert();
    }
  }

  changePage() {
    this.loadData();
  }

  manageAction(action: string, data: any) {
    this.manageItem.emit([action, data]);
  }

  formatoMoneda(valor, mostrarSimbolo) {
    if (valor === undefined || valor === 0) {
      return '$0.00';
    }
    let num = '';
    if (mostrarSimbolo === true) {
      num = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor)
    }
    return num;
  }

  asignFilter(filter, tagFilter) {
    this.filterActiveValues = filter;
    this.tagFilter = tagFilter;
    this.loadData();
  }

  asignPage(itemsPage: number) {
    this.infoPage.itemsPage = itemsPage;
    this.loadData();
  }

  getTipoPagoName(tipoPagoId: string): string | undefined {
    const tipoPago = this.tiposPagos.find(tipo => tipo.id === tipoPagoId.toString());
    return tipoPago.tipo_pago ? tipoPago.tipo_pago : 'NA';
  }

  async getTiposPagosCt(): Promise<any> {
    return await this.tiposPagosCt$.toPromise();
  }
}
