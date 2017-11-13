import 'rxjs/add/observable/of';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/scan';

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

import { ConfigurationStoreService } from './app-jssip/services/configuration-store.service';
import { ConfigurationService } from './app-jssip/services/configuration.service';
import { CallspollService } from './app-jssip/services/callspoll.service';
import { UaService } from './app-jssip/services/ua.service';
import { UAMessage, UAregisteredData, UAnewRTCSessionData} from './app-jssip/utils';
import { Call } from './app-jssip/services/ua.service/call';
import { ConnectionStatus } from './core/utils';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {

    public connectionStatus: Observable<ConnectionStatus>;
    private alive = false;

    constructor(
        private configuration: ConfigurationService,
        private configurationStore: ConfigurationStoreService,
        private callsPool: CallspollService,
        public UA: UaService,
        private router: Router
    ) {
    }

    public ngOnInit(): void {
        this.alive = true;

        this.configurationStore.applyConfiguration().subscribe(ret => {
            if (this.configuration.autoconnect) {
                this.UA.connect();
            }
        });

        this.connectionStatus = this._generateConnectionStatusFeed();

        // Manage incoming/outgoing calls
        this.UA.notifier
                .filter(uaMsg => uaMsg.event === 'newRTCSession')
                .map(uaMsg => uaMsg.data)
                .takeWhile(() => this.alive)
                .subscribe((rtcData: UAnewRTCSessionData) => {

                    const call = new Call();
                    call.setSession(rtcData);

                    this.callsPool.addCall(call);

                    this.router.navigate(['callslist']);
                });
    }


    private _generateConnectionStatusFeed(): Observable<ConnectionStatus> {

        return this.UA.notifier

            .filter(
               (message: UAMessage) => ['registered', 'disconnected'].indexOf(message.event) !== -1
            )
            .map((message: UAMessage) => {

                const status: ConnectionStatus = {
                    who: 'not registered',
                    last: new Date()
                };
                if (message.event === 'registered') {
                    const messageData = <UAregisteredData>message.data;
                    status.who = messageData.response['from']['uri']['user'];
                }
                return status;
            })

            .scan((acc, cur) => {
                return { ...acc, ...cur };
            });
    }

    public ngOnDestroy() {
        this.alive = false;
    }
}
