import { Injectable } from '@angular/core';
import { WebSocketInterface} from 'jssip';

@Injectable()
export class ConfigurationService {

    public wsuri: string;
    public sipuri: string;
    public password: string;
    public autoconnect = false;
    public autosave = false;
    private _stuns: string[] = [];

    private _azurekeys: string[] = [];

    constructor() {
    }

    _generateSocket() {
        if (!this.wsuri) {
            throw new Error('host not defined');
        }
        return new WebSocketInterface(this.wsuri);
    }

    getConfiguration() {
        if (!this._isValid) {
            throw new Error('configuration not loaded');
        }
        return {
            sockets: [this._generateSocket()],
            uri: this.sipuri,
            password: this.password,
            autoConnect: false,
            register: true,
            register_expires: 600,
            session_timers: true,
            connection_recovery_min_interval: 2,
            connection_recovery_max_interval: 30,
            registrar_server: '',
            no_answer_timeout: 60,
            use_preloaded_route: false,
            hack_via_tcp: false,
            hack_via_ws: false,
            hack_ip_in_contact: false
        };
    }

    get stuns() {
        return  this._stuns.join('\n');
    }

    set stuns(stuns) {
        this._stuns = stuns.split('\n').filter(s => s !== '');
    }

    get azurekeys() {
        return  this._azurekeys.join('\n');
    }

    set azurekeys(keys) {
        // Will return a shuffled array with the keys (use 1 each time)
        this._azurekeys = keys.split('\n')
                            .filter(s => s !== '')
                            .sort(() => Math.random() - 0.5);
    }

    getPcConfig() {
        return { 'iceServers': [ {'urls': this._stuns} ], 'gatheringTimeout': 2000 };
    }

    private _isValid() {
         return this.wsuri != null && this.sipuri != null && this.password != null;
    }

}
