import { Observable } from 'rxjs/Observable';
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
import { Session } from './session';

@Injectable()
export class UaService {

    public notifier: Observable<UAMessage>;
    public connection: Observable<boolean>;
    private ua: UA;

    private audioElement: HTMLAudioElement;

    constructor(
        private config: ConfigurationService,
        private ngZone: NgZone
    ) {
    }

    connect() {
        this.ua = new UA(this.config.getConfiguration());
        this.notifier = this._generateMsgObservable();
        this.connection = this._generateConnectionObservable();
        this.ngZone.runOutsideAngular(() => {
            this.ua.start();
        });
    }

    disconnect() {
        this.ua.unregister({all: true});
        this.ua.stop();
    }

    registerAudioNode(node: HTMLAudioElement) {
        this.audioElement = node;
    }

    call(target) {
        const st = this.GenerateStream();
        this.ua.call(target, {
            'mediaStream' : st,
            'mediaConstraints': {'audio': true, 'video': false},
            'pcConfig': this.config.getPcConfig(),
            rtcOfferConstraints: {
                offerToReceiveAudio: 1,
                offerToReceiveVideo: 0
              }
        });
    }

    GenerateStream() {
        const audioCtx = <any>new AudioContext();
        const target = audioCtx.createMediaStreamDestination();



        const el = <HTMLAudioElement>document.getElementById('lew');
        const source = audioCtx.createMediaElementSource(el);
        source.connect(target);
        el.play();
        setTimeout(() => {
            el.pause();
        }, 15000);

        setTimeout(() => {
            el.src = 'assets/desconocido.mp3';
            el.play();
        }, 18000);


        return target.stream;


    }

    private _generateMsgObservable(): Observable<UAMessage> {

        return Observable.merge(
            Observable.fromEvent(this.ua, 'connecting').map(e => this._parseEvent('connecting', e)),
            Observable.fromEvent(this.ua, 'connected').map(e => this._parseEvent('connected', e)),
            Observable.fromEvent(this.ua, 'disconnected').map(e => this._parseEvent('disconnected', e)),
            Observable.fromEvent(this.ua, 'registered').map(e => this._parseEvent('registered', e)),
            Observable.fromEvent(this.ua, 'unregistered').map(e => this._parseEvent('unregistered', e)),
            Observable.fromEvent(this.ua, 'registrationFailed').map(e => this._parseEvent('registrationFailed', e)),
            Observable.fromEvent(this.ua, 'registrationExpiring').map(e => this._parseEvent('registrationExpiring', e)),
            Observable.fromEvent(this.ua, 'newRTCSession').map(e => this._parseEvent('newRTCSession', e)),
            Observable.fromEvent(this.ua, 'newMessage').map(e => this._parseEvent('newMessage', e))
        )
        .publish()
        .refCount();
    }

    private _generateConnectionObservable(): Observable<boolean> {

        return Observable.merge(
            Observable.fromEvent(this.ua, 'connected').map(e => true),
            Observable.fromEvent(this.ua, 'disconnected').map(e => false),
            Observable.fromEvent(this.ua, 'registered').map(e => true),
            Observable.fromEvent(this.ua, 'unregistered').map(e => false),
        )
        .do(c=>console.log("Connn", c))
        .publishReplay(1)
        .refCount();
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
                payload = this._hydratePayload<UAnewRTCSessionData>(event, ['originator', 'session', 'request']);
                payload['session'] = new Session(payload['session'], this.audioElement);
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
            ret[field] = event[field] || null;
            return ret;
        }, {});
    }

}
