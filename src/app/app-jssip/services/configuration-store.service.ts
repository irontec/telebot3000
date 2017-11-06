import { Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';

import * as localforage from 'localforage';

@Injectable()
export class ConfigurationStoreService {

    private props = ['wsuri', 'sipuri', 'password', 'autoconnect', 'autosave', 'stuns'];

    constructor(
        private configuration: ConfigurationService
    ) {

        localforage.config({
            driver: localforage.LOCALSTORAGE,
            name: 'telecom3000',
            version: 1.0,
            storeName: 'configuration'
        });
    }

    saveConfiguration(): Observable<boolean> {
        return Observable.fromPromise(
            Promise.all(
                this.props.map(async (prop) => {
                    return localforage.setItem(prop, this.configuration[prop]);
                })
            )
        ).map(e => true);
    }


    applyConfiguration(): Observable<boolean> {
        return Observable.fromPromise(
            Promise.all(
                this.props.map(async (prop) => {
                    const value = await localforage.getItem(prop);
                    if (value != null) {
                        this.configuration[prop] = value;
                    }
                })
            )
        ).map(e => true);
    }

    clear() {
        localforage.clear();
    }

}
