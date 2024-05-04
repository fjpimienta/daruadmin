import { Component, OnInit } from '@angular/core';
import { ACTIVE_FILTERS } from '@core/constants/filters';
import { ICatalog } from '@core/interfaces/catalog.interface';
import { IResultData } from '@core/interfaces/result-data.interface';
import { ITableColumns } from '@core/interfaces/table-columns.interface';
import { Catalog } from '@core/models/catalog.models';
import { ORDERSSYSCOM_LIST_QUERY } from '@graphql/operations/query/suppliers/syscom';
import { TablePaginationService } from '@shared/table-pagination/table-pagination.service';
import { DocumentNode } from 'graphql';

@Component({
  selector: 'app-list-orders-syscom',
  templateUrl: './list-orders-syscom.component.html',
  styleUrls: ['./list-orders-syscom.component.scss']
})
export class ListOrdersSyscomComponent implements OnInit {

  query: DocumentNode = ORDERSSYSCOM_LIST_QUERY;
  context: object;
  itemsPage: number;
  resultData: IResultData;
  include: boolean;
  columns: Array<ITableColumns>;
  filterActiveValues: ACTIVE_FILTERS;
  mostrarBoton: boolean;
  catalog: Catalog;
  editMode = false;
  nextId: string;
  title = 'Ordenes solicitadas a CVA';
  mostrarImport = false;
  mostrarAgregar = false;
  mostrarActivos = false;
  importados: [ICatalog];

  constructor(
    private tablePaginationService: TablePaginationService
  ) { }

  ngOnInit(): void {
    this.context = {};
    this.itemsPage = -1;
    this.resultData = {
      listKey: 'facturasSyscom',
      definitionKey: 'facturasSyscom',
      title: 'Facturas Syscom',
      apiExterna: 'facturas'
    };
    this.include = false;
    this.filterActiveValues = ACTIVE_FILTERS.ALL;
    this.columns = [
      {
        property: 'folio_pedido',
        label: 'Folio Pedido',
        class: 'clave'
      },
      {
        property: 'folio_factura',
        label: 'Folio Factura',
        class: 'clave'
      },
      {
        property: 'fecha',
        label: 'Fecha',
        class: 'clave'
      },
      {
        property: 'estatus_fiscal',
        label: 'Estatus Fiscal',
        class: 'clave'
      },
      {
        property: 'estatus',
        label: 'Estatus',
        class: 'clave'
      },
      {
        property: 'total',
        label: 'Total',
        class: 'numero'
      }
    ]
  }

  async takeAction($event) {
    // Obtiene la informacion para las acciones
    const action = $event[0];
    const product = $event[1];
    this.mostrarBoton = false;
    switch (action) {
      case 'add':                                       // Agregar elemento
        console.log('unblock');
        break;
      case 'edit':                                      // Modificar elemento
        console.log('unblock');
        break;
      case 'info':                                      // Mostrar información del elemento
        console.log('unblock');
        break;
      case 'import':
        console.log('unblock');
        break;
      case 'block':                                     // Bloquear elemento
        console.log('unblock');
        break;
      case 'unblock':                                     // Bloquear elemento
        console.log('unblock');
        break;
      default:
        break;
    }
  }

}

