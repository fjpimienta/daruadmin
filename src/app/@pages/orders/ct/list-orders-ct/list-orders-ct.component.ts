import { Component, OnInit } from '@angular/core';
import { ACTIVE_FILTERS } from '@core/constants/filters';
import { ICatalog } from '@core/interfaces/catalog.interface';
import { IResultData } from '@core/interfaces/result-data.interface';
import { ITableColumns } from '@core/interfaces/table-columns.interface';
import { Catalog } from '@core/models/catalog.models';
import { ORDERSCT_LIST_QUERY } from '@graphql/operations/query/suppliers/ct';
import { TablePaginationService } from '@shared/table-pagination/table-pagination.service';
import { DocumentNode } from 'graphql';

@Component({
  selector: 'app-list-orders-ct',
  templateUrl: './list-orders-ct.component.html',
  styleUrls: ['./list-orders-ct.component.scss']
})
export class ListOrdersCtComponent implements OnInit {

  query: DocumentNode = ORDERSCT_LIST_QUERY;
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
  title = 'Ordenes solicitadas a CT';
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
      listKey: 'listOrdersCt',
      definitionKey: 'listOrdersCt',
      title: 'Ordenes CT',
      apiExterna: 'ordersct'
    };
    this.include = false;
    this.filterActiveValues = ACTIVE_FILTERS.ALL;
    this.columns = [
      {
        property: 'idPedido',
        label: 'Pedido DARU',
        class: 'clave'
      },
      {
        property: 'tipoPago',
        label: 'Tipo de Pago',
        class: 'clave'
      },
      {
        property: 'respuestaCT.pedidoWeb',
        label: 'Pedido CT',
        class: 'clave'
      },
      {
        property: 'respuestaCT.fecha',
        label: 'Fecha',
        class: 'fecha'
      },
      {
        property: 'respuestaCT.estatus',
        label: 'Estatus',
        class: 'clave'
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
