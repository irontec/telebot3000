import { Component, OnInit, OnDestroy } from '@angular/core';

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
        public callsPool: CallspollService,
        public UA: UaService,
    ) { }

    ngOnInit() {

    }

    ngOnDestroy() {

    }

}
