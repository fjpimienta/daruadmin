import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ACTIVE_FILTERS } from 'src/app/@core/constants/filters';
import { IResultData } from 'src/app/@core/interfaces/result-data.interface';
import { ITableColumns } from 'src/app/@core/interfaces/table-columns.interface';
import { UsersService } from 'src/app/@core/services/user.service';
import { DocumentNode } from 'graphql';
import { USERS_LIST_QUERY } from 'src/app/@graphql/operations/query/users';
import { TablePaginationService } from 'src/app/@shared/table-pagination/table-pagination.service';
import { CaptureUserComponent } from './capture-user/capture-user.component';
import { basicAlert } from '@shared/alert/toasts';
import { TYPE_ALERT } from '@shared/alert/values.config';
import { optionsWithDetails } from '@shared/alert/alerts';
import { IUser } from '@core/interfaces/user.interface';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  query: DocumentNode = USERS_LIST_QUERY;
  context: object;
  itemsPage: number;
  resultData: IResultData;
  include: boolean;
  columns: Array<ITableColumns>;
  filterActiveValues: ACTIVE_FILTERS;
  mostrarBoton: boolean;
  user: IUser;
  editMode = false;
  nextId: string;
  title: string = 'Catálogo de Usuarios';
  role: string = 'ADMIN';

  @ViewChild('mdCaptureCat') modal: CaptureUserComponent;
  @Input() datosEnviar: FormData = new FormData();

  constructor(
    private usersService: UsersService,
    private tablePaginationService: TablePaginationService
  ) { }

  ngOnInit(): void {
    this.context = {};
    this.itemsPage = 10;
    this.resultData = {
      listKey: 'users',
      definitionKey: 'users',
      title: 'Usuarios'
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
        property: 'name',
        label: 'Nombre',
        class: ''
      },
      {
        property: 'lastname',
        label: 'Apellido',
        class: ''
      },
      {
        property: 'email',
        label: 'Correo',
        class: ''
      },
      {
        property: 'role',
        label: 'Permisos',
        class: ''
      },
      {
        property: 'active',
        label: 'Activo?',
        class: 'clave'
      }
    ];
  }

  async takeAction($event) {
    // Obtiene la informacion para las acciones
    const action = $event[0];
    const user = $event[1];
    this.mostrarBoton = true;
    switch (action) {
      case 'add':                                       // Agregar elemento
        this.addForm(this.onNewCatalog());
        break;
      case 'edit':                                      // Modificar elemento
        this.updateForm(user);
        break;
      case 'info':                                      // Mostrar información del elemento
        this.mostrarBoton = false;
        this.updateForm(user, true, true);
        break;
      case 'block':                                     // Bloquear elemento
        this.unblockForm(user, false);
        break;
      case 'unblock':                                     // Bloquear elemento
        this.unblockForm(user, true);
        break;
      default:
        break;
    }
  }

  onNewCatalog() {
    let user: IUser;
    return user = {
      id: this.nextId,
      email: '',
      password: '',
      name: '',
      lastname: '',
      active: false
    };
  }

  private async addForm(user: IUser, editMode: boolean = false) {
    this.editMode = editMode;
    this.modal.onOpenModal(user, editMode);
  }

  private async updateForm(user: IUser, editMode: boolean = true, onlyView: boolean = false) {
    this.editMode = editMode;
    this.modal.onOpenModal(user, editMode, onlyView);
  }

  userBack(event) {
    this.user = event;
    if (this.editMode) {                        // Si es un  para editar
      this.updateCatalog(this.user);
    } else {                                    // Si es un usero nuevo
      this.addCatalog(this.user);
    }
  }

  private addCatalog(user: IUser) {
    this.usersService.register(user).subscribe(
      (res: any) => {
        if (res.status) {
          basicAlert(TYPE_ALERT.SUCCESS, res.message);
          this.usersService.sendEmailActive(res.user.id, user.email, true).subscribe(
            resEmail => {
              (resEmail.status) ?
                basicAlert(TYPE_ALERT.SUCCESS, resEmail.message) :
                basicAlert(TYPE_ALERT.WARNING, resEmail.message);
            }
          );
          setTimeout(() => {
            this.tablePaginationService.refreshTable();
            this.modal.onCloseModal();
          }, 2900);
        } else {
          basicAlert(TYPE_ALERT.WARNING, res.message);
        }
      }
    );
  }

  private updateCatalog(user: IUser) {
    if (user.email !== '') {
      this.usersService.update(user).subscribe(
        (res: any) => {
          if (res.status) {
            basicAlert(TYPE_ALERT.SUCCESS, res.message);
            setTimeout(() => {
              this.modal.onCloseModal();
              this.tablePaginationService.refreshTable();
            }, 2900);
          } else {
            basicAlert(TYPE_ALERT.WARNING, res.message);
          }
        }
      );
    }
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
    this.usersService.unblock(id, unblock, admin).subscribe(
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
