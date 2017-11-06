import { register } from 'ts-node/dist';
import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/scan';
import 'rxjs/add/observable/of';

import { ConfigurationService } from './app-jssip/services/configuration.service';
import { ConfigurationStoreService } from './app-jssip/services/configuration-store.service';
import { UaService } from './app-jssip/services/ua.service';

import { UAMessage, UAEvent, UAregisteredData } from './app-jssip/utils';
import { ConnectionStatus } from './core/utils';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

    @ViewChild('audioItem') audioElement;
    public connectionStatus: Observable<ConnectionStatus>;

    constructor(
        private configuration: ConfigurationService,
        private configurationStore: ConfigurationStoreService,
        private UA: UaService
    ) {
    }

    public ngOnInit(): void {

        this.configurationStore.applyConfiguration().subscribe(ret => {
            if (this.configuration.autoconnect) {
                this.UA.connect();
            }
        });

        this.UA.registerAudioNode(this.audioElement.nativeElement);
        this.connectionStatus = this._generateConnectionStatusFeed();
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
}
