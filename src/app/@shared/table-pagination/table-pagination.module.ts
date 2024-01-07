import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablePaginationComponent } from './table-pagination.component';
import { NgbDropdownModule, NgbNavModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { UIModule } from '@shared/ui/ui.module';

@NgModule({
  declarations: [
    TablePaginationComponent
  ],
  imports: [
    CommonModule,
    NgbDropdownModule,
    NgbPaginationModule,
    FormsModule,
    UIModule,
    NgbNavModule
  ],
  exports: [
    TablePaginationComponent
  ]
})
export class TablePaginationModule { }
