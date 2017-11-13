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


    public analyser: AnalyserNode;
    micEnabled = true;
    micStream: any;

    constructor(config: ConfigurationService) {

    }

    async get() {

        return {
            'mediaStream': await this.generateStream(),
            'mediaConstraints': { 'audio': this.audio, 'video': this.video },
            'pcConfig': {
                'iceServers': [{ 'urls': ['stun:stun.l.google.com:19302'] }],
                'gatheringTimeout': 2000,
                rtcpMuxPolicy: 'negotiate'
            },
            rtcOfferConstraints: {
                offerToReceiveAudio: this.audio ? 1 : 0,
                offerToReceiveVideo: this.video ? 1 : 0
            }
        };

    }

    getTargetStream(): MediaStream {
        return this.target;
    }

    public sendAudioBinary(binary: any) {

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

    public sendAudioBlob(blob: Blob) {

        const audio0 = new Audio(window.URL.createObjectURL(blob));

        const source = this.audioCtx.createMediaElementSource(audio0);
        source.connect(this.target);
        audio0.loop = false;

        audio0.onended = () => {
            source.disconnect(this.target);
        };
        audio0.play();

    }

    public toggleMic() {
        if (this.micEnabled) {
            this.micEnabled = false;
            this.micStream.disconnect(this.target);
        } else {
            this.micEnabled = true;
            this.micStream.connect(this.target);
        }
    }

    public outputStream(stream) {
        const audioCtx = <any>new AudioContext();

        // typescript doen't know 'createMediaStreamDestination' :(
        this.analyser = <any>audioCtx.createAnalyser();

        const target = audioCtx.createMediaStreamDestination();

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(this.analyser);
        this.analyser.connect(target);

        const audio = new Audio();
        audio.autoplay = true;
        audio.srcObject = stream;
    }

    private async generateStream() {

        const mic = await navigator.mediaDevices.getUserMedia({ audio: this.audio, video: this.video });

        // typescript doen't know 'createMediaStreamDestination' :(
        this.audioCtx = <any>new AudioContext();
        this.target = this.audioCtx.createMediaStreamDestination();

        this.micStream = this.audioCtx.createMediaStreamSource(mic);
        this.micStream.connect(this.target);
        this.micEnabled = true;
        return this.target['stream'];
    }






}
