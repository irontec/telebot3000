import { Component, OnInit, HostListener, NgZone } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { UaService } from './../../../app-jssip/services/ua.service';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

@Component({
    selector: 'app-phone',
    templateUrl: './phone.component.html',
    styleUrls: ['./phone.component.scss']
})
export class PhoneComponent implements OnInit {

    buttons = [
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'
    ];
    public connection: Observable<any>;
    public targetControl = new FormControl('', [Validators.pattern('^[0-9#*]*$')]);

    constructor(
        private UA: UaService
    ) { }

    ngOnInit() {
        const cleanRegExp = new RegExp(`[^${this.buttons.join('')}]*`, 'g');
        this.targetControl.valueChanges.subscribe(val => {
            const cleanVal = val.replace(cleanRegExp, '');
            this.targetControl.setValue(cleanVal, {emitEvent: false, emitModelToViewChange: true});
        });
    }

    buttonPressed(button) {
        this.targetControl.setValue(`${this.targetControl.value}${button}`);
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(e: KeyboardEvent) {
        if (this.buttons.indexOf(e.key) !== -1) {
            e.stopImmediatePropagation();
            e.preventDefault();
            this.buttonPressed(e.key);
        }

        if (e.key === 'Backspace') {
            e.stopImmediatePropagation();
            e.preventDefault();
            this.targetControl.setValue(`${this.targetControl.value.slice(0, -1)}`);
        }

        if (e.key === 'Escape') {
            e.stopImmediatePropagation();
            e.preventDefault();
            this.targetControl.setValue('');
        }


    }

    callIt(isConnected = null) {
        if (!isConnected) {
            return;
        }
        this.UA.call(this.targetControl.value);
    }

}
