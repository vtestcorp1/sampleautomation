/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Base class for scheduled job components.
 */

import IPromise = angular.IPromise;
import IQService = angular.IQService;

import {ngRequire} from 'src/base/decorators';
import {MetadataCache} from 'src/common/metadata-cache/metadata-cache-service';
import {PrincipalViewerComponent}
    from 'src/modules/share/share-principal/principal-viewer-component';
import {getSharePrincipal,PrincipalType, SharePrincipal}
    from 'src/modules/share/share-principal/share-principal';
import {BaseComponent} from '../../base/base-types/base-component';
import PrincipalsSelectorComponent from '../principal-selector/principal-selector';

let $q: IQService = ngRequire('$q');
let jsonConstants = ngRequire('jsonConstants');

let Logger = ngRequire('Logger');

export class BaseScheduledJobComponent extends BaseComponent {
    public principalsSelectorComponent: PrincipalsSelectorComponent;
    protected recipients: SharePrincipal[] = [];
    protected logger: any;
    private cache: MetadataCache = new MetadataCache();

    public constructor () {
        super();
        this.logger = Logger.create('base-scheduled-job-component');
    }

    protected onRecipientChangeCallback = (recipients: SharePrincipal[]) => {
        this.recipients = recipients;
    }

    protected initPropertiesFromJob(job) : IPromise<boolean> {
        if (!job) {
            return $q.when(false);
        }

        this.recipients = job.getEmails().map(email => {
            return {
                id: email,
                name: email,
                isGroup: false,
                sharingType: PrincipalType.EMAIL,
                viewer: new PrincipalViewerComponent(
                    email,
                    email,
                    email,
                    PrincipalType.EMAIL
                )
            };
        });

        return this.cache.getObjects([...job.getGroups(), ...job.getUsers()])
            .then((response) => {
                return [...response.users, ...response.groups]
                    .map(function(item: any) {
                        item = item._itemJson.header;
                        let sharing: SharePrincipal = getSharePrincipal(
                            item.id,
                            item.name,
                            item.displayName,
                            item.type !== jsonConstants.principalSubType.USER
                        );
                        return sharing;
                    });
            })
            .then((sharings) => {
                this.recipients = [...sharings, ...this.recipients];
                this.principalsSelectorComponent = new PrincipalsSelectorComponent(
                    this.recipients,
                    this.onRecipientChangeCallback
                );
                return true;
            });
    }
}
