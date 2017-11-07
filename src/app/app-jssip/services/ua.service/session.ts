import { session as JSSipSession, Utils as JSSIPUtils, stream as JSSIPStream } from 'jssip';

import { CallType, CallDirection, CallIntalkSubtype } from '../../utils';

import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'rxjs/add/observable/of';

/**
 * Angular wrapper for JSSip.session
 */
export class Session {

    private _session: JSSipSession;

    public status = new BehaviorSubject<CallType>('ringing');
    public inTalkStatus = new Subject<CallIntalkSubtype>();

    public muted = new Subject<boolean>();

    private node: HTMLAudioElement;
    private _localStream: JSSIPStream;

    constructor(sessionRaw: JSSipSession, node: HTMLAudioElement) {
        this._session = sessionRaw;
        this.node = node;
        this.inTalkStatus.next(null);

        this._wireUpEvents();
    }

    get direction(): CallDirection {
        return this._session['_direction'] === 'incoming' ? 'IN' : 'OUT';
    }

    get id() {
        return this._session.id;
    }

    get target() {
        return this._session.remote_identity.uri.user;
    }

    get usernameTarget() {
        return this._session.remote_identity.display_name || '';
    }

    private _wireUpEvents() {
        this._session
            .on('connecting', (e) => this.onConnecting())
            .on('progress', (e) => this.onProgress())
            .on('accepted', (e) => this.onAccepted(e))
            .on('failed', (e) => this.onFailed(e))
            .on('newDTMF', (e) => this.onDTMF(e))
            .on('hold', (e) => this.onHold())
            .on('unhold', (e) => this.onUnhold())
            .on('ended', (e) => this.onEnded())
            .on('update', (e) => this.onUpdate());

        if (this._session.connection) {
            this._session.connection.addEventListener('addstream', (e) => this.onStreamAdded(e));
        } else {
            console.log("NOT SESSION!");
        }
    }

    onConnecting() {
        console.log('connecting');
        if (this._session.connection.getSenders().length > 0) {
            this._localStream = this._session.connection.getSenders()[0];
        }
    }

    onProgress() {
        this.status.next('ringing');
    }

    onFailed(e) {
        this.status.next('done');
        console.log('failed!! wtf????', e);
    }

    onAccepted(e: any) {

        console.log('acepted');
        this.status.next('active');
        this.inTalkStatus.next('talking');

        if (this._session.connection.getSenders().length > 0) {
            this._localStream = this._session.connection.getSenders()[0];
        }

        if (e.originator === 'remote') {
            if (e.response.getHeader('X-Can-Renegotiate') === 'false') {
                this._session.data.remoteCanRenegotiateRTC = false;
            } else {
                this._session.data.remoteCanRenegotiateRTC = true;
            }
        }

        // this.date = this.moment(this._session.start_time).format('DD/MM/YYYY HH:mm:ss');

    }

    onStreamAdded(e) {

        this.node.srcObject = e.stream;

    }

    onDTMF(e) {
        console.log(e);

    }

    onHold() {
        this.inTalkStatus.next('hold');

    }

    onUnhold() {
        this.inTalkStatus.next('talking');
    }

    onEnded() {
        console.log("eneded???");
        this.muted.complete();
        this.status.next('done');
        /*var startTime = this.moment(this.session.start_time);
        var endTime = this.moment(this.session.end_time);
        var duration = this.moment.duration(endTime.diff(startTime));
        this.duration = this.moment.utc(duration.asMilliseconds()).format("mm:ss");*/


        JSSIPUtils.closeMediaStream(this._localStream);
    }

    onUpdate() {
        console.log("on updated");
        this.status.next('done');
    }

    hangup() {
        this._session.terminate();
    }

    answer() {
        this._session.answer();
    }

    hold() {
        this._session.hold();
    }

    unhold() {
        this._session.unhold();
    }

    mute() {
        this.muted.next(true);
        this._session.mute();
    }

    unmute() {
        this.muted.next(false);
        this._session.unmute();
    }


}


