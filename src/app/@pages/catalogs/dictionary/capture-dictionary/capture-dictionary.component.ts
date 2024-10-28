import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IDictionary } from '@core/interfaces/dictionary.interface';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-capture-dictionary',
  templateUrl: './capture-dictionary.component.html',
  styleUrls: ['./capture-dictionary.component.scss']
})
export class CaptureDictionaryComponent implements OnInit {

  titulo = 'Capturando diccionario de datos';
  @ViewChild('content') content: any;
  @Input() role = 'ADMIN';
  @Output() datosEnviar: FormData = new FormData();
  @Output() dictionaryChange = new EventEmitter<IDictionary>();
  @Input() dictionary: IDictionary = {
    id: '',
    orderHeader: '',
    headerName: '',
    headerDisplay: '',
    orderAttribute: '',
    attributeName: '',
    attributeDisplay: '',
    active: false
  };
  submitted = false;
  editMode = false;
  onlyView = false;
  estatus: string;

  constructor(
    public modal: NgbModal
  ) { }

  ngOnInit(): void {
  }

  onSetCatalog(dictionary: IDictionary) {

  }

  onSubmit() {
    this.submitted = true;
    this.onSetCatalog(this.dictionary);
    this.dictionaryChange.emit(this.dictionary);
  }

  onOpenModal(dictionary: IDictionary, editMode: boolean = false, onlyView: boolean = false) {
    this.dictionary = dictionary;
    this.editMode = editMode;
    this.onlyView = onlyView;
    this.titulo = this.editMode ? onlyView ? 'Consultar' : 'Modificar' : 'Agregar';
    const valorEditar = this.editMode ? this.dictionary.active ? 'Activo' : 'Inactivo' : 'Activo';
    this.modal.open(this.content, { size: 'lg' });
  }

  onCloseModal() {
    this.modal.dismissAll();
  }

}
