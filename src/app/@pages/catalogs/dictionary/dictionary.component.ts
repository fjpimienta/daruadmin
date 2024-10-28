import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ACTIVE_FILTERS } from '@core/constants/filters';
import { IDictionary } from '@core/interfaces/dictionary.interface';
import { IResultData } from '@core/interfaces/result-data.interface';
import { ITableColumns } from '@core/interfaces/table-columns.interface';
import { Dictionary } from '@core/models/dictionary.models';
import { DictionarysService } from '@core/services/dictionary.service';
import { DICTIONARYS_LIST_QUERY } from '@graphql/operations/query/dictionarys';
import { optionsWithDetails } from '@shared/alert/alerts';
import { basicAlert } from '@shared/alert/toasts';
import { TYPE_ALERT } from '@shared/alert/values.config';
import { TablePaginationService } from '@shared/table-pagination/table-pagination.service';
import { DocumentNode } from 'graphql';
import { CaptureDictionaryComponent } from './capture-dictionary/capture-dictionary.component';

@Component({
  selector: 'app-dictionary',
  templateUrl: './dictionary.component.html',
  styleUrls: ['./dictionary.component.scss']
})
export class DictionaryComponent implements OnInit {
  query: DocumentNode = DICTIONARYS_LIST_QUERY;
  context: object;
  itemsPage: number;
  resultData: IResultData;
  include: boolean;
  columns: Array<ITableColumns>;
  filterActiveValues: ACTIVE_FILTERS;
  mostrarBoton: boolean;
  mostrarActivos: boolean = false;
  dictionary: IDictionary;
  editMode = false;
  nextId: string;
  title = 'Diccionario de Datos';

  @ViewChild('mdCaptureCat') modal: CaptureDictionaryComponent;
  @Input() datosEnviar: FormData = new FormData();

  constructor(
    private dictionaryServic: DictionarysService,
    private tablePaginationService: TablePaginationService
  ) { }

  ngOnInit(): void {
    this.context = {};
    this.itemsPage = 10;
    this.resultData = {
      listKey: 'dictionarys',
      definitionKey: 'dictionarys',
      title: 'Diccionario de Datos'
    };
    this.include = false;
    this.filterActiveValues = ACTIVE_FILTERS.ALL;
    this.columns = [
      {
        property: 'id',
        label: '#',
        class: 'clave'
      },
      {
        property: 'orderHeader',
        label: 'Orden',
        class: 'clave'
      },
      {
        property: 'headerDisplay',
        label: 'Agrupacion',
        class: 'descriptionShort'
      },
      {
        property: 'orderAttribute',
        label: 'Orden',
        class: 'clave'
      },
      {
        property: 'attributeDisplay',
        label: 'Atributo',
        class: 'descriptionShort'
      },
      {
        property: 'active',
        label: 'Activo?',
        class: 'clave'
      }
    ];
    this.NextId();
  }

  NextId() {
    // Obtiene el siguiente Id del Catálogo
    this.dictionaryServic.next().subscribe(result => {
      this.nextId = result;
    });
  }

  async takeAction($event) {
    const action = $event[0];
    const dictionary = $event[1];
    this.mostrarBoton = true;
    switch (action) {
      case 'add':                                       // Agregar elemento
        this.addForm(this.onNewCatalog());
        break;
      case 'edit':                                      // Modificar elemento
        this.updateForm(dictionary);
        break;
      case 'info':                                      // Mostrar información del elemento
        this.mostrarBoton = false;
        this.updateForm(dictionary, true, true);
        break;
      case 'block':                                     // Bloquear elemento
        this.unblockForm(dictionary, false);
        break;
      case 'unblock':                                     // Bloquear elemento
        this.unblockForm(dictionary, true);
        break;
      default:
        break;
    }
  }

  onNewCatalog() {
    this.NextId();
    let dictionary: IDictionary;
    return dictionary = {
      id: this.nextId,
      orderHeader: '1000',
      orderAttribute: '1',
      headerName: '',
      headerDisplay: '',
      attributeName: '',
      attributeDisplay: '',
      active: true
    };
  }


  private async addForm(dictionary: IDictionary, editMode: boolean = false) {
    this.editMode = editMode;
    setTimeout(() => {
      this.modal.onOpenModal(dictionary, editMode);
    }, 2000);
  }

  private async updateForm(dictionary: IDictionary, editMode: boolean = true, onlyView: boolean = false) {
    this.editMode = editMode;
    this.modal.onOpenModal(dictionary, editMode, onlyView);
  }

  dictionaryBack(event) {
    this.dictionary = event;
    if (this.editMode) {                        // Si es un  para editar
      this.updateCatalog(this.dictionary);
    } else {                                    // Si es un usero nuevo
      this.addCatalog(this.dictionary);
    }
  }

  private addCatalog(dictionary: IDictionary) {
    console.log('addCatalog/dictionary: ', dictionary);
  }

  private updateCatalog(dictionary: IDictionary) {
    console.log('updateCatalog/dictionary: ', dictionary);
  }

  private async unblockForm(brand: any, unblock: boolean) {
    const result = (unblock) ?
      await optionsWithDetails(
        'Desbloquear?',
        `Si desbloqueas el item seleccionado, se mostrara en la lista`,
        450,
        'No desbloquear',
        'Si desbloquear'
      )
      :
      await optionsWithDetails(
        'Bloquear?',
        `Si bloqueas el item seleccionado, no se mostrara en la lista`,
        430,
        'No bloquear',
        'Si bloquear'
      );
    if (result === false) {             // Si el resultado es falso, queremos bloquear
      this.unblockBrand(brand.id, unblock, true);
    }
    this.tablePaginationService.refreshTable();
  }

  private unblockBrand(id: string, unblock: boolean = false, admin: boolean = false) {
    this.dictionaryServic.unblock(id, unblock, admin).subscribe(
      (res: any) => {
        if (res.status) {
          basicAlert(TYPE_ALERT.SUCCESS, res.message);
        } else {
          basicAlert(TYPE_ALERT.WARNING, res.message);
        }
      }
    );
  }
}
