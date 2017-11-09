import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalStorageService } from './services/localstorage.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [LocalStorageService]
})
export class AppStorageModule { }
