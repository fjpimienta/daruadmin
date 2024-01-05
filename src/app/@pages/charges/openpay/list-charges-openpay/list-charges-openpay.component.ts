import { Component, OnInit } from '@angular/core';
import { ACTIVE_FILTERS } from '@core/constants/filters';
import { ICatalog } from '@core/interfaces/catalog.interface';
import { IResultData } from '@core/interfaces/result-data.interface';
import { ITableColumns } from '@core/interfaces/table-columns.interface';
import { Catalog } from '@core/models/catalog.models';
import { CHARGESOPENAY_LIST_QUERY } from '@graphql/operations/query/charges/openpay';
import { TablePaginationService } from '@shared/table-pagination/table-pagination.service';
import { DocumentNode } from 'graphql';

@Component({
  selector: 'app-list-charges-openpay',
  templateUrl: './list-charges-openpay.component.html',
  styleUrls: ['./list-charges-openpay.component.scss']
})
export class ListChargesOpenpayComponent implements OnInit {

  query: DocumentNode = CHARGESOPENAY_LIST_QUERY;
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
  title = 'Cobros realizados en Openpay';
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
      listKey: 'listChargesOpenpay',
      definitionKey: 'listChargesOpenpay',
      title: 'Cargos en Openpay',
      apiExterna: ''
    };
    this.include = false;
    this.filterActiveValues = ACTIVE_FILTERS.ALL;
    this.columns = [
      {
        property: 'id',
        label: 'ID',
        class: 'clave'
      },
      {
        property: 'method',
        label: 'Metodo',
        class: 'clave'
      },
      {
        property: 'description',
        label: 'Descripcion',
        class: 'description'
      },
      {
        property: 'amount',
        label: 'Importe',
        class: 'number'
      },
      {
        property: 'creation_date',
        label: 'Fecha',
        class: 'fecha'
      },
      {
        property: 'status',
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
