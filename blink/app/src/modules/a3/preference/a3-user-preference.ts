/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Manoj Ghosh (manoj.ghosh@thoughtspot.com)
 *
 * @fileoverview This component allows one to persist a3 user preference settings.
 */

import _ from 'lodash';
import {ngRequire, Provide} from '../../../base/decorators';
import {getUserPreferenceProto} from '../../callosum/service/session-service';

let userAdminService = ngRequire('userAdminService');
declare var tsProto: any;

@Provide('A3UserPreference')
export class A3UserPreference {

    private backingProto: any = null;

    public constructor() {
        this.init();
    }

    public getExcludeColumnsSet() {
        return new Set(this.getExcludeColumns());
    }

    public getExcludeColumns() {
        if (!!this.backingProto) {
            return this.backingProto.a3.getExcludeColumns();
        }
        return [];
    }

    public setExcludeTokens(includeTokens: Array<any>, excludeColumns: Array<string>): void {
        let columns: Array<string> = [];
        if (!!includeTokens && includeTokens.length > 0) {
            columns = includeTokens.map(token => {
                return token.guid;
            });
        }
        columns = _.union(this.backingProto.a3.getExcludeColumns(), columns);
        excludeColumns.forEach(exclude => {
            columns.remove(exclude);
        });
        this.backingProto.a3.setExcludeColumns(columns);
    }

    public saveUserPreferenceProto(): void {
        userAdminService.updateUserPreferenceProto(this.backingProto);
    }

    public getNotification() {
        return this.backingProto.a3.getEmailNotification();
    }

    public updateEmailNotification(
        emailOnSuccess: boolean,
        emailOnFailure: boolean,
        attachPinboard: boolean) {
        let notification = this.getNotification();
        if (emailOnSuccess || emailOnFailure) {
            notification.setNotifiy(true);
        } else {
            this.backingProto.a3.getEmailNotification().setNotifiy(false);
        }
        notification.setOnSuccess(emailOnSuccess);
        notification.setOnFailure(emailOnFailure);
        notification.setAttachContent(attachPinboard);
    }

    private init(): void {
        if (!this.backingProto) {
            this.backingProto = new tsProto.callosum.PreferenceProto();
        }
        let preference = getUserPreferenceProto();
        if (!!preference) {
            this.backingProto = tsProto.callosum.PreferenceProto.decode(preference);
        } else {
            this.backingProto = new tsProto.callosum.PreferenceProto();
            this.backingProto.a3 = new tsProto.callosum.PreferenceProto.A3PreferenceProto();
            this.backingProto.a3.email_notification
                = new tsProto.callosum.PreferenceProto.NotificationProto();
            this.updateEmailNotification(
                true /* emailOnSuccess */,
                true /* emailOnFailure */,
                true /* attachPinboard */);
        }
    }
}

