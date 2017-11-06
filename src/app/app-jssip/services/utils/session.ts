import { session as JSSipSession, Utils as JSSIPUtils, stream as JSSIPStream } from 'jssip';
import { sessionStatus } from '../../utils';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/of';

/**
 * Angular wrapper for JSSip.session
 */
export class Session {

    private _session: JSSipSession;
    public status = new Subject<sessionStatus>();
    public muted = new Subject<boolean>();

    private node: HTMLAudioElement;
    private _localStream: JSSIPStream;

    constructor(sessionRaw: JSSipSession, node: HTMLAudioElement) {
        this._session = sessionRaw;
        this.node = node;
        this.status.next('ringing');
        this._wireUpEvents();
    }

    get type() {
        return this._session['direction'] === 'incoming' ? 'IN' : 'OUT';
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
            .on('failed', (e) => this.onFailed())
            .on('newDTMF', (e) => this.onDTMF(e))
            .on('hold', (e) => this.onHold())
            .on('unhold', (e) => this.onUnhold())
            .on('ended', (e) => this.onEnded())
            .on('update', (e) => this.onUpdate());

        this._session.connection.addEventListener('addstream', (e) => this.onStreamAdded(e));
    }



    onConnecting() {
        if (this._session.connection.getSenders().length > 0) {
            this._localStream = this._session.connection.getSenders()[0];
        }
    }

    onProgress() {

    }

    onAccepted(e: any) {

        this.status.next('active');

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
        this.status.next('paused');
    }

    onUnhold() {
        this.status.next('active');
    }

    onEnded() {
        this.muted.complete();
        this.status.next('finished');
        /*var startTime = this.moment(this.session.start_time);
        var endTime = this.moment(this.session.end_time);
        var duration = this.moment.duration(endTime.diff(startTime));
        this.duration = this.moment.utc(duration.asMilliseconds()).format("mm:ss");*/


        JSSIPUtils.closeMediaStream(this._localStream);
    }

    onUpdate() {
        this.status.next('finished');
    }

    onFailed() {
        this.status.next('finished');
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


