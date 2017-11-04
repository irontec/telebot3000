import { Injectable } from '@angular/core';
import { WebSocketInterface} from 'jssip';

@Injectable()
export class ConfigurationService {

    public host: string;
    public uri: string;
    public password: string;

    constructor() {
    }

    _generateSocket() {
        if (!this.host) {
            throw new Error('host not defined');
        }
        return new WebSocketInterface(this.host);
    }

    getConfiguration() {
        if (!this._isValid) {
            throw new Error('configuration not loaded');
        }
        return {
            sockets: [this._generateSocket()],
            uri: this.uri,
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

    getPcConfig() {
        return { 'iceServers': [ {'urls': ['stun:stun.l.google.com:19302']} ], 'gatheringTimeout': 2000 };
    }

    private _isValid() {
         return this.host != null && this.uri != null && this.password != null;
    }

}
