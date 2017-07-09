/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Ashish Shubham (ashish@thoughtspot.com)
 *
 * @fileoverview User preference page
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {blinkConstants} from '../../../base/blink-constants';
import {Component, ngRequire} from '../../../base/decorators';
import {
    changeLocale,
    strings,
    supportedLocales} from '../../../base/strings';
import CheckboxComponent from '../../../common/widgets/checkbox/checkbox';
import {
    getCanChangePassword, getExposedUserPreferences,
    getPreferredLocale, isA3Enabled, setNotifyOnShare, setPreferredLocale, shouldNotifyOnShare
} from '../../callosum/service/session-service';
import {isStringLocalizationEnabled} from '../../callosum/service/system-config-service';
import {UserA3PreferenceComponent} from './a3/user-a3-preference';

let $q = ngRequire('$q');
let alertService = ngRequire('alertService');
let userAdminService = ngRequire('userAdminService');
let UserAction = ngRequire('UserAction');
let slackService = ngRequire('slackService');
let loadingIndicator = ngRequire('loadingIndicator');

interface MenuItem {
    actionType: string;
    label: string;
    selected?: boolean;
}

@Component({
    name: 'bkUserPreference',
    templateUrl: 'src/modules/user-preference/user-preference/user-preference.html'
})
export class UserPreferenceComponent extends BaseComponent {

    public menus = [
        {
            header: 'My Info',
            items: [
                {
                    actionType: 'my-profile',
                    label: 'My Profile',
                    selected: true
                }
            ]
        }
    ];
    public userA3PreferenceComponent = new UserA3PreferenceComponent();
    public canChangePassword: boolean = getCanChangePassword();
    public allowSave = false;
    public updatePasswordMessageReady = false;
    public currentPassword: string;
    public password: string;
    public confirmPassword: string;
    public selectedLocale: string = getPreferredLocale();
    public isLocalizationDisabled: boolean = !isStringLocalizationEnabled();
    public locales: {} = supportedLocales;
    public notifyOnShareCheckbox =
        new CheckboxComponent(strings.Email_me, () => shouldNotifyOnShare())
            .setOnClick(($event) => {
                setNotifyOnShare(!shouldNotifyOnShare());
                this.saveExposedUserPreferences();
            });

    private slackUserInfo = slackService.getUserInfo();
    private updatePasswordMessageString;

    /**
     * Determine the selected item from the multiple menus.
     *
     * @param {MenuItem} menuItem
     */
    public onMenuItemClick (menuItem: MenuItem) {
        this.menus.forEach(function (menu) {
            menu.items.forEach(function (item) {
                item.selected = item.label === menuItem.label;
            });
        });
    }

    public onLocaleChanged(locale: string) {
        loadingIndicator.show();
        changeLocale(locale).then(loadingIndicator.hide, loadingIndicator.hide);
        setPreferredLocale(locale);
        this.saveExposedUserPreferences();
    }

    /**
     * @return {MenuItem}
     */
    public getCurrentAction = function (): MenuItem {
        return this.menus.map(function (menu) {
            return menu.items;
        }).reduce(function (p, c) {
            return p.concat(c);
        }, []).filter(function (item) {
            return item.selected;
        })[0];
    };

    /**
     * Save the account info
     */
    public saveAccountInfo () {
        if (!this.allowSave) {
            return;
        }
        this. allowSave = false;
        var userAction = new UserAction(UserAction.UPDATE_PASSWORD);
        userAdminService.updateCurrentUserPassword(this.currentPassword, this.password).then(
            (result) => {
                this.updatePasswordMessageString = this.strings.Successful_password_update;
                this.updatePasswordMessageReady = true;
                return result.data;
            },
            (response) => {
                var passwordIncorrect =
                    (response.status === blinkConstants.HTTP_STATUS_NOT_AUTHORIZED);
                if (passwordIncorrect) {
                    this.updatePasswordMessageString = this.strings.Unsuccessful_password_update;
                    this.updatePasswordMessageReady = true;
                } else {
                    alertService.showUserActionFailureAlert(userAction, response);
                }
                return $q.reject(response.data);
            }
        );
    }

    /**
     * Compare the two passwords to see if they're matching and if saving should be enabled
     */
    public comparePasswords() {
        var trimmedPassword = '';
        var trimmedCurrentPassword = '';
        if (!!this.password) {
            trimmedPassword = this.password.trim();
        }
        if (!!this.currentPassword) {
            trimmedCurrentPassword = this.currentPassword.trim();
        }

        this.updatePasswordMessageString = this.strings.Both_passwords_need;
        var passwordMatch = (this.password === this.confirmPassword);
        this.updatePasswordMessageReady = !passwordMatch;
        this.allowSave = this.password && passwordMatch && trimmedPassword.length > 0
            && this.currentPassword && trimmedCurrentPassword.length > 0;
    }

    /**
     * Save preferences that are exposed to the user. Note that these preferences are different
     * from the preferences that we save inside client state that are not exposed to the user
     * directly to change.
     */
    public saveExposedUserPreferences () {
        // TODO(Vijay): Use of indicator inside Save button
        let userAction = new UserAction(UserAction.UPDATE_EXPOSED_PREFERENCES);
        userAdminService.updateExposedUserPreferences(getExposedUserPreferences())
            .then(() => {
                alertService.showUserActionSuccessAlert(userAction);
            }, (error) => {
                alertService.showUserActionFailureAlert(userAction, error);
            });
    }

    public isSlackEnabled () {
        return slackService.isEnabled();
    }

    public linkSlackAccount () {
        var scopeString = 'identify' +
            '%20channels:history' +
            '%20channels:read' +
            '%20channels:write' +
            '%20chat:write:bot' +
            '%20dnd:read' +
            '%20dnd:write' +
            '%20emoji:read' +
            '%20files:read' +
            '%20files:write:user' +
            '%20groups:history' +
            '%20groups:read' +
            '%20groups:write' +
            '%20im:history' +
            '%20im:read' +
            '%20im:write' +
            '%20mpim:history' +
            '%20mpim:read' +
            '%20mpim:write' +
            '%20pins:read' +
            '%20pins:write' +
            '%20reactions:read' +
            '%20reactions:write' +
            '%20search:read' +
            '%20stars:read' +
            '%20stars:write' +
            '%20team:read' +
            '%20usergroups:read' +
            '%20usergroups:write' +
            '%20users:read' +
            '%20users:write';
        window.location.href = 'https://slack.com/oauth/authorize?' +
            'client_id=' + slackService.clientId +
            '&team=' + slackService.teamId +
            '&redirect_uri=' + encodeURIComponent(slackService.redirectURI) +
            '&scope=' + scopeString;
    }

    public hasLinkedSlackAccount () {
        return this.slackUserInfo && Object.keys(this.slackUserInfo).length;
    }

    public unlinkAccount () {
        slackService.unlink();
        this.slackUserInfo = slackService.getUserInfo();
    }

    public isA3Enabled() {
        return isA3Enabled();
    }
}
