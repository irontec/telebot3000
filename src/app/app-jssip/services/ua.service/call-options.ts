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
 * TODO: refactor name.
 * SoundEngine would be better...
 */
export class CallOptions {

    hasAudio = true;
    hasVideo = false;

    audioCtx: any;
    target: any;
    output: any;

    public analyser: AnalyserNode;
    micEnabled = true;
    micStream: any;

    speakerEnabled = true;
    outputAudio: HTMLAudioElement;

    constructor(private config: ConfigurationService) {
      this.audioCtx = <any>new AudioContext();
    }

    async get() {

        return {
            'mediaStream': await this.generateStream(),
            'mediaConstraints': { 'audio': this.hasAudio, 'video': this.hasVideo },
            'pcConfig': this.config.getPcConfig(),
            rtcOfferConstraints: {
                offerToReceiveAudio: this.hasAudio ? 1 : 0,
                offerToReceiveVideo: this.hasVideo ? 1 : 0
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

            const gainNode = this.audioCtx.createGain();
            gainNode.gain.value = 2;
            source.connect(gainNode);
            gainNode.connect(this.target);
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

    public toggleSpeaker() {
        if (this.speakerEnabled) {
            this.speakerEnabled = false;
            this.outputAudio.volume = 0;
        } else {
            this.speakerEnabled = true;
            this.outputAudio.volume = 1;
        }
    }

    public outputStream(stream) {

        this.output = stream;
        // typescript doen't know 'createMediaStreamDestination' :(
        this.analyser = <any>this.audioCtx.createAnalyser();

        const target = this.audioCtx.createMediaStreamDestination();

        const source = this.audioCtx.createMediaStreamSource(stream);
        source.connect(this.analyser);
        this.analyser.connect(target);

        this.outputAudio = new Audio();
        this.outputAudio.autoplay = true;
        this.outputAudio.srcObject = stream;
    }

    private async generateStream() {

        const mic = await navigator.mediaDevices.getUserMedia({ audio: this.hasAudio, video: this.hasVideo });

        // typescript doen't know 'createMediaStreamDestination' :(

        this.target = this.audioCtx.createMediaStreamDestination();

        this.micStream = this.audioCtx.createMediaStreamSource(mic);
        this.micStream.connect(this.target);
        this.micEnabled = true;
        return this.target['stream'];
    }


    public close() {
      this.audioCtx.close();
    }



}
