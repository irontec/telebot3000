import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CallspollService } from './../../../app-jssip/services/callspoll.service';
import { Call } from './../../../app-jssip/services/ua.service/call';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';

@Component({
    selector: 'app-call',
    templateUrl: './call.component.html',
    styleUrls: ['./call.component.scss']
})
export class CallComponent implements OnInit {

    public call: Observable<Call>;
    public str:string;

    constructor(
        private callsPool: CallspollService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.call = this.route.params
            .switchMap(params => {
                console.log(params);
                if (!params['id']) {
                    return empty();
                }
                this.str = params['id'];
                const call = this.callsPool.getCallById(params['id']);

                console.log(call);
                if (!call) {
                    return empty();
                }
                return Observable.of(call);
            });

    }

}
