import { Component, Input, OnInit } from '@angular/core';
import { UaService } from './../../../app-jssip/services/ua.service';
import { Call } from './../../../app-jssip/services/ua.service/call';


@Component({
    selector: 'app-call-brief',
    templateUrl: './call-brief.component.html',
    styleUrls: ['./call-brief.component.scss']
})
export class CallBriefComponent implements OnInit {
    @Input() call: Call;
    constructor(
        private UA: UaService,
    ) { }

    ngOnInit() {
    }

}
