import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ACTIVE_FILTERS } from '@core/constants/filters';
import { IInfoPage, IResultData } from '@core/interfaces/result-data.interface';
import { ITableColumns } from '@core/interfaces/table-columns.interface';
import { Product, ProductExportInterno } from '@core/models/product.models';
import { ProductsService } from '@core/services/products.service';
import { PRODUCTS_LIST_QUERY } from '@graphql/operations/query/product';
import { loadData, optionsWithDetails } from '@shared/alert/alerts';
import { basicAlert } from '@shared/alert/toasts';
import { TYPE_ALERT } from '@shared/alert/values.config';
import { CaptureProdComponent } from '@shared/capture-prod/capture-prod.component';
import { ImportarComponent } from '@shared/importar/importar.component';
import { TablePaginationService } from '@shared/table-pagination/table-pagination.service';
import { DocumentNode } from 'graphql';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  query: DocumentNode = PRODUCTS_LIST_QUERY;
  context: object;
  itemsPage: number;
  resultData: IResultData;
  include: boolean;
  columns: Array<ITableColumns>;
  filterActiveValues: ACTIVE_FILTERS;
  mostrarBoton: boolean;
  product: Product;
  editMode = false;
  nextId: string;
  title = 'Catálogo de Productos';
  mostrarImport = true;
  mostrarExport = true;
  importados: [Product];
  dataExports = [];
  infoPage: IInfoPage;

  @ViewChild('mdCaptureProd') modal: CaptureProdComponent;
  @ViewChild('mdImportProd') modalImport: ImportarComponent;
  @Input() datosEnviar: FormData = new FormData();

  constructor(
    private productsService: ProductsService,
    private tablePaginationService: TablePaginationService
  ) {
    // Obtiene el siguiente Id del Catálogo
    this.productsService.next().subscribe(result => {
      this.nextId = result;
    }, error => {
      basicAlert(TYPE_ALERT.ERROR, error.message);
    });
  }

  ngOnInit(): void {
    this.context = {};
    this.itemsPage = 10;
    this.resultData = {
      listKey: 'products',
      definitionKey: 'products',
      title: 'Productos',
      apiExterna: 'productos'
    };
    this.include = false;
    this.filterActiveValues = ACTIVE_FILTERS.ALL;
    this.columns = [
      {
        property: 'id',
        label: '#',
        class: 'id'
      },
      {
        property: 'suppliersProd.idProveedor',
        label: 'Proveedor',
        class: 'clave'
      },
      {
        property: 'brand',
        label: 'Marca',
        class: 'clave'
      },
      {
        property: 'sku',
        label: 'SKU',
        class: 'clave'
      },
      {
        property: 'name',
        label: 'Producto',
        class: 'descriptionShort'
      },
      {
        property: 'featured',
        label: 'Promo',
        class: 'id'
      },
      {
        property: 'top',
        label: 'Top',
        class: 'id'
      },
      {
        property: 'price',
        label: 'Precio',
        class: 'numero'
      }
    ];
  }

  async takeAction($event) {
    // Obtiene la informacion para las acciones
    const action = $event[0];
    const product = $event[1];
    this.mostrarBoton = true;
    switch (action) {
      case 'add':                                       // Agregar elemento
        this.addForm(this.onNewProduct());
        break;
      case 'edit':                                      // Modificar elemento
        if (product.price <= 0 || product.price === undefined) {
          product.price = 0;
        }
        if (product.sale_price <= 0 || product.sale_price === undefined) {
          product.sale_price = 0;
        }
        console.log('product: ', product);
        this.updateForm(product);
        break;
      case 'info':                                      // Mostrar información del elemento
        this.mostrarBoton = false;
        console.log('product: ', product);
        this.updateForm(product, true, true);
        break;
      case 'import':
        this.importForm([product]);
        break;
      case 'export':
        this.exportForm();
        break;
      case 'block':                                     // Bloquear elemento
        this.unblockForm(product, false);
        break;
      case 'unblock':                                     // Bloquear elemento
        this.unblockForm(product, true);
        break;
      default:
        break;
    }
  }

  onNewProduct() {
    let product: Product;
    return product = {
      id: parseInt(this.nextId, 10),
      name: '',
      slug: '',
      short_desc: '',
      price: 0,
      sale_price: 0,
      exchangeRate: 0,
      review: 0,
      ratings: 0,
      until: '',
      stock: 0,
      top: false,
      featured: false,
      new: false,
      author: '',
      sold: '',
      partnumber: '',
      sku: '',
      upc: '',
      ean: '',
      category: [],
      subCategory: [],
      brand: '',
      brands: [],
      model: '',
      peso: 0,
      pictures: [],
      sm_pictures: [],
      variants: [],
      active: true,
      suppliersProd: null,
      descuentos: null,
      promociones: null,
      especificaciones: []
    };
  }

  private async addForm(product: Product, editMode: boolean = false) {
    this.editMode = editMode;
    this.modal.onOpenModal(product, editMode);
  }

  private async updateForm(product: Product, editMode: boolean = true, onlyView: boolean = false) {
    this.editMode = editMode;
    this.modal.onOpenModal(product, editMode, onlyView);
  }

  private async importForm(product: [Product]) {
    this.modalImport.onOpenModalProduct(product);
  }

  private async exportForm() {
    this.infoPage = {
      page: 1,
      pages: 10,
      itemsPage: this.itemsPage,
      total: 1
    };
    const variables = {
      page: this.infoPage.page,
      itemsPage: this.infoPage.itemsPage,
      include: this.include,
      active: this.filterActiveValues,
      filterName: '',
      role: ''
    };
    const productos = await this.productsService.getProducts(1, 10000);
    this.dataExports = [];
    productos.products.forEach(item => {
      const newItemExport = new ProductExportInterno();
      newItemExport.ID = item.id;
      newItemExport.CON_DESCUENTO = item.featured;
      newItemExport.NOMBRE_DEL_PRODUCTO = item.name;
      newItemExport.PRECIO_VENTA = item.price;
      newItemExport.PRECIO_VENTA_DESCUENTO = item.sale_price;
      newItemExport.PRECIO_COMPRA = item.suppliersProd.price;
      newItemExport.PRECIO_COMPRA_DESCUENTO = item.suppliersProd.sale_price;
      newItemExport.MARCA = item.brand;
      newItemExport.TIPO_DE_CAMBIO = item.exchangeRate;
      newItemExport.EXISTENCIA = item.stock;
      newItemExport.SKU = item.sku;
      newItemExport.PROVEEDOR = item.suppliersProd.idProveedor;
      this.dataExports.push(newItemExport);
    });
    this.exportToCSV();
  }

  exportToCSV() {
    const csv = Papa.unparse(this.dataExports);
    // Crear un objeto Blob para el archivo CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    // Crear un enlace para descargar el archivo CSV
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = 'productos.csv';
    // Agregar el enlace al DOM y simular un clic
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  }

  productBack(event) {
    if (event.tipo === 'item') {
      if (this.editMode) {                        // Si es un  para editar
        console.log('product/event.item: ', event.item);
        this.updateProduct(event.item);
      } else {                                    // Si es un producto nuevo
        this.addProduct(event.item, event.files);
      }
    } else {

    }
  }

  private addProduct(product: Product, files: File[]) {
    this.productsService.add(product).subscribe(
      (res: any) => {
        if (res.status) {
          // console.log('addProduct/files: ', files);
          const formData = new FormData();
          files.forEach(file => {
            formData.append('files', file, file.name);
            // console.log('file: ', file);
          });
          // console.log('addProduct/formData: ', formData);
          const result = this.productsService.addImages(formData);
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

  importaBackProduct(event) {
    if (event.tipo === 'list') {
      loadData('Guardando el catalogo de Productos', 'Espera la finalización del proceso.');
      this.importados = event.list;
      this.addListProduct(this.importados);
    }
  }

  private addListProduct(products: [Product]) {
    this.productsService.addList(products).subscribe(
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

  private updateProduct(product: Product) {
    if (product.name !== '') {
      this.productsService.update(product).subscribe(
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
    this.productsService.unblock(id, unblock, admin).subscribe(
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
