import { Session } from './session';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/switchMap';

import 'rxjs/add/operator/share';
import 'rxjs/operators/takeWhile';
import 'rxjs/add/observable/combineLatest';
import { CallType, CallDirection, CallIntalkSubtype } from '../../utils';

import { UAnewRTCSessionData } from './../../utils';

declare type EndcallCallback = (callData: any) => void;


/**
 * Angular wrapper for JSSip.session
 */
export class Call {

    public target: string;
    public direction: CallDirection;
    public id: string;
    public type: CallType;
    public inTalkSubtype: CallIntalkSubtype;
    public living = false;
    public duration: number;
    public micEnabled = true;
    public liveDuration: Observable<number>;
    public incomingDTMF: Observable<string>;
    public outgoingDTMF: Observable<string>;
    private _session: Session;
    public status: Observable<any>;
    private endingCallback: (data) => void;
    private _incomingStreamCallBack: (data) => void;

    constructor() {

    }

    hangup() {
        if (this.living) {
            this._session.hangup();
        }
    }

    answer() {
        if (this.living) {
            this._session.answer();
        }
    }

    hold() {
        if (this.living) {
            this._session.hold();
        }
    }

    unhold() {
        if (this.living) {
            this._session.unhold();
        }
    }

    mute() {
        if (this.living) {
            this._session.mute();
        }
    }

    unmute() {
        if (this.living) {
            this._session.unmute();
        }
    }

    sendDTMF(d: string, event: PointerEvent =  null) {

        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        this._session.sendDTMF(d);
    }


    registerEndCallback(fn: (data) => void) {
        this.endingCallback = fn;
    }

    setSession(rtcData: UAnewRTCSessionData) {

        this.living = true;

        this._session = rtcData.session;


        if (this._incomingStreamCallBack) {
            this._session.registerIncomingStreamCallback(this._incomingStreamCallBack);
            this._incomingStreamCallBack = null;
        }


        this.target = this._session.target;
        this.direction = this._session.direction;
        this.id = this._session.id;


        this.status = Observable.combineLatest(
            this._session.status.asObservable(),
            this._session.inTalkStatus.asObservable().startWith(''),
            (type, subtype) => {

                if (type !== 'active') {
                    subtype = '';
                }

                this.type = type;
                this.inTalkSubtype = subtype;

                if (type === 'done') {
                    this.living = false;
                    if (this.endingCallback) {
                        this.endingCallback({
                            target: this.target,
                            direction: this.direction,
                            id: this.id,
                            type: this.type,
                            inTalkSubtype: this.inTalkSubtype,
                            duration: this.duration * 1000
                        });
                    }
                }
                return { type, subtype };
            }
        );

        this.duration = 0;
        this.liveDuration = Observable.interval(1000)
                                .takeWhile(() => this.living)
                                .switchMap(c => {
                                    this.duration++;
                                    const value = (this.duration * 1000) +1;
                                    return Observable.of(value); // milliseconds, so we void 0 == false on *ngIf
                                })
                                .publishReplay(1)
                                .refCount();

        const dtmfFeed = this._session.dtmf.asObservable().share();

        this.incomingDTMF = dtmfFeed
                                .filter(d => d.originator === 'remote')
                                .map(d => d.code)
                                .scan((current, code) => `${current} ${code}`, '');

        this.outgoingDTMF = dtmfFeed
                                .filter(d => d.originator === 'local')
                                .map(d => d.code)
                                .scan((current, code) => `${current} ${code}`, '');

    }

    sendBlob(blob: Blob) {
        this._session.callOptions.sendAudioBlob(blob);
    }

    sendBinary(binary: any) {
        this._session.callOptions.sendAudioBinary(binary);
    }

    registerIncomingStreamCallback(fn: (data) => void) {
        if (this._session) {
            this._session.registerIncomingStreamCallback(fn);
        } else {
            this._incomingStreamCallBack = fn;
        }
    }

    hydrate(raw) {
        this.id = raw.id;
        this.direction = raw.direction;
        this.duration = raw.duration;
        this.type = raw.type;
        this.inTalkSubtype = raw.subtype || null;
        this.target = raw.target;
        this.status = Observable.of({
            type: this.type,
            subtype: this.inTalkSubtype
        });
    }

    toggleMic() {
        this.micEnabled = !this.micEnabled;
        this._session.callOptions.toggleMic();
    }

    get icon() {
        const type = this.type;
        if (type === 'ringing') {
            return 'ring_volume';
        }

        if (type === 'missed') {
            return 'phone_missed';
        }

        if (type === 'active') {

            if (this.inTalkSubtype === 'hold') {
                return 'phone_paused';
            }
            return 'phone_in_talk';
        }

        return 'call_end';
    }

}


