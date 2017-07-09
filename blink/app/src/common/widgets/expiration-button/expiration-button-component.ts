/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jordan Lawler (jordan.lawler@thoughtspot.com)
 *
 * @fileoverview Timer element and 'keep' CTA
 */

'use strict';

import {UIComponent} from '../../../base/base-types/ui-component';
import {Component, ngRequire} from '../../../base/decorators';
import {strings} from '../../../base/strings';
let util = ngRequire('util');

@Component({
    name: 'bkExpirationButton',
    templateUrl: 'src/common/widgets/expiration-button/expiration-button.html'
})
export default class ExpirationButtonComponent extends UIComponent {

    public strings: any;
    private remainingTimeDisplay: string;
    private savedDialogActive: boolean = true;
    private timer: any;
    private timingVals: any = {
        RESET_INTERVAL: 1000,
        SAVE_TOGGLE_INTERVAL: 2000
    };

    constructor(private expirationTime,
                private keepCallback,
                private isDisabled,
                private documentModel,
                private documentType) {
        super();
        this.initializeTimer();
        this.strings = strings;
    }

    public handleClick() {
        this.keepCallback(this.documentType, this.documentModel).then(() => {
            this.isDisabled = true;
            this.savedDialogActive = true;
            setTimeout(this.clearSavedDialog.bind(this), this.timingVals.SAVE_TOGGLE_INTERVAL);
            this.forceRender();
        });
    }

    onDestroy() {
        clearInterval(this.timer);
    }

    private updateTime() {
        let timeToLive = this.expirationTime - Date.now();
        if (timeToLive < 0) {
            this.remainingTimeDisplay = strings.expirationButton.VIEW_HAS_EXPIRED;
        } else {
            this.remainingTimeDisplay = util.getHoursMinutesFromEpoch(timeToLive);
        }
        this.forceRender();
    }

    private initializeTimer() {
        this.updateTime();
        this.timer = setInterval(this.updateTime.bind(this), this.timingVals.RESET_INTERVAL);
    }

    private clearSavedDialog() {
        this.savedDialogActive = false;
        this.forceRender();
    }
}


