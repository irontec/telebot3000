import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallspollService } from './../../../app-jssip/services/callspoll.service';
import { Call } from './../../../app-jssip/services/ua.service/call';
import { ConfigurationService } from './../../../app-jssip/services/configuration.service';

import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';
import { HttpClient } from '@angular/common/http';
import { bingSpeech } from 'cognitive-services';
@Component({
    selector: 'app-call',
    templateUrl: './call.component.html',
    styleUrls: ['./call.component.scss']
})
export class CallComponent implements OnInit, AfterViewInit {

    @ViewChild('wave') canvas;

    public currentCall: Observable<Call>;
    private analyser: AnalyserNode;

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
                        this.analyser = call.getCallOptions().analyser;
                        return Observable.of(call);
                    }
                }
                this.router.navigate(['callslist']);
                return empty();
            });
    }

    ngAfterViewInit() {
        this._prepareVisalizer(this.analyser);
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
            voiceName: 'Microsoft Server Speech Text to Speech Voice (es-ES, Laura, Apollo)',
            gender: 'Female'
        };

        sp.getSpeech({
            headers,
            body
        }).then(response => call.getCallOptions().sendAudioBinary(response));

    }

    prepareListening(call) {

    }

    /**
     * Code taken from: https://github.com/mdn/voice-change-o-matic/blob/gh-pages/scripts/app.js#L123-L167
     * @param analyser
     */
    private _prepareVisalizer(analyser: AnalyserNode) {
        if (!this.canvas.nativeElement) {
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

            const draw = function() {

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
