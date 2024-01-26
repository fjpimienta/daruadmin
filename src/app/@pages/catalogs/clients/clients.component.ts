import { Component, Input, OnInit } from '@angular/core';
import { ACTIVE_FILTERS } from '@core/constants/filters';
import { IResultData } from '@core/interfaces/result-data.interface';
import { ITableColumns } from '@core/interfaces/table-columns.interface';
import { IUser } from '@core/interfaces/user.interface';
import { UsersService } from '@core/services/user.service';
import { USERS_LIST_QUERY } from '@graphql/operations/query/users';
import { optionsWithDetails } from '@shared/alert/alerts';
import { basicAlert } from '@shared/alert/toasts';
import { TYPE_ALERT } from '@shared/alert/values.config';
import { TablePaginationService } from '@shared/table-pagination/table-pagination.service';
import { DocumentNode } from 'graphql';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
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
  title: string = 'Catálogo de Clientes';
  role: string = 'CLIENT';

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
    this.role = 'CLIENT';
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
      case 'info':                                      // Mostrar información del elemento
        this.mostrarBoton = false;
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
