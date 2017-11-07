import { Injectable } from '@angular/core';
import { Call } from './ua.service/call';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class CallspollService {

    private _calls: Call[] = [];
    public calls: BehaviorSubject<Call[]>;

    constructor() {
        this.calls = new BehaviorSubject(this._calls);
    }


    addCall(call: Call) {
        this._calls.unshift(call);
        this._emit();
    }

    private _emit() {
        this.calls.next(this._calls);
    }
    

}
