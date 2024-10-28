import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaptureDictionaryComponent } from './capture-dictionary.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';


@NgModule({
  declarations: [
    CaptureDictionaryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    BrowserModule,
    NgbDropdownModule,
    ReactiveFormsModule
  ],
  exports: [
    CaptureDictionaryComponent
  ]
})
export class CaptureDictionaryModule { }
