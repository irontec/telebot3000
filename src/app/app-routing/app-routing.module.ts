import { Conditional } from '@angular/compiler';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PhoneComponent } from '../core/components/phone/phone.component';
import { CallslistComponent } from '../core/components/callslist/callslist.component';
import { ConfigComponent } from '../core/components/config/config.component';
import { CallComponent } from '../core/components/call/call.component';

export const routes: Routes = [
  {
    path: '', redirectTo: 'phone', pathMatch: 'full'
  },
  {
    path: 'phone',
    component: PhoneComponent
  },
  {
    path: 'callslist',
    component: CallslistComponent
  },
  {
    path: 'call/:id',
    component: CallComponent
  },
  {
    path: 'config',
    component: ConfigComponent
  }
];


@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
  providers: [ ]
})
export class AppRoutingModule {}

