import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IResultData } from '@core/interfaces/result-data.interface';
import { IApis, IParameters, ISupplier } from '@core/interfaces/supplier.interface';
import { IAlmacen, IAlmacenes, IProductoCt, IPromocion } from '@core/interfaces/suppliers/ct.interface';
import { AddCatalog, Catalog, SupplierCat } from '@core/models/catalog.models';
import {
  AddProduct, Brands, Categorys, Picture, Product, UnidadDeMedida, BranchOffices,
  SupplierProd, ProductExport, Descuentos, Promociones, PromocionBranchOffice, Vigente, Especificacion
} from '@core/models/product.models';
import { AvailabilityByWarehouse } from '@core/models/productingram.models';
import { BrandsService } from '@core/services/brand.service';
import { CategoriesService } from '@core/services/categorie.service';
import { ConfigsService } from '@core/services/config.service';
import { ExternalAuthService } from '@core/services/external-auth.service';
import { GroupsService } from '@core/services/group.service';
import { SuppliersService } from '@core/services/supplier.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { closeAlert, infoEventAlert, loadData } from '@shared/alert/alerts';
import { basicAlert } from '@shared/alert/toasts';
import { TYPE_ALERT } from '@shared/alert/values.config';
import slugify from 'slugify';

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
    private configsService: ConfigsService
  ) { }

  // Define requests
  private httpReq2$ = this.httpClient.get('assets/uploads/json/ct_almacenes.json');
  private httpReq3$ = this.httpClient.get('assets/uploads/json/ingram_products.json');

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
        this.supplier.slug === 'ingram' || this.supplier.slug === 'exel') {
        loadData('Importando los productos', 'Esperar la carga de los productos.');
        const productos = await this.getProducts(this.supplier, this.apiSelect, this.catalogValues);
        if (productos) {
          if (productos.length > 0) {
            this.habilitaGuardar = true;
            this.dataExport = [];
            // Setear dataExport
            productos.forEach(item => {
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
          } else {
            basicAlert(TYPE_ALERT.WARNING, 'No se encontraron productos.');
          }
        }
        this.dataSupplier = productos;
        closeAlert();
        return this.dataSupplier;
      } else {
        basicAlert(TYPE_ALERT.WARNING, 'No existen elementos para buscar.');
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
        // Carga de Productos
        const almacenes = await this.externalAuthService.getSucursalesCva();
        if (almacenes.status && almacenes.listSucursalesCva.length > 0) {
          const groupsCva = await this.externalAuthService.getGroupsCva();
          let productosCva: Product[] = [];

          function excludeGroups(groupsToExclude: string[], allGroups: { grupo: string }[]): { grupo: string }[] {
            const filteredGroups = allGroups.filter(groupObj => !groupsToExclude.includes(groupObj.grupo));
            return filteredGroups;
          }

          // Grupos para excluir
          const groupsToExclude = [
            "ACCESO VIDEOCONFERENCIA",
            "AIRE ACONDICIONADO",
            "ALARMAS",
            "ASPIRADORAS",
            "BASCULA",
            "CAFETERA",
            "CALCULADORA",
            "CABLEADO ESTRUCTURADO",
            "CONCENTRADOR DE OXIGENO",
            "CONTADOR DE BILLETES",
            "CONSOLAS",
            "CONTROLES",
            "COPIADORA",
            "CURSO",
            "DIGITALIZADOR",
            "DRONES",
            "EMPAQUES",
            "FREIDORA DE AIRE",
            "FAX",
            "FUNDAS",
            "HANDHELD",
            "HIDROLAVADORAS",
            "INSUMOS",
            "INSUMOS GHIA",
            "INTERFON",
            "JUGUETES",
            "KIOSKO",
            "LICUADORA",
            "LINEA BLANCA",
            "MAQUINA PARA CORTAR CABELLO",
            "MAQUINAS DE COSER",
            "MAQUINAS DE ESCRIBIR",
            "MATERIALES PARA PRODUCCION GHIA",
            "MUEBLES PARA OFICINA",
            "PCS",
            "PASE",
            "PARTES",
            "PIZARRON",
            "PORTA RETRATO DIGITAL",
            "POLIZAS DE GARANTIA",
            "PRODUCTOS DE LIMPIEZA",
            "PROMOCIONALES",
            "RADIO RELOJ",
            "RASURADORA",
            "REFACCIONES",
            "EFACCIONES GHIA / HAIER",
            "REFACCIONES PARA UPS",
            "REFACCIONES GHIA / HAIER",
            "REPRODUCTORES",
            "SERVICIOS CLOUD CVA",
            "SERVICIOS METROCARRIER",
            "SERVICIOS VIDEOCONFERENCIA",
            "SINTONIZADOR",
            "SOLUCION INTERWRITE",
            "SOLUCIONES GSM",
            "VENTILADORES",
            "TRITURADORA DE DOCUMENTOS",
            "VENTILADORES",
            "TERMOMETRO",
            "TIPO DE CONECTIVIDAD",
            "PIZARRON",
            "CAMARAS"
          ];
          // Obtener la lista de grupos excluyendo los especificados
          const filteredGroups = excludeGroups(groupsToExclude, groupsCva.listGroupsCva);
          for (const group of filteredGroups) {
            const productosCvaTmp = await this.externalAuthService.getProductsPricesCva(group.grupo);
            if (productosCvaTmp && productosCvaTmp.listPricesCva !== null && productosCvaTmp.listPricesCva.length > 0) {
              productosCva.push(...productosCvaTmp.listPricesCva);
            }
          }
          this.cvaAlmacenes = almacenes.listSucursalesCva;
          if (productosCva.length > 0) {
            let i = 1;
            for (const product of productosCva) {
              let itemData = new Product();
              product.id = i;
              itemData = await this.setProduct(supplier.slug, product);
              if (itemData.id !== undefined) {
                productos.push(itemData);
              }
              i += 1;
            }
          } else {
            return await [];
          }
        } else {
          return await [];
        }
        return await productos;
      case 'ct':
        this.ctAlmacenes = await this.getAlmacenes();
        const productosCt = await this.externalAuthService.getProductsCt();
        console.log('productosCt: ', productosCt);
        if (productosCt.status) {
          let productsCtFtp: any[] = [];
          const productosCtJson = await this.externalAuthService.getProductsCtJson();
          if (productosCtJson && productosCtJson.status && productosCtJson.jsonProductsCt && productosCtJson.jsonProductsCt.length > 0) {
            productsCtFtp = productsCtFtp.concat(productosCtJson.jsonProductsCt);
          }
          const productosCtXml = await this.externalAuthService.getProductsCtXml();
          if (productosCtXml && productosCtXml.status && productosCtXml.jsonProductsCtHP && productosCtXml.jsonProductsCtHP.length > 0) {
            productsCtFtp = productsCtFtp.concat(productosCtXml.jsonProductsCtHP);
          }
          let i = 1;
          const excludedCategories = [
            'Caretas', 'Cubrebocas', 'Desinfectantes', 'Equipo', 'Termómetros',
            'Acceso', 'Accesorios para seguridad', 'Camaras Deteccion',
            'Control de Acceso', 'Sensores', 'Tarjetas de Acceso', 'Timbres',
            'Administrativo', 'Contabilidad', 'Nóminas', 'Timbres Fiscales',
            'Análogos', 'Video Conferencia', 'Accesorios de Papeleria', 'Articulos de Escritura',
            'Basico de Papeleria', 'Cabezales', 'Cuadernos', 'Papel', 'Papelería', 'Camaras Deteccion',
            'Apple', 'Accesorios para Apple', 'Adaptadores para Apple', 'Audífonos para Apple', 'Cables Lightning', 'iMac', 'iPad', 'MacBook'
          ];
          for (const product of productosCt.stockProductsCt) {
            if (!excludedCategories.includes(product.subcategoria)) {
              productsCtFtp.forEach(async productFtp => {
                if (product.codigo === productFtp.clave) {
                  const productTmp: IProductoCt = this.convertirPromocion(product);
                  const itemData: Product = await this.setProduct(supplier.slug, productTmp, productFtp);
                  if (itemData.id !== undefined) {
                    productos.push(itemData);
                  }
                }
              });
            }
          }
        }
        return await productos;
      case 'ingram':
        console.log('Import Ingram Products')
        const productosIngram = await this.externalAuthService.getProductsIngram();
        const catalogIngrams = await this.externalAuthService.getCatalogIngrams();
        console.log('productosIngram: ', productosIngram);
        console.log('catalogIngrams: ', catalogIngrams);
        for (const prodIngram of productosIngram.pricesIngram) {
          if (prodIngram.availability && prodIngram.availability.availabilityByWarehouse) {
            const warehouses: AvailabilityByWarehouse[] = [];
            for (const almacen of prodIngram.availability.availabilityByWarehouse) {
              if (almacen.quantityBackordered >= this.stockMinimo) {
                const warehouse: AvailabilityByWarehouse = almacen;
                warehouses.push(warehouse);
              }
            }
            if (warehouses.length > 0) {
              if (prodIngram.availability.availabilityByWarehouse.length !== warehouses.length) {
                prodIngram.availability.availabilityByWarehouse = warehouses;
                // Si el producto cumple con los requisitos lo agrega.
                const catalogIngram = catalogIngrams.catalogIngrams.find(cat => {
                  return cat.imSKU.trim() === prodIngram.ingramPartNumber.trim();
                });
                if (catalogIngram) {
                  console.log('prodIngram: ', prodIngram);
                  console.log('catalogIngram: ', catalogIngram);
                  if (prodIngram.availability && prodIngram.availability.availabilityByWarehouse
                    && prodIngram.availability.availabilityByWarehouse.length > 0) {
                    const itemData: Product = await this.setProduct(supplier.slug, prodIngram, catalogIngram);
                    console.log('prodIngram.discounts: ', prodIngram.discounts);
                    if (itemData.id !== undefined) {
                      productos.push(itemData);
                    }
                  }
                  // } else {
                  //   console.log('prodIngram.ingramPartNumber.trim(): ', prodIngram.ingramPartNumber.trim());
                }
              }
            }
          }
        }
        return await productos;
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
    almacen.id = branch.warehouseId;
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
    almacen.cantidad = branch.quantityBackordered;
    // almacen.cantidad = branch.quantityAvailable;
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
    this.cvaAlmacenes.forEach(almacen => {
      let cantidad = 0;
      const branchOffice = new BranchOffices();
      branchOffice.id = almacen.clave;
      branchOffice.name = almacen.nombre;
      branchOffice.estado = almacen.nombre;
      branchOffice.cp = almacen.cp;
      branchOffice.latitud = '';
      branchOffice.longitud = '';
      switch (almacen.clave) {
        case '1':
          cantidad = parseInt(item.VENTAS_GUADALAJARA, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '3':
          cantidad = parseInt(item.VENTAS_MORELIA, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '4':
          cantidad = parseInt(item.VENTAS_LEON, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '5':
          cantidad = parseInt(item.VENTAS_CULIACAN, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '6':
          cantidad = parseInt(item.VENTAS_QUERETARO, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '7':
          cantidad = parseInt(item.VENTAS_TORREON, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '8':
          cantidad = parseInt(item.VENTAS_TEPIC, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '9':
          cantidad = parseInt(item.VENTAS_MONTERREY, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '10':
          cantidad = parseInt(item.VENTAS_PUEBLA, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '11':
          cantidad = parseInt(item.VENTAS_VERACRUZ, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '12':
          cantidad = parseInt(item.disponible, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '13':
          cantidad = parseInt(item.VENTAS_TUXTLA, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '14':
          cantidad = parseInt(item.VENTAS_HERMOSILLO, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '18':
          cantidad = parseInt(item.VENTAS_MERIDA, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '19':
          cantidad = parseInt(item.VENTAS_CANCUN, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '23':
          cantidad = parseInt(item.VENTAS_AGUASCALIENTES, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '24':
          cantidad = parseInt(item.VENTAS_DF_TALLER, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '26':
          cantidad = parseInt(item.VENTAS_SAN_LUIS_POTOSI, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '27':
          cantidad = parseInt(item.VENTAS_CHIHUAHUA, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '28':
          cantidad = parseInt(item.VENTAS_DURANGO, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '29':
          cantidad = parseInt(item.VENTAS_TOLUCA, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '31':
          cantidad = parseInt(item.VENTAS_OAXACA, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '32':
          cantidad = parseInt(item.VENTAS_LAPAZ, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '33':
          cantidad = parseInt(item.VENTAS_TIJUANA, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '35':
          cantidad = parseInt(item.VENTAS_COLIMA, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '36':
          cantidad = parseInt(item.VENTAS_ZACATECAS, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '38':
          cantidad = parseInt(item.VENTAS_CAMPECHE, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '39':
          cantidad = parseInt(item.VENTAS_TAMPICO, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '40':
          cantidad = parseInt(item.VENTAS_PACHUCA, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '43':
          cantidad = parseInt(item.VENTAS_ACAPULCO, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '46':
          cantidad = parseInt(item.disponibleCD, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '47':
          cantidad = parseInt(item.VENTAS_CUERNAVACA, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '51':
          cantidad = parseInt(item.VENTAS_CEDISCDMX, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }
          break;
        case '52':
          cantidad = parseInt(item.VENTAS_ASPHALT, 10);
          if (cantidad >= this.stockMinimo) {
            branchOffice.cantidad = cantidad;
            branchOffices.push(branchOffice);
          }

          break;
      }
    });
    return branchOffices;
  }

  async setProduct(proveedor: string, item: any, productJson: any = null, imagenes: any = null) {
    const itemData = new Product();
    const unidad = new UnidadDeMedida();
    const b = new Brands();
    const c = new Categorys();
    const s = new SupplierProd();
    const bo = new BranchOffices();
    const i = new Picture();
    const is = new Picture();
    const desc = new Descuentos();
    const promo = new Promociones();
    let disponible = 0;
    let salePrice = 0;

    switch (proveedor) {
      case 'ingram':
        try {
          disponible = 0;
          salePrice = 0;
          if (item.availability && item.availability.availabilityByWarehouse && item.availability.availabilityByWarehouse.length > 0) {
            const branchOfficesIngram: BranchOffices[] = [];
            let featured = false;
            for (const element of item.availability.availabilityByWarehouse) {
              // console.log('availabilityByWarehouse.element: ', element);
              const almacen = this.getAlmacenIngram(element);
              if (almacen.cantidad >= this.stockMinimo) {
                console.log('availabilityByWarehouse.almacen.cantidad: ', almacen.cantidad);
                disponible = almacen.cantidad;
                branchOfficesIngram.push(almacen);
              }
            }
            console.log('branchOfficesIngram: ', branchOfficesIngram);
            if (branchOfficesIngram.length > 0) {
              // TO-DO Promociones
              salePrice = 0;
              itemData.id = item.vendorPartNumber.trim();
              itemData.name = productJson.descriptionLine1.trim();
              itemData.slug = slugify(productJson.descriptionLine1.trim(), { lower: true });
              itemData.short_desc = productJson.descriptionLine1.trim() + '. ' + productJson.descriptionLine2.trim();
              if (item.pricing.retailPrice > 0) {
                if (item.moneda === 'USD') {
                  itemData.price = parseFloat((parseFloat(item.pricing.retailPrice) * this.exchangeRate * this.utilidad * this.iva).toFixed(2));
                  itemData.sale_price = parseFloat((salePrice * this.exchangeRate * this.utilidad * this.iva).toFixed(2));
                } else {
                  itemData.price = parseFloat(item.pricing.retailPrice) * this.utilidad * this.iva;
                  itemData.sale_price = salePrice * this.utilidad * this.iva;
                }
              } else {
                itemData.price = salePrice;
              }
              itemData.exchangeRate = this.exchangeRate;
              itemData.review = 0;
              itemData.ratings = 0;
              itemData.until = this.getFechas(new Date());
              itemData.top = false;
              itemData.featured = featured;
              itemData.new = null;
              itemData.sold = null;
              itemData.stock = disponible;
              itemData.sku = item.vendorNumber.trim();
              itemData.upc = item.upc;
              itemData.partnumber = item.vendorPartNumber.trim();
              unidad.id = 'PZ';
              unidad.name = 'Pieza';
              unidad.slug = 'pieza';
              itemData.unidadDeMedida = unidad;
              // Marcas
              itemData.brand = item.vendorName.toLowerCase();
              itemData.brands = [];
              b.name = item.vendorName;
              b.slug = slugify(item.vendorName, { lower: true });
              itemData.brands.push(b);
              // SupplierProd                 TO-DO
              s.idProveedor = proveedor;
              s.codigo = item.vendorPartNumber;
              s.cantidad = this.stockMinimo;
              // TO-DO Promociones
              s.moneda = item.pricing.currencyCode;
              s.branchOffices = branchOfficesIngram;
              itemData.suppliersProd = s;
            }
          }
          console.log('itemData: ', itemData);
          return itemData;
        } catch (error) {
          console.log('error.message: ', error.message);
          console.log('error: ', error);
          console.log('itemData: ', itemData);
          return itemData;
        }
      case 'syscom':
        return itemData;

      case 'cva':
        salePrice = 0;
        let branchOffices: BranchOffices[] = [];
        let disponibilidadAlmacenes = 0;
        if (item.ExsTotal >= this.stockMinimo) {                  // Si existencias totales.
          let featured = false;
          branchOffices = this.setCvaAlmacenes(item);
          if (branchOffices.length > 0) {
            disponibilidadAlmacenes = branchOffices[0].cantidad;
            itemData.id = item.id;
            itemData.name = item.descripcion;
            itemData.slug = slugify(item.descripcion, { lower: true });
            itemData.short_desc = item.clave + '. Grupo: ' + item.grupo;
            itemData.price = parseFloat(item.precio) * this.utilidad * this.iva;
            itemData.review = 0;
            itemData.ratings = 0;
            itemData.until = this.getFechas(new Date());
            itemData.top = false;
            if (item.PrecioDescuento !== 'Sin Descuento') {
              desc.total_descuento = item.TotalDescuento === '' ? 0 : parseFloat(item.TotalDescuento) * this.utilidad * this.iva;
              desc.moneda_descuento = item.MonedaDescuento;
              desc.precio_descuento = item.PrecioDescuento === '' ? 0 : parseFloat(item.PrecioDescuento) * this.utilidad * this.iva;
              salePrice = desc.precio_descuento;
            }
            itemData.descuentos = desc;
            if (item.DisponibleEnPromocion !== 'Sin Descuento') {
              promo.clave_promocion = item.ClavePromocion;
              promo.descripcion_promocion = item.DescripcionPromocion;
              promo.vencimiento_promocion = item.VencimientoPromocion;
              promo.disponible_en_promocion = item.DisponibleEnPromocion === '' ? 0 : parseFloat(item.DisponibleEnPromocion) * this.utilidad * this.iva;
              promo.porciento = 0;
            }
            itemData.sale_price = salePrice;
            featured = (item.PrecioDescuento > 0 && item.PrecioDescuento < item.precio) ? true : false;
            itemData.featured = featured;
            itemData.exchangeRate = item.tipocambio > 0 ? item.tipocambio : this.exchangeRate;
            itemData.promociones = promo;
            itemData.new = false;
            itemData.sold = null;
            disponible = disponibilidadAlmacenes;
            itemData.stock = disponible;
            itemData.sku = item.clave;
            itemData.partnumber = item.codigo_fabricante;
            itemData.upc = item.clave;
            unidad.id = 'PZ';
            unidad.name = 'Pieza';
            unidad.slug = 'pieza';
            itemData.unidadDeMedida = unidad;
            // Categorias
            itemData.category = [];
            if (item.solucion) {
              const c = new Categorys();
              c.name = item.solucion;
              c.slug = slugify(item.solucion, { lower: true });
              itemData.category.push(c);
            } else {
              const c = new Categorys();
              c.name = '';
              c.slug = '';
              itemData.category.push(c);
            }
            // SubCategorias
            itemData.subCategory = [];
            if (item.grupo) {
              const c1 = new Categorys();
              c1.name = item.grupo;
              c1.slug = slugify(item.grupo, { lower: true });
              itemData.subCategory.push(c1);
            } else {
              const c1 = new Categorys();
              c1.name = '';
              c1.slug = '';
              itemData.subCategory.push(c1);
            }
            // Marcas
            itemData.brand = item.marca.toLowerCase();
            itemData.brands = [];
            b.name = item.marca;
            b.slug = slugify(item.marca, { lower: true });
            itemData.brands.push(b);
            // SupplierProd
            s.idProveedor = proveedor;
            s.codigo = item.codigo_fabricante;
            s.price = item.precio;
            s.cantidad = this.stockMinimo;
            s.sale_price = item.PrecioDescuento === '' ? 0 : parseFloat(item.PrecioDescuento);
            s.moneda = item.moneda === 'Pesos' ? 'MXN' : 'USD';
            s.branchOffices = branchOffices;
            s.category = new Categorys();
            s.subCategory = new Categorys();
            if (item.solucion) {
              s.category.slug = slugify(item.solucion, { lower: true });;
              s.category.name = item.solucion;
            }
            if (item.grupo) {
              s.subCategory.slug = slugify(item.grupo, { lower: true });;
              s.subCategory.name = item.grupo;
            }
            itemData.suppliersProd = s;
            // Imagenes
            itemData.pictures = [];
            // const i = new Picture();
            i.width = '600';
            i.height = '600';
            i.url = item.imagen;
            itemData.pictures.push(i);
            // Imagenes pequeñas
            itemData.sm_pictures = [];
            // const is = new Picture();
            is.width = '300';
            is.height = '300';
            is.url = item.imagen;
            itemData.variants = [];
            itemData.sm_pictures.push(is);
            itemData.especificaciones = [];
            if (item.dimensiones) {
              const especD: Especificacion = new Especificacion();
              especD.tipo = 'Dimensiones';
              especD.valor = item.dimensiones;
              itemData.especificaciones.push(especD);
            }
            if (item.peso) {
              const especP: Especificacion = new Especificacion();
              especP.tipo = 'Peso';
              especP.valor = item.peso;
              itemData.especificaciones.push(especP);
            }
          }
        }
        return itemData;

      case 'ct':
        disponible = 0;
        salePrice = 0;
        if (item.almacenes.length > 0) {
          const branchOfficesCt: BranchOffices[] = [];
          let featured = false;
          for (const element of item.almacenes) {
            const almacen = this.getAlmacenCant(element);
            if (almacen.cantidad >= this.stockMinimo) {
              disponible = almacen.cantidad;
              branchOfficesCt.push(almacen);
            }
          }
          // if (disponible >= this.stockMinimo) {                         // Si hay mas de 10 elementos disponibles
          if (branchOfficesCt.length > 0) {                         // Si hay mas de 10 elementos disponibles
            // Si hay promociones en los almacenes ocupa el primero y asigna el total de disponibilidad
            if (item.almacenes[0].promociones[0]) {
              promo.clave_promocion = '';
              promo.descripcion_promocion = 'Producto con Descuento';
              promo.inicio_promocion = item.almacenes[0].promociones[0].vigente.ini;
              promo.vencimiento_promocion = item.almacenes[0].promociones[0].vigente.fin;
              promo.disponible_en_promocion = item.almacenes[0].promociones[0].precio;
              promo.porciento = item.almacenes[0].promociones[0].porciento;
              salePrice = item.almacenes[0].promociones[0].precio;
              featured = salePrice > 0 ? true : false;
              // // Se elimina hasta confirmar que es descuento.
              // if (salePrice === 0 && promo.porciento > 0) {
              //   const desc = parseFloat(item.almacenes[0].promociones[0].porciento) * parseFloat(item.precio) / 100;
              //   salePrice = item.precio - desc;
              // }
              itemData.promociones = promo;
            }
            itemData.id = productJson.clave;
            itemData.name = productJson.nombre;
            itemData.slug = slugify(productJson.nombre, { lower: true });
            itemData.short_desc = productJson.descripcion_corta;
            if (item.moneda === 'USD') {
              itemData.price = parseFloat((parseFloat(item.precio) * this.exchangeRate * this.utilidad * this.iva).toFixed(2));
              itemData.sale_price = parseFloat((salePrice * this.exchangeRate * this.utilidad * this.iva).toFixed(2));
            } else {
              itemData.price = parseFloat((parseFloat(item.precio) * this.utilidad * this.iva).toFixed(2));
              itemData.sale_price = salePrice * this.utilidad * this.iva;
            }
            itemData.exchangeRate = this.exchangeRate;
            itemData.review = 0;
            itemData.ratings = 0;
            itemData.until = this.getFechas(new Date());
            itemData.top = false;
            itemData.featured = featured;
            itemData.new = null;
            itemData.sold = null;
            itemData.stock = disponible;
            itemData.sku = productJson.clave;
            itemData.upc = productJson.upc;
            itemData.ean = productJson.ean;
            itemData.partnumber = productJson.numParte;
            unidad.id = 'PZ';
            unidad.name = 'Pieza';
            unidad.slug = 'pieza';
            itemData.unidadDeMedida = unidad;
            // Categorias
            itemData.category = [];
            if (productJson.categoria) {
              const c = new Categorys();
              c.name = productJson.categoria;
              c.slug = slugify(productJson.categoria, { lower: true });
              itemData.category.push(c);
            } else {
              const c = new Categorys();
              c.name = '';
              c.slug = '';
              itemData.category.push(c);
            }
            //Subcategorias
            itemData.subCategory = [];
            if (productJson.subcategoria) {
              const c1 = new Categorys();
              c1.name = productJson.subcategoria;
              c1.slug = slugify(productJson.subcategoria, { lower: true });
              itemData.subCategory.push(c1);
            } else {
              const c1 = new Categorys();
              c1.name = '';
              c1.slug = '';
              itemData.subCategory.push(c1);
            }
            // Marcas
            itemData.brand = productJson.marca.toLowerCase();
            itemData.brands = [];
            b.name = productJson.marca;
            b.slug = slugify(productJson.marca, { lower: true });
            itemData.brands.push(b);
            // SupplierProd
            s.idProveedor = proveedor;
            s.codigo = productJson.clave;
            s.cantidad = this.stockMinimo;
            if (itemData.promociones && (
              itemData.promociones.disponible_en_promocion > 0 || itemData.promociones.porciento > 0)) {
              const precioPromocion = (parseFloat(item.precio) - (parseFloat(item.precio) * itemData.promociones.porciento / 100)).toFixed(2);
              s.price = parseFloat(item.precio);
              s.sale_price = parseFloat(item.almacenes[0].promociones[0].precio);
            } else {
              s.price = parseFloat(item.precio);
              s.sale_price = 0;
            }
            s.moneda = item.moneda;
            s.branchOffices = branchOfficesCt;
            s.category = new Categorys();
            s.subCategory = new Categorys();
            if (productJson.categoria) {
              s.category.slug = slugify(productJson.categoria, { lower: true });;
              s.category.name = productJson.categoria;
            }
            if (productJson.subcategoria) {
              s.subCategory.slug = slugify(productJson.subcategoria, { lower: true });;
              s.subCategory.name = productJson.subcategoria;
            }
            itemData.suppliersProd = s;
            itemData.model = productJson.modelo;
            // Imagenes
            itemData.pictures = [];
            i.width = '600';
            i.height = '600';
            i.url = productJson.imagen;
            itemData.pictures.push(i);
            // Imagenes pequeñas
            itemData.sm_pictures = [];
            is.width = '300';
            is.height = '300';
            is.url = productJson.imagen;
            itemData.variants = [];
            itemData.sm_pictures.push(is);
            itemData.especificaciones = [];
            if (productJson.especificaciones && productJson.especificaciones.length > 0) {
              for (const e of productJson.especificaciones) {
                const espec: Especificacion = new Especificacion();
                espec.tipo = e.tipo;
                espec.valor = e.valor;
                itemData.especificaciones.push(espec);
              }
            }
            // // Para validar un producto en depuracion.
            // if (productJson.numParte === 'TN630') {
            //   console.log('promo: ', promo)
            //   console.log('productJson: ', productJson)
            //   console.log('item: ', item)
            //   console.log('itemData: ', itemData)
            // }
            return itemData;
          }
        }
        return itemData;

      case 'exel':
        return itemData;

      default:
        break;
    }
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
