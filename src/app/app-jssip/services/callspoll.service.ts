import { Injectable } from '@angular/core';
import { Call } from './ua.service/call';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/merge';


import { LocalStorageService } from './../../app-storage/services/localstorage.service';

@Injectable()
export class CallspollService {

  private _calls: Call[] = [];
  public calls: BehaviorSubject<Call[]>;

  constructor(
    private localstorage: LocalStorageService
  ) {

    this._loadDeadCalls();
    this.calls = new BehaviorSubject(this._calls);
  }

  addCall(call: Call, alive = true) {
    if (alive) {
      call.registerEndCallback(this.saveCall());
    }
    this._calls.unshift(call);
    this._emit();
  }

  public saveCall() {
    return (callData) => {
      const id = callData.id;
      const key = `C_${id}`;

      this.localstorage.setItem(key, callData)
        .subscribe((savedCallData: any) => this._updateCallIndex(savedCallData.id));
    };
  }

  private _loadDeadCalls() {
    this.localstorage
      .getItem('CALLS_INDEX')
      .map(calls => !calls ? [] : calls)
      .switchMap((callIndex: string[]) => {
        // remove everything but first 15
        callIndex.slice(15).map(id => this.localstorage.removeItem(`C_${id}`));
        const newCallIndex = callIndex.slice(0, 15);
        this.localstorage.setItem('CALLS_INDEX', newCallIndex);
        return Observable.merge(
          ...newCallIndex.map(id => this.localstorage.getItem(`C_${id}`))
        );
      }).subscribe((c) => {
        const call = new Call();
        call.hydrate(c);
        this.addCall(call, false);
      });
  }


  private _updateCallIndex(id) {
    this.localstorage
      .getItem('CALLS_INDEX')
      .subscribe((callIndex: string[]) => {
        if (callIndex === null) {
          callIndex = [id];
        } else {
          callIndex.push(id);
        }
        this.localstorage.setItem('CALLS_INDEX', callIndex);
      });

  }

  private _emit() {
    this.calls.next(this._calls);
  }

  getCallById(id: string) {
    return this._calls.filter(c => c.id === id).shift() || false;
  }

}
