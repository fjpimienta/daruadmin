import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IResultData } from '@core/interfaces/result-data.interface';
import { IApis, IParameters, ISupplier } from '@core/interfaces/supplier.interface';
import { IAlmacen, IAlmacenes, IProductoCt, IPromocion } from '@core/interfaces/suppliers/ct.interface';
import { AddCatalog, Catalog, SupplierCat } from '@core/models/catalog.models';
import {
  AddProduct, Brands, Categorys, Picture, Product, UnidadDeMedida, BranchOffices,
  SupplierProd, ProductExport, Descuentos, Promociones, Especificacion
} from '@core/models/product.models';
import { BrandsService } from '@core/services/brand.service';
import { CategoriesService } from '@core/services/categorie.service';
import { ConfigsService } from '@core/services/config.service';
import { ExternalAuthService } from '@core/services/external-auth.service';
import { GroupsService } from '@core/services/group.service';
import { ProductsService } from '@core/services/products.service';
import { SuppliersService } from '@core/services/supplier.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { closeAlert, infoEventAlert, loadData } from '@shared/alert/alerts';
import { basicAlert } from '@shared/alert/toasts';
import { TYPE_ALERT } from '@shared/alert/values.config';
import slugify from 'slugify';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-importar',
  templateUrl: './importar.component.html',
  styleUrls: ['./importar.component.scss']
})
export class ImportarComponent implements OnInit {

  //#region Variables
  data = [];
  dataSupplier = [];
  dataExport = [];
  apiName: string;
  stockMinimo: number;
  title: string;
  titulo: string;
  catalog: string;
  apis: IApis[];
  apisFilter: IApis[];
  apiSelect: IApis;
  apiCatalog: IApis;
  operation: string;
  suboperation: string;
  submitted: boolean;
  onlySearch: boolean;
  token: string;
  valorSearch: Catalog;
  catalogItem: Catalog;
  importForm: FormGroup;
  habilitaEjecutar: boolean;
  habilitaGuardar: boolean;
  supplier: ISupplier;
  suppliers: [ISupplier];
  bodyParameters: IParameters;
  tokenParameters: Array<IParameters>;
  apiParameters: Array<IParameters>;
  catalogValues: Catalog[];
  brands: Catalog[];
  categories: Catalog[];
  groups: Catalog[];
  ctAlmacenes: any[];
  cvaAlmacenes: any[];
  exchangeRate: number;
  offer: number;
  utilidad: number = 1.08;
  iva: number = 1.16;

  @Input() resultData: IResultData;
  @Input() catalogs: [Catalog];
  @Input() products: [Product];
  @Output() importaChange = new EventEmitter<AddCatalog>();
  @Output() importaChangeProduct = new EventEmitter<AddProduct>();
  @Output() datosEnviar: FormData = new FormData();
  @ViewChild('content') content: any;

  //#endregion End Variables

  //#region Constructor
  constructor(
    public modal: NgbModal,
    public suppliersService: SuppliersService,
    private formBuilder: FormBuilder,
    private externalAuthService: ExternalAuthService,
    private brandsService: BrandsService,
    private categoriesService: CategoriesService,
    private groupsService: GroupsService,
    private httpClient: HttpClient,
    private configsService: ConfigsService,
    private productsService: ProductsService
  ) { }

  // Define requests
  private httpReq2$ = this.httpClient.get('assets/uploads/json/ct_almacenes.json');

  // convenience getter for easy access to form fields
  get f() { return this.importForm.controls; }
  //#endregion End Constructor

  //#region Iniciando Formulario
  ngOnInit(): void {
    // console.clear();
    this.onlySearch = false;
    this.valorSearch = new Catalog();
    this.importForm = this.formBuilder.group({
      datos: [[], [Validators.required]]
    });
    this.suppliersService.getSuppliers().subscribe(result => {
      this.suppliers = result.suppliers;
    });
    this.configsService.getConfig('1').subscribe((result) => {
      this.offer = parseInt(result.ofer, 10);
      this.exchangeRate = parseFloat(result.exchange_rate);
      this.stockMinimo = parseInt(result.minimum_offer);
    });
  }

  onOpenModal(catalogs: [Catalog]) {
    this.apiName = '';
    this.data = [];
    this.dataSupplier = [];
    this.dataExport = [];
    this.apis = [];
    this.operation = '';
    this.supplier = null;
    this.apisFilter = [];
    this.brands = [];
    this.catalogValues = [];
    this.submitted = false;
    this.onlySearch = false;
    this.catalogs = catalogs;
    this.habilitaEjecutar = false;
    this.habilitaGuardar = false;
    this.catalog = this.resultData.apiExterna;
    this.importForm.controls.datos.setValue([]);
    this.modal.open(this.content, { size: 'xl' });
    this.title = 'Catálogo Externo de ' + this.resultData.title;
    this.titulo = 'Importar Catálogo de ' + this.resultData.title;
    switch (this.catalog) {
      case 'marcas':
        this.brandsService.getBrands(1, -1).subscribe(result => {
          this.data = result.brands;
          this.data.forEach(item => {
            if (!item.suppliersCat) {
              item.suppliersCat = [];
              const supplierCat = new SupplierCat();
              supplierCat.idProveedor = '';
              supplierCat.name = '';
              supplierCat.slug = '';
              item.suppliersCat.push(supplierCat);
            }
          });
          this.brands = this.data;
        });
        break;
      case 'categorias':
        this.categoriesService.getCategories(1, -1).subscribe(result => {
          this.data = result.categories;
          this.data.forEach(item => {
            if (!item.suppliersCat) {
              item.suppliersCat = [];
              const supplierCat = new SupplierCat();
              supplierCat.idProveedor = '';
              supplierCat.name = '';
              supplierCat.slug = '';
              item.suppliersCat.push(supplierCat);
            }
          });
          this.categories = this.data;
        });
        break;
      case 'grupos':
        this.groupsService.getGroups(1, -1).subscribe(result => {
          this.data = result.groups;
          this.data.forEach(item => {
            if (!item.suppliersCat) {
              item.suppliersCat = [];
              const supplierCat = new SupplierCat();
              supplierCat.idProveedor = '';
              supplierCat.name = '';
              supplierCat.slug = '';
              item.suppliersCat.push(supplierCat);
            }
          });
          this.groups = this.data;
        });
        break;
      default:
        break;
    }
  }

  async getProd(): Promise<any> {
    try {
      const data = await this.httpClient.get('assets/uploads/json/productos.json').toPromise();
      return data;
    } catch (error) {
      console.error('Error al cargar el archivo JSON:', error);
      return [];
    }
  }

  async getAlma(): Promise<any> {
    return await this.httpReq2$.toPromise();
  }

  async getProductsCt() {
    const productsCt = await this.getProd()
      .then(
        async (result) => {
          return await result;
        }
      )
      .catch((error: Error) => {
        infoEventAlert('No es posible importar el catalogo de productos.', error.message, TYPE_ALERT.ERROR);
      });
    return productsCt;
  }

  async getAlmacenes() {
    const almacenesCt = await this.getAlma()
      .then(
        async (result) => {
          return await result;
        }
      )
      .catch((error: Error) => {
        infoEventAlert('No es posible importar el catalogo de almacenes.', error.message, TYPE_ALERT.ERROR);
      });
    return almacenesCt;
  }

  async onOpenModalProduct(products: [Product]) {
    this.apiName = '';
    this.data = [];
    this.brands = [];
    this.dataSupplier = [];
    this.dataExport = [];
    this.supplier = null;
    this.apisFilter = [];
    this.catalogValues = [];
    this.submitted = false;
    this.products = products;
    this.habilitaEjecutar = false;
    this.habilitaGuardar = false;
    this.catalog = this.resultData.apiExterna;
    this.operation = '';
    this.importForm.controls.datos.setValue([]);
    this.modal.open(this.content, { size: 'xl' });
    this.title = 'Catálogo Externo de ' + this.resultData.title;
    this.titulo = 'Importar Catálogo de ' + this.resultData.title;
  }
  //#endregion End Iniciando Formulario

  //#region Metodos Formularios
  onCloseModal() {
    this.modal.dismissAll();
  }

  onCargar() {
    basicAlert(TYPE_ALERT.WARNING, 'Cargando archivo');
  }
  //#endregion Metodos Formularios

  //#region Metodos cargas de catalogos
  onGetBrands(supplier: string = ''): Catalog[] {
    this.brandsService.getBrands(1, -1)
      .subscribe(result => {
        const dataSupplier = [];
        const data = result.brands;
        data.forEach(item => {
          if (!item.suppliersCat) {
            item.suppliersCat = [];
            const supplierCat = new SupplierCat();
            supplierCat.idProveedor = '';
            supplierCat.name = '';
            supplierCat.slug = '';
            item.suppliersCat.push(supplierCat);
          } else {
            if (item.suppliersCat.length > 0) {
              let i = 0;
              item.suppliersCat.forEach(element => {
                i += 1;
                if (element) {
                  if (element.idProveedor === supplier) {
                    element.id = i;
                    dataSupplier.push(element);
                  }
                }
              });
            }
          }
        });
        this.catalogValues = supplier === '' ? data : dataSupplier;
        return supplier === '' ? data : dataSupplier;
      });
    return [];
  }
  //#endregion

  //#region Metodos de Seleccion
  onSelectSupplier() {
    this.apiName = '';
    this.onlySearch = false;
    this.valorSearch = new Catalog();
    if (this.supplier) {
      this.apisFilter = [];
      this.dataSupplier = [];
      this.dataExport = [];
      this.catalogValues = [];
      this.apiCatalog = null;
      this.habilitaGuardar = false;
      this.habilitaEjecutar = false;
      this.importForm.controls.datos.setValue([]);
      this.apiName = 'No existe api para este catálogo';
      this.apis = this.supplier.apis;
      this.supplier.apis.forEach(api => {
        if (api.type === 'catalog' || api.type === 'products') {
          if (this.resultData.apiExterna === api.return) {
            this.apiName = this.supplier.url_base_api;
            this.apisFilter.push(api);
          }
          if (this.supplier.slug === 'ct' && api.return === 'existencia') {
            this.apiName = this.supplier.url_base_api;
            this.apisFilter.push(api);
          }
          if (this.supplier.slug === 'ingram' && api.return === 'existencia') {
            this.apiName = this.supplier.url_base_api;
            this.apisFilter.push(api);
          }
          if (this.supplier.slug === 'syscom' && api.return === 'existencia') {
            this.apiName = this.supplier.url_base_api;
            this.apisFilter.push(api);
          }
        }
      });
      if (this.apisFilter.length > 0) {
        this.habilitaEjecutar = true;
        this.apiSelect = this.apisFilter[0];
        this.apiCatalog = this.apiSelect;
        this.onSelectApi();
      }
      if (this.supplier.slug === 'ct') {                    // Si el proveedor es CT solo hay api de productos.
        this.habilitaEjecutar = true;
        this.apiSelect = this.apisFilter[0];
        this.apiCatalog = this.apiSelect;
      }
    }
  }

  async onSelectApi() {
    this.valorSearch = new Catalog();
    this.onlySearch = false;
    this.habilitaGuardar = false;
    if (this.apiSelect.parameters.length > 0) {
      this.onlySearch = true;
      if (this.apiSelect.parameters.length > 0) {
        if (this.apiSelect.parameters[0].value) {
          this.onlySearch = false;
        }
      }
    }
    this.apiCatalog = this.apiSelect;
    // Llenar el combo del catalogo seleccionado.
    if (this.apiSelect.type === 'products') {
      this.onGetBrands(this.supplier.slug);
    }
  }

  async onEjecutarAPI() {
    if (this.apiSelect.type !== 'products') {
      loadData('Importando el catalogo', 'Esperar la carga del catalogo.');
      const brandsSupplier = await this.getCatalogSupplier(this.supplier.slug, this.apiCatalog);
      if (brandsSupplier) {
        this.dataSupplier = brandsSupplier;
        this.habilitaGuardar = true;
        // Revisar en todos los elementos del proveedor
        this.dataSupplier.forEach(itemSupplier => {
          // Revisar en todos los elementos del catalogo interno
          this.data.forEach(item => {
            // Si el elemento es igual al del proveedor
            let itemName = '';
            let itemSlug = '';
            switch (this.supplier.slug) {
              case 'cva':
                itemName = itemSupplier.description.toUpperCase();
                itemSlug = slugify(itemSupplier.description, { lower: true });
                break;
              case 'syscom':
                if (typeof itemSupplier.id === 'string') {
                  itemName = itemSupplier.id.toUpperCase();
                  itemSlug = slugify(itemSupplier.id, { lower: true });
                }
                break;
              case 'exel':
                itemName = itemSupplier.descripcion.toUpperCase();
                itemSlug = slugify(itemSupplier.descripcion, { lower: true });
                break;
              default:
                break;
            }
            if (item.slug.toUpperCase() === itemName) {
              const supplierCat = new SupplierCat();
              // Inicializar el nombre del proveedor.
              supplierCat.idProveedor = this.supplier.slug;
              supplierCat.name = itemName;
              supplierCat.slug = itemSlug;
              // Si ya existe un proveedor en el elemento.
              if (item.suppliersCat.length > 0) {
                if (item.suppliersCat[0].idProveedor !== '') {
                  item.suppliersCat.forEach(supplier => {
                    // Si el proveedor actual existe en catalogo de datos.
                    if (supplier.idProveedor === this.supplier.slug) {
                      supplier.name = supplierCat.name;
                      supplier.slug = supplierCat.slug;
                    } else {
                      // Si el proveedor no existe, lo agrega.
                      item.suppliersCat = [];
                      item.suppliersCat.push(supplierCat);
                    }
                  });
                } else {
                  // Si el proveedor no existe, lo agrega.
                  item.suppliersCat = [];
                  item.suppliersCat.push(supplierCat);
                }
              }
            }
          });
        });
        closeAlert();
      } else {
        infoEventAlert('No es posible importar el catalogo.', this.supplier.slug, TYPE_ALERT.ERROR);
        closeAlert();
      }
    } else {
      if (this.catalogValues.length > 0 || this.supplier.slug === 'ct' ||
        this.supplier.slug === 'ingram' || this.supplier.slug === 'exel' ||
        this.supplier.slug === 'syscom' || this.supplier.slug === 'daisytek' ||
        this.supplier.slug === 'inttelec') {
        loadData('Importando los productos', 'Esperar la carga de los productos.');
        const productos = await this.getProducts(this.supplier, this.apiSelect, this.catalogValues);
        console.log('productos: ', productos);
        if (productos && !productos.status) {
          basicAlert(TYPE_ALERT.ERROR, productos.message);
        }
        if (productos && productos.productos && productos.productos.length > 0) {
          this.habilitaGuardar = true;
          this.dataExport = [];
          // Setear dataExport
          productos.productos.forEach(item => {
            const newItemExport = new ProductExport();
            newItemExport.name = item.name;
            newItemExport.price = item.price;
            newItemExport.sale_price = item.sale_price;
            newItemExport.partnumber = item.partnumber;
            newItemExport.brand = item.brand;
            newItemExport.exchangeRate = item.exchangeRate;
            newItemExport.stock = item.stock;
            newItemExport.sku = item.sku;
            newItemExport.suppliersProd = item.suppliersProd;
            newItemExport.descuentos = item.descuentos;
            newItemExport.promociones = item.promociones;
            newItemExport.upc = item.upc;
            newItemExport.ean = item.ean;
            this.dataExport.push(newItemExport);
          });
          this.dataSupplier = productos.productos;
          closeAlert();
          return this.dataSupplier;
        } else {
          basicAlert(TYPE_ALERT.WARNING, 'No se encontraron productos.');
          return [];
        }
      } else {
        basicAlert(TYPE_ALERT.WARNING, 'No existen elementos para buscar.');
        return [];
      }
    }
  }

  async onEjecutarImage() {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción ejecutará la carga de imágenes.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ejecutar!',
      cancelButtonText: 'No, cancelar!'
    });

    if (result.isConfirmed) {
      loadData('Cargando imágenes...', 'Espera mientras se guardas las imágenes');
      const resImagenes = await this.productsService.addImagesAll(this.supplier.slug);
      if (resImagenes.status) {
        basicAlert(TYPE_ALERT.SUCCESS, resImagenes.message);
      } else {
        basicAlert(TYPE_ALERT.WARNING, resImagenes.message);
      }
    }
  }

  async onEjecutarJson() {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción ejecutará la carga de jsons.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ejecutar!',
      cancelButtonText: 'No, cancelar!'
    });

    if (result.isConfirmed) {
      loadData('Cargando jsons...', 'Espera mientras se guardas los jsons');
      const resJsons = await this.productsService.addJsosAll(this.supplier.slug);
      if (resJsons.status) {
        basicAlert(TYPE_ALERT.SUCCESS, resJsons.message);
      } else {
        basicAlert(TYPE_ALERT.WARNING, resJsons.message);
      }
    }
  }

  //#endregion

  async getCatalogSupplier(supplier: string, apiSelect: IApis, forCatalog: boolean = false): Promise<Catalog[]> {
    const data: Catalog[] = [];

    switch (supplier) {
      case 'cva':
        try {
          if (apiSelect.operation === 'grupos.xml') {
            const catalogo = await this.externalAuthService.getGroupsCva();
            let i = 1;
            for (const item of catalogo.listGroupsCva) {
              data.push({ id: i.toString(), description: item.grupo, slug: item.grupo });
              i += 1;
            }
            return data;
          } else if (apiSelect.operation === 'soluciones.xml') {
            const catalogo = await this.externalAuthService.getSolucionesCva();
            return catalogo.listSolucionesCva;
          } else if (apiSelect.operation === 'sucursales.xml') {
            const catalogo = await this.externalAuthService.getSucursalesCva();
            return catalogo.listSucursalesCva;
          } else if (apiSelect.operation === 'marcas2.xml') {
            const catalogo = await this.externalAuthService.getBrandsCva();
            const catalogValues: Catalog[] = catalogo.listBrandsCva.map(item => ({
              id: item.clave,
              description: item.descripcion
            }));
            if (forCatalog) {
              this.catalogValues.push(...catalogValues);
            } else {
              data.push(...catalogValues);
            }
            return data;
          }
        } catch (error) {
          throw new Error(error.message);
        }
        break;
      case 'exel':
      case 'syscom':
      default:
        break;
    }

    return data;
  }

  async getProducts(supplier: ISupplier, apiSelect: IApis, catalogValues: Catalog[]): Promise<any> {
    const productos: Product[] = [];
    switch (supplier.slug) {
      case 'cva':
        const productosCva = await this.externalAuthService.getProductsCva();
        if (productosCva && !productosCva.status) {
          return await {
            status: productosCva.status,
            message: productosCva.message,
            productos: []
          }
        }
        const productsCva = productosCva.listProductsCva;
        return await {
          status: true,
          message: 'Productos listos para agregar.',
          productos: productsCva
        }
      case 'ct':
        const productosCt = await this.externalAuthService.getProductsCt();
        if (productosCt && !productosCt.status) {
          return await {
            status: productosCt.status,
            message: productosCt.message,
            productos: []
          }
        }
        const productsCt = productosCt.listProductsCt;
        return await {
          status: true,
          message: 'Productos listos para agregar.',
          productos: productsCt
        }
      case 'ingram':
        const productosIngram = await this.externalAuthService.getProductsIngram();
        if (productosIngram && !productosIngram.status) {
          return await {
            status: productosIngram.status,
            message: productosIngram.message,
            productos: []
          }
        }
        const productsIngram = productosIngram.listProductsBDI;
        return await {
          status: true,
          message: 'Productos listos para agregar.',
          productos: productsIngram
        }
      case 'syscom':
        const productosSyscom = await this.externalAuthService.getProductsSyscom();
        if (productosSyscom && !productosSyscom.status) {
          return await {
            status: productosSyscom.status,
            message: productosSyscom.message,
            productos: []
          }
        }
        const productsSyscom = productosSyscom.listProductsSyscom;
        return await {
          status: true,
          message: 'Productos listos para agregar.',
          productos: productsSyscom
        }
      case 'daisytek':
        const productosDaisytek = await this.externalAuthService.getProductsDaisytek();
        console.log('productosDaisytek: ', productosDaisytek);
        if (productosDaisytek && !productosDaisytek.status) {
          return await {
            status: productosDaisytek.status,
            message: productosDaisytek.message,
            productos: []
          }
        }
        const productsDaisytek = productosDaisytek.listProductsDaisytek;
        return await {
          status: true,
          message: 'Productos listos para agregar.',
          productos: productsDaisytek
        }
      case 'inttelec':
        const productosInttelec = await this.externalAuthService.getProductsInttelec();
        console.log('productosInttelec: ', productosInttelec);
        if (productosInttelec && !productosInttelec.status) {
          return await {
            status: productosInttelec.status,
            message: productosInttelec.message,
            productos: []
          }
        }
        const productsInttelec = productosInttelec.listProductsInttelec;
        return await {
          status: true,
          message: 'Productos listos para agregar.',
          productos: productsInttelec
        }
      default:
        break;
    }
  }

  convertirPromocion(product: IProductoCt): IProductoCt {
    try {
      const data = product;

      const almacenes: IAlmacenes[] = data.almacenes.map((almacenData: any) => {
        const almacenPromocion = almacenData.almacenPromocion[0];

        const promocionString = almacenPromocion ? almacenPromocion.promocionString : null;

        let promocionObj: IPromocion = null;
        if (promocionString) {
          const promocionData = JSON.parse(promocionString).promocion;
          if (promocionData) {
            promocionObj = {
              precio: promocionData.precio || 0,
              porciento: promocionData.porciento || 0,
              vigente: {
                ini: promocionData.vigente ? promocionData.vigente.ini : '',
                fin: promocionData.vigente ? promocionData.vigente.fin : '',
              },
            };
          }
        }

        const almacenObj: IAlmacen = {
          key: almacenPromocion ? almacenPromocion.key : '',
          value: almacenPromocion ? almacenPromocion.value : 0,
        };

        return {
          promociones: promocionObj ? [promocionObj] : [],
          almacen: almacenObj,
        };
      });

      const producto: IProductoCt = {
        precio: data.precio,
        moneda: data.moneda,
        almacenes,
        codigo: data.codigo,
      };

      return producto;
    } catch (error) {
      console.error('Error al convertir el objeto JSON:', error);
      return null;
    }
  }

  getAlmacenIngram(branch): BranchOffices {
    const almacen = new BranchOffices();
    almacen.id = branch.warehouseId.toString();
    almacen.name = branch.location;
    const parts = branch.location.split('-');
    if (parts.length > 1) {
      almacen.estado = branch.Estado;
    } else {
      almacen.estado = branch.Estado;
    }
    almacen.cp = '';
    almacen.latitud = '';
    almacen.longitud = '';
    almacen.cantidad = branch.quantityAvailable;
    return almacen;
  }

  getAlmacenCant(branch): BranchOffices {
    const almacen = new BranchOffices();
    const almacenEstado = this.getCtAlmacenes(branch.almacen.key);
    almacen.id = almacenEstado.id.toString();
    almacen.name = almacenEstado.Sucursal;
    almacen.estado = almacenEstado.Estado;
    almacen.cp = almacenEstado.CP;
    almacen.latitud = almacenEstado.latitud;
    almacen.longitud = almacenEstado.longitud;
    almacen.cantidad = branch.almacen.value;
    return almacen;
  }

  getCtAlmacenes(id: string): any {
    const almacen = this.ctAlmacenes.filter(almacen => almacen.id === id);
    if (almacen.length > 0) {
      const sucursal = almacen.map(element => element);
      return sucursal[0];
    }
    return '';
  }

  getFechas(fecha: Date) {
    let dtS = '';
    let monthS = '';
    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1);
    const dt = fecha.getDate();
    dtS = dt < 10 ? '0' + dt : dt.toString();
    monthS = month < 10 ? '0' + month : month.toString();
    return year + '-' + monthS + '-' + dtS;
  }

  setCvaAlmacenes(item: any): BranchOffices[] {
    const branchOffices: BranchOffices[] = [];
    if (this.cvaAlmacenes.length > 0) {
      this.cvaAlmacenes.forEach(almacen => {
        let cantidad = 0;
        const branchOffice = new BranchOffices();
        branchOffice.id = almacen.clave;
        branchOffice.name = almacen.nombre;
        branchOffice.estado = almacen.nombre;
        branchOffice.cp = almacen.cp;
        branchOffice.latitud = '';
        branchOffice.longitud = '';
        branchOffice.cantidad = cantidad;
        switch (almacen.clave) {
          case '1':
            cantidad = parseInt(item.VENTAS_GUADALAJARA, 10);
            break;
          case '3':
            cantidad = parseInt(item.VENTAS_MORELIA, 10);
            break;
          case '4':
            cantidad = parseInt(item.VENTAS_LEON, 10);
            break;
          case '5':
            cantidad = parseInt(item.VENTAS_CULIACAN, 10);
            break;
          case '6':
            cantidad = parseInt(item.VENTAS_QUERETARO, 10);
            break;
          case '7':
            cantidad = parseInt(item.VENTAS_TORREON, 10);
            break;
          case '8':
            cantidad = parseInt(item.VENTAS_TEPIC, 10);
            break;
          case '9':
            cantidad = parseInt(item.VENTAS_MONTERREY, 10);
            break;
          case '10':
            cantidad = parseInt(item.VENTAS_PUEBLA, 10);
            break;
          case '11':
            cantidad = parseInt(item.VENTAS_VERACRUZ, 10);
            break;
          case '12':
            cantidad = parseInt(item.disponible, 10);
            break;
          case '13':
            cantidad = parseInt(item.VENTAS_TUXTLA, 10);
            break;
          case '14':
            cantidad = parseInt(item.VENTAS_HERMOSILLO, 10);
            break;
          case '18':
            cantidad = parseInt(item.VENTAS_MERIDA, 10);
            break;
          case '19':
            cantidad = parseInt(item.VENTAS_CANCUN, 10);
            break;
          case '23':
            cantidad = parseInt(item.VENTAS_AGUASCALIENTES, 10);
            break;
          case '24':
            cantidad = parseInt(item.VENTAS_DF_TALLER, 10);
            break;
          case '26':
            cantidad = parseInt(item.VENTAS_SAN_LUIS_POTOSI, 10);
            break;
          case '27':
            cantidad = parseInt(item.VENTAS_CHIHUAHUA, 10);
            break;
          case '28':
            cantidad = parseInt(item.VENTAS_DURANGO, 10);
            break;
          case '29':
            cantidad = parseInt(item.VENTAS_TOLUCA, 10);
            break;
          case '31':
            cantidad = parseInt(item.VENTAS_OAXACA, 10);
            break;
          case '32':
            cantidad = parseInt(item.VENTAS_LAPAZ, 10);
            break;
          case '33':
            cantidad = parseInt(item.VENTAS_TIJUANA, 10);
            break;
          case '35':
            cantidad = parseInt(item.VENTAS_COLIMA, 10);
            break;
          case '36':
            cantidad = parseInt(item.VENTAS_ZACATECAS, 10);
            break;
          case '38':
            cantidad = parseInt(item.VENTAS_CAMPECHE, 10);
            break;
          case '39':
            cantidad = parseInt(item.VENTAS_TAMPICO, 10);
            break;
          case '40':
            cantidad = parseInt(item.VENTAS_PACHUCA, 10);
            break;
          case '43':
            cantidad = parseInt(item.VENTAS_ACAPULCO, 10);
            break;
          case '46':
            cantidad = parseInt(item.disponibleCD, 10);
            break;
          case '47':
            cantidad = parseInt(item.VENTAS_CUERNAVACA, 10);
            break;
          case '51':
            cantidad = parseInt(item.VENTAS_CEDISCDMX, 10);
            break;
          case '52':
            cantidad = parseInt(item.VENTAS_ASPHALT, 10);

            break;
        }
        if (cantidad >= this.stockMinimo) {
          branchOffice.cantidad = cantidad;
          branchOffices.push(branchOffice);
        }
      });
    }
    return branchOffices;
  }

  onSubmit() {
    const i = 0;
    if (this.catalog === 'productos') {
      const addProduct = new AddProduct();
      addProduct.tipo = 'list';
      addProduct.item = null;
      addProduct.list = this.dataSupplier;
      this.importaChangeProduct.emit(addProduct);
    } else {
      const addCatalog = new AddCatalog();
      addCatalog.tipo = 'list';
      addCatalog.item = null;
      addCatalog.list = this.data; // this.catalogs;
      this.catalogs.shift();
      this.importaChange.emit(addCatalog);
    }
  }

}
