import { Call } from '../../core/utils';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/publish';
import 'rxjs/add/operator/publishReplay';

import { Injectable, NgZone } from '@angular/core';
import { UA } from 'jssip';
import { ConfigurationService } from './configuration.service';
import {
    UAEvent,
    UAStatus,
    UAMessage,
    UAMessageData,
    UAconnectingData,
    UAconnectedData,
    UAdisconnectedData,
    UAregisteredData,
    UAunregisteredData,
    UAregistrationFailedData,
    UAregistrationExpiringData,
    UAnewMessageData,
    UAnewRTCSessionData
} from '../utils';
import { Session } from './ua.service/session';
import { CallOptions } from './ua.service/call-options';

@Injectable()
export class UaService {

    public notifier: Subject<UAMessage>;
    public status: BehaviorSubject<UAStatus>;

    private ua: UA;

    private cacheOptions = [];

    constructor(
        private config: ConfigurationService,
        private ngZone: NgZone
    ) {
        this.notifier = new Subject<UAMessage>();
        this.status = new BehaviorSubject<UAStatus>(this._generateStatus('disconnected'));


    }

    connect() {
        this.ua = new UA(this.config.getConfiguration());
        this.ngZone.runOutsideAngular(() => {
            this.ua.start();
        });
        this._wireMessageSubject();
        this._wireStatusSubject();
    }

    disconnect() {
        this.ua.unregister({ all: true });
        this.ua.stop();
    }


    async call(target) {
        const callOptions = new CallOptions(this.config);
        const opts = await callOptions.get();

        // FIFO cache; we will need these opts later
        this.cacheOptions.push(callOptions);

        const session = this.ua.call(target, opts);

    }


    private _wireMessageSubject(): void {

        [
            'connected',
            'disconnected',
            'registered',
            'unregistered',
            'registrationFailed',
            'registrationExpiring',
            'newRTCSession',
            'newMessage'
        ].map(event => {
            this.ua.on(event, e =>
                this.ngZone.run(() =>
                    this.notifier.next(this._parseEvent(<UAEvent>event, e))
                )
            );
        });

    }

    private _wireStatusSubject(): void {
        [
            'connected',
            'disconnected',
            'registered',
            'unregistered'
        ].map(event => {
            this.ua.on(event, e =>
                this.ngZone.run(() => this.status.next(this._generateStatus(<UAEvent>event)))
            );
        });
    }

    private _generateStatus(status: UAEvent): UAStatus {
        return {
            connected: (status === 'connected' || status === 'registered'),
            status
        };
    }


    private _parseEvent(name: UAEvent, event: any): UAMessage {
        let payload: UAMessageData;

        switch (name) {
            case 'connecting': {
                payload = this._hydratePayload<UAconnectingData>(event, ['socket', 'attemps']);
                break;
            }
            case 'connected': {
                payload = this._hydratePayload<UAconnectedData>(event, ['socket']);
                break;
            }
            case 'disconnected': {
                payload = this._hydratePayload<UAdisconnectedData>(event, ['socket', 'error', 'code', 'reason']);
                break;
            }
            case 'registered': {
                payload = this._hydratePayload<UAregisteredData>(event, ['response']);
                break;
            }
            case 'unregistered': {
                payload = this._hydratePayload<UAunregisteredData>(event, ['response', 'cause']);
                break;
            }
            case 'registrationFailed': {
                payload = this._hydratePayload<UAregistrationFailedData>(event, ['response', 'cause']);
                break;
            }
            case 'registrationExpiring': {
                payload = this._hydratePayload<UAregistrationExpiringData>(event, ['msg']);
                break;
            }
            case 'newRTCSession': {
                payload = this._hydratePayload<UAnewRTCSessionData>(event, ['originator', 'request']);
                let callOptions;
                if (payload['originator'] === 'local') {
                    callOptions = this.cacheOptions.shift();
                } else {
                    callOptions = new CallOptions(this.config);
                }

                payload['session'] = new Session(event['session'], callOptions);
                payload['session'].resolveCallOptions();

                break;
            }
            case 'newMessage': {
                payload = this._hydratePayload<UAnewMessageData>(event, ['originator', 'session', 'request']);
                break;
            }
            default: {
                throw new Error('unsuported event');
            }
        }

        return <UAMessage>{
            event: name,
            data: payload
        };

    }

    private _hydratePayload<T>(event, fields): T {
        return <T>fields.reduce((ret, field) => {
            if (!event) {
                return ret;
            }
            ret[field] = event[field] || null;
            return ret;
        }, {});
    }

}
