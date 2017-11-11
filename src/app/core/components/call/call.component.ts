import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
export class CallComponent implements OnInit {

    public currentCall: Observable<Call>;
    private _call: Call;

    constructor(
        private config: ConfigurationService,
        private http: HttpClient,
        private callsPool: CallspollService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.currentCall = this.route.params
            .switchMap(params => {
                console.log(params);
                if (!params['id']) {
                    return empty();
                }

                const call = this.callsPool.getCallById(params['id']);
                if (!call) {
                    return empty();
                }
                this._call = call;
                return Observable.of(call);
            });

    }

    playSound(path) {
        return this.http.get(path, {
            responseType: 'blob'
        }).subscribe(data => {

            console.log(data);
            this._call.playBlob(data);
        });
    }


    speak(text: string) {

        const sp = new bingSpeech({
            apiKey: this.config.getRandomAzureKey(),
        });


        const headers = {
            "X-Microsoft-OutputFormat": "raw-16khz-16bit-mono-pcm"
        };
        //audio-16khz-128kbitrate-mono-mp3
        //riff-16khz-16bit-mono-pcm
        //raw-16khz-16bit-mono-pcm
        const body = {
            text: "¿son estos tus deberes larry?",
            language: "es-ES",
            voiceName: "Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)",
            gender: "Female"
        };

        sp.getSpeech({
            headers,
            body
        }).then(response => {
            console.log(response);
            this._call.playBinary(response);
        });

    }

}
