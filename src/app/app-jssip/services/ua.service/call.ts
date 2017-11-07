import { Session } from './session';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/switchMap';
import 'rxjs/operators/takeWhile';
import 'rxjs/add/observable/combineLatest';
import { CallType, CallDirection, CallIntalkSubtype } from '../../utils';

import { UAnewRTCSessionData } from './../../utils';

/**
 * Angular wrapper for JSSip.session
 */
export class Call {

    public target: string;
    public direction: CallDirection;
    public id: string;

    private _session: Session;
    public living = false;

    public status: Observable<any>;

    private type: CallType;
    private inTalkSubtype: CallIntalkSubtype;
    public liveDuration: Observable<number>;
    public duration: number;

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

    setSession(rtcData: UAnewRTCSessionData) {

        this.living = true;

        this._session = rtcData.session;

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

                if (type === 'done') {
                    console.log("DYing!!");
                    this.living = false;
                }

                this.type = type;

                this.inTalkSubtype = subtype;
                return { type, subtype };
            }
        ).do(c => console.log('new call status', c));

        this.duration = 0;
        this.liveDuration = Observable.interval(1000)
                            .switchMap(c => Observable.of( (c * 1000) + 1 ) // milliseconds, so we void 0 == false on *ngIf
                            .do( duration => this.duration = duration);

    }

    hydrate(raw) {
        this.type = raw.type;
        this.inTalkSubtype = raw.subtype || null;
        this.target = raw.target;
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
            if (this.inTalkSubtype === 'talking') {
                return 'phone_in_talk';
            }

            if (this.inTalkSubtype === 'hold') {
                return 'phone_paused';
            }
        }

        return 'phone';
    }

}


