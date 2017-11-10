import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppStorageModule } from './../app-storage/app-storage.module';

import { ConfigurationService } from './services/configuration.service';
import { UaService } from './services/ua.service';
import { ConfigurationStoreService } from './services/configuration-store.service';
import { CallspollService } from './services/callspoll.service';



@NgModule({
  imports: [
    CommonModule,
    AppStorageModule
  ],
  exports: [
    AppStorageModule
  ],
  declarations: [],
  providers: [ConfigurationService, UaService, ConfigurationStoreService, CallspollService ]
})
export class AppJssipModule { }
