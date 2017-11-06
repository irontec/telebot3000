import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import 'rxjs/add/operator/takeWhile';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { UaService } from './../../../app-jssip/services/ua.service';
import { ConfigurationService } from './../../../app-jssip/services/configuration.service';
import { ConfigurationStoreService } from './../../../app-jssip/services/configuration-store.service';

@Component({
    selector: 'app-config',
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigComponent implements OnInit, OnDestroy {
    hidePassword: true;
    configForm: FormGroup;
    alive: boolean;
    mustPersist = false;
    savingInterval = null;

    constructor(
        private fb: FormBuilder,
        private UA: UaService,
        private configuration: ConfigurationService,
        private configurationStore: ConfigurationStoreService
    ) {

    }

    ngOnInit() {
        this.alive = true;
        this.configForm = this.fb.group({
            wsuri: this.configuration.wsuri,
            sipuri: this.configuration.sipuri,
            password: this.configuration.password,
            autosave: this.configuration.autosave,
            autoconnect: this.configuration.autoconnect,
            stuns: this.configuration.stuns
        });

        // Avoid disabling flicking

        this._monitorAutosave();
        this._monitorChanges();
        this._monitorStatus();

    }

    ngOnDestroy() {
        this.alive = false;
    }

    private _monitorChanges() {
        this.configForm.valueChanges
            .takeWhile(() => this.alive)
            .subscribe((value) => {

                Object.keys(value).map(key => {
                    this.configuration[key] = value[key];
                });

                if (this.configForm.controls.autosave.value) {
                    this.configurationStore.saveConfiguration();
                } else {
                    this.configurationStore.clear();
                }
            });
    }

    private _monitorAutosave() {
        const autoSave = this.configForm.controls.autosave;
        autoSave.valueChanges
            .takeWhile(() => this.alive)
            .subscribe((value) => {
                if (value) {
                    this.configForm.controls.autoconnect.enable();
                } else {
                    this.configForm.controls.autoconnect.disable();
                    this.configurationStore.clear();
                }
            });
    }

    private _monitorStatus() {
        this.UA.status
            .takeWhile(() => this.alive)
            .subscribe(status => {
                if (status.connected) {
                    this.configForm.disable();
                } else {
                    this.configForm.enable();

                    if (!this.configForm.controls.autosave.value) {
                        this.configForm.controls.autoconnect.disable();
                    }
                }
            });
    }

}
