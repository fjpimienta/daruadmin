import { Component, OnInit, Input } from '@angular/core';
import { Delivery } from '@core/models/delivery.models';
import { Product } from '@core/models/product.models';

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
  total = 0.0;

  constructor(private modalService: NgbModal) {
    this.data = new Product();
  }

  ngOnInit() {
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any, data: any) {
    this.modalService.open(content, { size: 'lg', centered: true });
    if (data) {
      this.data = data.data;
    }
  }

  abrirPDFEnOtraPagina(archivo: string): void {
    const nuevaVentana = window.open();
    nuevaVentana.document.write(`<embed src="data:application/pdf;base64,${archivo}" type="application/pdf" width="100%" height="100%">`);
  }

}
