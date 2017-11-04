import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationService } from './services/configuration.service';
import { UaService } from './services/ua.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [ConfigurationService, UaService]
})
export class AppJssipModule { }
