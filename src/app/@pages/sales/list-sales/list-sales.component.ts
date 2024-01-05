import { Component, OnInit } from '@angular/core';
import { ACTIVE_FILTERS } from '@core/constants/filters';
import { ICatalog } from '@core/interfaces/catalog.interface';
import { IResultData } from '@core/interfaces/result-data.interface';
import { ITableColumns } from '@core/interfaces/table-columns.interface';
import { Catalog } from '@core/models/catalog.models';
import { DELIVERYS_LIST_QUERY } from '@graphql/operations/query/delivery';
import { TablePaginationService } from '@shared/table-pagination/table-pagination.service';
import { DocumentNode } from 'graphql';

@Component({
  selector: 'app-list-sales',
  templateUrl: './list-sales.component.html',
  styleUrls: ['./list-sales.component.scss']
})
export class ListSalesComponent implements OnInit {

  query: DocumentNode = DELIVERYS_LIST_QUERY;
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
  title = 'Ventas Realizadas';
  mostrarImport = false;
  mostrarAgregar = false;
  mostrarActivos = false;
  importados: [ICatalog];
  breadCrumbItems: Array<{}>;

  constructor(
    private tablePaginationService: TablePaginationService
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Ventas', active: true }];
    this.context = {};
    this.itemsPage = -1;
    this.resultData = {
      listKey: 'deliverys',
      definitionKey: 'deliverys',
      title: 'Ventas'
    };
    this.include = false;
    this.filterActiveValues = ACTIVE_FILTERS.ALL;
    this.columns = [
      {
        property: 'id',
        label: 'id',
        class: 'clave'
      },
      {
        property: 'cliente',
        label: 'Cliente',
        class: 'clave'
      },
      {
        property: 'importe',
        label: 'Importe',
        class: 'numero'
      },
      {
        property: 'messageError',
        label: 'Observacion',
        class: 'clave'
      },
      {
        property: 'registerDate',
        label: 'Fecha',
        class: 'fecha'
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
