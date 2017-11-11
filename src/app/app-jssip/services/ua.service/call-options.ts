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
import { ConfigurationService } from './../configuration.service';
import { UAnewRTCSessionData } from './../../utils';

declare type EndcallCallback = (callData: any) => void;


/**
 * Angular wrapper for JSSip.session
 */
export class CallOptions {

    audio = true;
    video = false;
    audioCtx: any;
    target: any;

    constructor(config: ConfigurationService) {

    }

    async get() {

        return {
            'mediaStream': await this.generateStream(),
            'mediaConstraints': { 'audio': this.audio, 'video': this.video },
            'pcConfig': { 'iceServers': [{ 'urls': ['stun:stun.l.google.com:19302'] }], 'gatheringTimeout': 2000 },
            rtcOfferConstraints: {
                offerToReceiveAudio: this.audio ? 1 : 0,
                offerToReceiveVideo: this.video ? 1 : 0
            }
        };

    }

    getTargetStream(): MediaStream {
        return this.target;
    }

    playAudioBinary(binary: any) {

        const len = binary.length;
        const bytes = new Uint8Array( len );
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        this.audioCtx.decodeAudioData(bytes.buffer).then(buffer => {
            const source = this.audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(this.target);
            source.start(0);
        }).catch(e => console.log('ERROR decoding audio!', e));

    }

    playAudioBlob(blob: Blob) {

        const audio0 = new Audio(window.URL.createObjectURL(blob));

        const source = this.audioCtx.createMediaElementSource(audio0);
        source.connect(this.target);
        audio0.loop = false;

        audio0.onended = () => {
            source.disconnect(this.target);
        };
        audio0.play();

    }

    private async generateStream() {

        const micStream = await navigator.mediaDevices.getUserMedia({ audio: this.audio, video: this.video });

        this.audioCtx = <any>new AudioContext();

        this.target = this.audioCtx.createMediaStreamDestination();

        const mediaStream = this.audioCtx.createMediaStreamSource(micStream);
        mediaStream.connect(this.target);

        return this.target['stream'];

    }

}
