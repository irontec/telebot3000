import { Component, OnInit } from '@angular/core';
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
export class CallComponent implements OnInit {


    public currentCall: Observable<Call>;

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

                        call.registerIncomingStreamCallback((stream) => this.wireUpStream(stream));
                        return Observable.of(call);
                    }
                }
                this.router.navigate(['callslist']);
                return empty();
            });

    }

    sendSound(call, path) {
        return this.http.get(path, {
            responseType: 'blob'
        }).subscribe(data => call.sendBlob(data));
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
        }).then(response => call.sendBinary(response));

    }

    private wireUpStream(stream: any) {
        const audio = new Audio();
        audio.autoplay = true;
        audio.srcObject = stream;
    }

}
