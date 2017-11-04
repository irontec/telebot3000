import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



import {
    MatToolbarModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule, MatMenuModule,
    MatTabsModule,
    MatButtonModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    imports: [
        BrowserAnimationsModule,
        CommonModule,
        MatToolbarModule,
        MatGridListModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatMenuModule,
        MatTabsModule,
        MatButtonModule
    ],
    exports: [
        MatToolbarModule,
        MatGridListModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatMenuModule,
        MatTabsModule,
        MatButtonModule
    ]
})
export class AppMaterialModule { }
