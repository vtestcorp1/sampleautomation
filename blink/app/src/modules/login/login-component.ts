/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Login component.
 */

declare var addBooleanFlag;
declare var flags;

import {BaseComponent} from '../../base/base-types/base-component';
import {blinkConstants} from '../../base/blink-constants';
import {Component, ngRequire} from '../../base/decorators';
import {events} from '../../base/events/events';
import {wasManuallyLoggedOut} from '../../base/user/session';
import {doLogin} from '../callosum/service/session-service';
import {autoRedirectToSamlLogin, isSamlEnabled} from '../callosum/service/system-config-service';

let $rootScope = ngRequire('$rootScope');
let eventTracker = ngRequire('eventTracker');
let navService = ngRequire('navService');
let perfEvents = ngRequire('perfEvents');
let util = ngRequire('util');

addBooleanFlag(
    'disableSAMLAutoRedirect',
    'Override the system configuration to auto redirect to SAML login',
    false
);

@Component({
    name: 'bkLogin',
    templateUrl: 'src/modules/login/login.html'
})
export class LoginComponent extends BaseComponent {
    public loginFailed: boolean = false;
    public rememberMe: boolean = true;
    public samlEnabled: boolean = false;
    public user: string;
    public password: string;
    public userNameIsValid: boolean = false;
    public passwordIsValid: boolean = false;
    public isVerifying: boolean = false;
    public invalidCreds: boolean = false;
    public disableLogin: boolean = false;

    constructor() {
        super();

        this.samlEnabled = isSamlEnabled();
        this.navigateToSamlLoginInNeeded();
        this.user = '';
    }

    public navigateToSamlLoginInNeeded() {
        if (this.samlEnabled
            && autoRedirectToSamlLogin()
            && !wasManuallyLoggedOut()
            && !flags.getValue('disableSAMLAutoRedirect')
        ) {
            navService.goToSamlLogin();
        }
    }

    public samlLogin(last401Path) {
        navService.goToSamlLogin(last401Path);
    }

    public onUserNameChange() {
        if (util.isEmptyOrOnlySpaces(this.user)) {
            this.userNameIsValid = false;
        } else {
            this.userNameIsValid = true;
        }
        this.disableLogin = !this.areCredentialsValid();
    }

    public onPasswordChange() {
        if (util.isEmptyOrOnlySpaces(this.password)) {
            this.passwordIsValid = false;
        } else {
            this.passwordIsValid = true;
        }
        this.disableLogin = !this.areCredentialsValid();
    }

    public isLoginButtonDisabled() : boolean {
        return this.disableLogin;
    }

    public submitLogin () {
        if (!this.areCredentialsValid()) {
            return;
        }

        this.loginFailed = false;
        this.isVerifying = true;

        // Login ends when homepage is loaded.
        let tracker = eventTracker.trackEvent(perfEvents.LOGIN, { })
            .waitFor($rootScope, events.HOME_PAGE_LOADED_U)
            .finish();

        doLogin(
            this.user,
            this.password,
            this.rememberMe
        ).then(
            (response) => {
                let last401Path = response.data;
                this.isVerifying = false;
                if (last401Path) {
                    navService.goToPath(last401Path);
                    tracker.cancel();
                } else {
                    navService.goToHome();
                }
                this.loginFailed = false;
            },
            (response) => {
                // Callosum responding with 401 is the only invalid username password case.
                // Otherwise we had trouble connecting to the server.
                tracker.cancel();
                this.invalidCreds = (response.status === blinkConstants.HTTP_STATUS_NOT_LOGGED_IN);
                this.isVerifying = false;
                this.loginFailed = true;
                this.password = '';
            });
    }

    private areCredentialsValid() : boolean {
        return this.userNameIsValid && this.passwordIsValid;
    }
}
