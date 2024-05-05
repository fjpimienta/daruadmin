import { Component, OnInit, Input } from '@angular/core';
import { Delivery } from '@core/models/delivery.models';
import { Product } from '@core/models/product.models';
import { ExternalAuthService } from '@core/services/external-auth.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {

  @Input() transactions: Array<{
    id?: string;
    cliente?: string,
    importe?: number,
    messageError?: string,
    registerDate?: string,
    status?: string,
    delivery?: Delivery
  }>;
  data: any;
  guias: any;
  productos: Product[];
  totalProd = 0.0;
  totalEnvios = 0;
  discount = 0;
  subtotal = 0.0;
  iva = 0.0;
  total = 0.0;

  constructor(
    private modalService: NgbModal,
    private externalAuthService: ExternalAuthService
  ) {
    this.data = new Product();
  }

  ngOnInit() {
  }

  openModal(content: any, data: any) {
    this.modalService.open(content, { size: 'lg', centered: true });
    if (data) {
      this.data = data.data;
      if (this.data && this.data.ordersCt && this.data.ordersCt.length > 0) {
        this.getStatusOrderCt(this.data.ordersCt[0].orderCtResponse.pedidoWeb).then(result => {
          if (result && result.statusOrdersCt && result.statusOrdersCt.pedido !== '') {
            this.guias = result.statusOrdersCt;
          }
        });
      }
      if (this.data && this.data.ordersCva) {

      }
      this.productos = [];
      this.totalProd = 0.0;
      this.totalEnvios = 0;
      for (const idW of Object.keys(this.data.warehouses)) {
        const warehouse = this.data.warehouses[idW];
        for (const idP of Object.keys(warehouse.productShipments)) {
          const prod = warehouse.productShipments[idP];
          this.totalProd += (prod.precio * prod.cantidad / 1.16);
          this.productos.push(prod);
        }
        for (const idE of Object.keys(warehouse.shipments)) {
          const ship = warehouse.shipments[idE];
          this.totalEnvios += (ship.costo / 1.16);
        }
      }
      this.discount = this.data.discount;
      this.subtotal = this.totalProd + this.totalEnvios - this.discount;
      this.iva = this.subtotal * 0.16;
      this.total = this.subtotal + this.iva;
      this.modalService.open(content, { size: 'lg', centered: true });
    }
  }

  async getStatusOrderCt(folio: string): Promise<any> {
    const confirmarPedidoCt = await this.externalAuthService.statusOrdersCt(folio);
    return confirmarPedidoCt;
  }

  abrirPDFEnOtraPagina(archivo: string): void {
    const nuevaVentana = window.open();
    nuevaVentana.document.write(`<embed src="data:application/pdf;base64,${archivo}" type="application/pdf" width="100%" height="100%">`);
  }

}
