import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



import {
    MatToolbarModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatIconModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatMenuModule,
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
        MatDialogModule,
        MatIconModule,
        MatMenuModule,
        MatTabsModule,
        MatButtonModule,
        MatExpansionModule,
        MatSlideToggleModule
    ],
    exports: [
        MatToolbarModule,
        MatGridListModule,
        MatFormFieldModule,
        MatDialogModule,
        MatInputModule,
        MatIconModule,
        MatMenuModule,
        MatTabsModule,
        MatButtonModule,
        MatExpansionModule,
        MatSlideToggleModule
    ]
})
export class AppMaterialModule { }
