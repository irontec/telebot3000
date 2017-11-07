import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import * as call from './../../../app-jssip/utils';

import { CallspollService } from './../../../app-jssip/services/callspoll.service';
import { Call } from './../../../app-jssip/services/ua.service/call';
import { UaService } from './../../../app-jssip/services/ua.service';

@Component({
    selector: 'app-callslist',
    templateUrl: './callslist.component.html',
    styleUrls: ['./callslist.component.scss']
})
export class CallslistComponent implements OnInit, OnDestroy {

    constructor(
        private callsPool: CallspollService,
        private UA: UaService
    ) { }

    ngOnInit() {

    }

    ngOnDestroy() {

    }



}
