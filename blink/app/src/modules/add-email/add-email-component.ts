/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview  Component for adding an email
 */

import _ from 'lodash';
import {BaseComponent} from '../../base/base-types/base-component';
import {Component} from '../../base/decorators';
import {getSharePrincipal,PrincipalType, SharePrincipal}
    from '../share/share-principal/share-principal';


@Component({
    name: 'bkAddEmail',
    templateUrl: 'src/modules/add-email/add-email.html'
})
export class AddEmailComponent extends BaseComponent {

    public emails: string;
    private domainsPattern: RegExp;

    public constructor(
        private emailAddedHandler: (principals :SharePrincipal[]) => void,
        whiteListOfDomains: string[]
    ) {
        super();
        this.domainsPattern = this.buildEmailRegex(whiteListOfDomains);
    }
    public addClicked() {
        //TODO(chab) enforce the handler to return IPromise and handle errors
        let emailsArray = _.uniq(
            this.emails.split(',').map(email => email.trim())
        );
        let selectedObjects = emailsArray.map(this.getSharingFromObject, this);
        this.emailAddedHandler(selectedObjects);
        this.emails = '';
    }
    public isAddEmailDisabled(): boolean {
        let emails = this.emails;
        return !emails|| !this.areEmailsValid(emails);
    }
    public areEmailsValid(emails): boolean {
        if (!emails|| emails.length === 0) {
            return false;
        }
        let emailsArray: string[] = emails.split(',');
        let hasInvalidEmail = _.some(emailsArray, (email: string) => {
            return !this.domainsPattern.test(email);
        });
        return !hasInvalidEmail;
    }
    public buildEmailRegex(domains: string[]): RegExp|null {
        if (!domains || domains.length === 0) {
            return null;
        }
        let regexpContent = '';
        domains.forEach((domain, index) => {
            domain = '(' + domain + ')';
            domain = domain + '{1}';

            if (index < domains.length - 1) {
                domain = domain + '|';
            }
            regexpContent = regexpContent + domain;
        });
        let regexp = new RegExp(regexpContent);
        return regexp;
    }

    private getSharingFromObject(email: string): SharePrincipal {

        // Note(chab) In the case of an email schedule/share, name, displayName, and id
        // take the same value
        return getSharePrincipal(
            email,
            email,
            email,
            false,
            PrincipalType.EMAIL
        );
    }
}
