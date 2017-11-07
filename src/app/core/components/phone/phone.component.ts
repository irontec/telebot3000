import { Component, OnInit, HostListener, ViewChild, Renderer, ElementRef } from '@angular/core';
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
    @ViewChild('callButton', {read: ElementRef}) private callButton: ElementRef;

    buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
    public targetControl = new FormControl('', [Validators.pattern('^[0-9#*]*$')]);

    constructor(
        private renderer: Renderer,
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

        if (e.key === 'Enter' && this.targetControl.value !== '') {
            e.stopImmediatePropagation();
            e.preventDefault();

            this.renderer.invokeElementMethod(
                this.callButton.nativeElement,
                'dispatchEvent',
                [new MouseEvent('click', {bubbles: true})]
            );
        }
    }

    callIt(isConnected = null) {
        if (!isConnected || this.targetControl.value === '') {
            return;
        }
        this.UA.call(this.targetControl.value);
    }

}
