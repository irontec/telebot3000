import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';


import { AppComponent } from './app.component';

import { AppMaterialModule } from './app-material/app-material.module';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { AppJssipModule } from './app-jssip/app-jssip.module';

import { PhoneComponent } from './core/components/phone/phone.component';
import { CallslistComponent } from './core/components/callslist/callslist.component';
import { ConfigComponent } from './core/components/config/config.component';

@NgModule({
  declarations: [
    AppComponent,
    PhoneComponent,
    CallslistComponent,
    ConfigComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppMaterialModule,
    AppRoutingModule,
    AppJssipModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
