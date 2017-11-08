import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { CallspollService } from './../../../app-jssip/services/callspoll.service';
import { UaService } from './../../../app-jssip/services/ua.service';
import { CallComponent } from './../call/call.component';

@Component({
    selector: 'app-callslist',
    templateUrl: './callslist.component.html',
    styleUrls: ['./callslist.component.scss']
})
export class CallslistComponent implements OnInit, OnDestroy {

    constructor(
        private callsPool: CallspollService,
        private UA: UaService,
        public dialog: MatDialog
    ) { }

    ngOnInit() {

    }

    ngOnDestroy() {

    }

    openCall(call): void {

        const dialogRef = this.dialog.open(CallComponent, {
            width: '95%',
            data: { call }
        });

    }

}
