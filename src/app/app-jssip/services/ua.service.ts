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

@Injectable()
export class UaService {

    public notifier: Subject<UAMessage>;
    public status: BehaviorSubject<UAStatus>;

    private ua: UA;

    private audioElement: HTMLAudioElement;

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

    registerAudioNode(node: HTMLAudioElement) {
        this.audioElement = node;
    }

    call(target) {
        const st = this.GenerateStream();
        this.ngZone.run(() => {
            this.ua.call(target, {
                'mediaStream': st,
                'mediaConstraints': { 'audio': true, 'video': false },
                'pcConfig': { 'iceServers': [ {'urls': ['stun:stun.l.google.com:19302']} ], 'gatheringTimeout': 2000 },

                rtcOfferConstraints: {
                    offerToReceiveAudio: 1,
                    offerToReceiveVideo: 0
                }
            });
        });
    }

    GenerateStream() {
        const audioCtx = <any>new AudioContext();
        const target = audioCtx.createMediaStreamDestination();



        const el = <HTMLAudioElement>document.getElementById('lew');
        const source = audioCtx.createMediaElementSource(el);
        source.connect(target);
        el.play();
/*        setTimeout(() => {
            el.pause();
        }, 15000);*/

        /*setTimeout(() => {
            el.src = 'assets/desconocido.mp3';
            el.play();
        }, 18000);*/


        return target.stream;


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
                this.ngZone.run(() => this.notifier.next(this._parseEvent(<UAEvent>event, e)))
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
                payload['session'] = new Session(event['session'], this.audioElement);
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
