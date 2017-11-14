import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallspollService } from './../../../app-jssip/services/callspoll.service';
import { Call } from './../../../app-jssip/services/ua.service/call';
import { ConfigurationService } from './../../../app-jssip/services/configuration.service';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { empty } from 'rxjs/observable/empty';
import { bingSpeech } from 'cognitive-services';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as msr from 'msr';



@Component({
    selector: 'app-call',
    templateUrl: './call.component.html',
    styleUrls: ['./call.component.scss']
})
export class CallComponent implements OnInit, AfterViewInit {

    @ViewChild('wave') canvas;

    public currentCall: Observable<Call>;
    private analyser: AnalyserNode;
    private sentences = new Subject<string>();
    public words: Observable<string[]>;

    constructor(
        private config: ConfigurationService,
        private http: HttpClient,
        private callsPool: CallspollService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.currentCall = this.route.params
            .switchMap(params => {

                if (params['id']) {
                    const call = this.callsPool.getCallById(params['id']);
                    if (call && call.living) {
                        // We ref incomng audio analyser
                        this.analyser = call.getCallOptions().analyser;
                        // We set up speach recognition
                        this.prepareListening(call);

                        return Observable.of(call);
                    }
                }
                this.router.navigate(['callslist']);
                return empty();
            });

        this.words = this.sentences.asObservable().scan((current, word) => [word, ...current], []);
    }


    ngAfterViewInit() {
        /**
         * We need canvas to be settled down
         */
        this.prepareVisualizer(this.analyser);

    }

    sendSound(call, path) {
        return this.http.get(path, {
            responseType: 'blob'
        }).subscribe(data => call.getCallOptions().sendAudioBlob(data));
    }


    speak(call, text: string) {

        const sp = new bingSpeech({
            apiKey: this.config.getRandomAzureKey(),
        });


        const headers = {
            'X-Microsoft-OutputFormat': 'riff-8khz-8bit-mono-mulaw'
        };

        const body = {
            text,
            language: 'es-ES',
            voiceName: 'Microsoft Server Speech Text to Speech Voice (es-ES, Pablo, Apollo)', //'Microsoft Server Speech Text to Speech Voice (es-ES, Laura, Apollo)',
            gender: 'Male' // 'Female'
        };

        sp.getSpeech({
            headers,
            body
        }).then(response => call.getCallOptions().sendAudioBinary(response));

    }

    private prepareListening(call) {
        const stream = call.getCallOptions().output;

        //curl -v -X POST "https://speech.platform.bing.com/speech/recognition/conversation/cognitiveservices/v1?language=es-es&format=detailed" -H "Transfer-Encoding: chunked" -H "Ocp-Apim-Subscription-Key: b8cf5513ade1411ea9e8c447c75cd510" -H "Content-type: audio/wav; codec=audio/pcm; samplerate=16000" --data-binary @src/assets/deberes.wav
        const mediaRecorder = new msr(stream);
        mediaRecorder.mimeType = 'audio/wav'; // check this line for audio/wav
        mediaRecorder.ondataavailable = (blob) => {
          this.listen(blob);
        };

        mediaRecorder.start(5000);


        call.status.subscribe(({ type, subtype }) => {
            if (type === 'done') {
                mediaRecorder.stop();
            }
        });
    }

    private listen(blob) {

        const URL = 'https://speech.platform.bing.com/speech/recognition/'
            + 'conversation/cognitiveservices/v1?language=es-es&format=detailed';

        const headers = new HttpHeaders({
            'Ocp-Apim-Subscription-Key': this.config.getRandomAzureKey(),
            'Content-type': 'audio/wav; codec=audio/pcm; samplerate=16000'
        });
        this.http.post(URL, new File([blob], 'sound.wav'), {
            headers,
            responseType: 'json'
        }).subscribe(response => {
            if (response['RecognitionStatus']  && response['RecognitionStatus'] ===  'Success'
                    && response['NBest'] && response['NBest'][0]) {
                const sentence = response['NBest'][0].Lexical;
                this.sentences.next(sentence);
            }

        });

    }


    /**
     * Code taken from: https://github.com/mdn/voice-change-o-matic/blob/gh-pages/scripts/app.js#L123-L167
     * @param analyser
     */
    private prepareVisualizer(analyser: AnalyserNode) {
    if (!this.canvas || !this.canvas.nativeElement) {
        return;
    }
    const canvas = this.canvas.nativeElement;
    const canvasCtx = canvas.getContext('2d');

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    let drawVisual;

    return new Promise((resolve, reject) => {

        analyser.fftSize = 2048;
        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);

        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

        const draw = function () {

            drawVisual = requestAnimationFrame(draw);

            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(250, 250, 250)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            canvasCtx.lineWidth = 1;
            canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

            canvasCtx.beginPath();

            const sliceWidth = WIDTH * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {

                const v = dataArray[i] / 128.0;
                const y = v * (HEIGHT / 2);

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        };

        draw();


    });

}


}
