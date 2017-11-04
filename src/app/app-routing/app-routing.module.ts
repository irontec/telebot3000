import { Conditional } from '@angular/compiler';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PhoneComponent } from '../core/components/phone/phone.component';
import { CallslistComponent } from '../core/components/callslist/callslist.component';
import { ConfigComponent } from '../core/components/config/config.component';

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
    path: 'config',
    component: ConfigComponent
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { useHash: true }) ],
  exports: [RouterModule],
  providers: [ ]
})
export class AppRoutingModule {}

