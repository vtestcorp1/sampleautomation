/**
 *
 * @author francois.chabbey
 * @fileoverview A LRU cache for metadata-items
 *
 * This services maintains an array of caches for different metadata items
 *
 *
 *
 */
'use strict';

import _ from 'lodash';
import {ngRequire, Provide} from 'src/base/decorators';
import {BlinkCache} from './blink-cache';
import IPromise = angular.IPromise;
import {onUserLoggedOut} from '../../modules/callosum/service/session-service';

let $q = ngRequire('$q');

let UserModel = ngRequire('UserModel');
let GroupModel = ngRequire('GroupModel');
let metadataService = ngRequire('metadataService');
let jsonConstants = ngRequire('jsonConstants');
let Logger = ngRequire('Logger');


let LOCAL_GROUP = 'LOCAL_GROUP';
let LOCAL_USER = 'LOCAL_USER';


export const enum CachedEntityType {
    USER = 0,
    GROUP = 1,
}

interface Response {
    users: Array<any>;
    groups: Array<any>;
}

@Provide('MetadataCacheService')
export class MetadataCache {

    // for javascript file
    public static readonly entityType = {
        USER: CachedEntityType.USER,
        GROUP: CachedEntityType.GROUP
    };
    private static singletonInstance: MetadataCache;
    private logger: any;
    private caches: BlinkCache<any>[];
    private pendingRequests: { [id: string] : IPromise<any> } = {};
    private unknownIds: {[id: string]: boolean} = {};

    constructor() {
        if (!MetadataCache.singletonInstance) {
            MetadataCache.singletonInstance = this;
            this.init();

        }
        return MetadataCache.singletonInstance;
    }

    public reset(): void {
        this.pendingRequests = {};
        this.unknownIds = {};
        this.caches.forEach(function(cache) {
            cache.reset();
        });
    }

    public getObject(id: string, type?: CachedEntityType):IPromise<Array<any>> {
        return this.getObjects([id], type);
    }

    public getObjects(ids: string[], type?: CachedEntityType): IPromise<any> {
        let response = {
            users: [],
            groups: []
        };

        let unCachedValues = [];
        ids.forEach((id) => {
            let cachedValue = this.getCachedObject(id, type);
            if (cachedValue) {
                let respObj = cachedValue.isGroup()
                    ? response.groups
                    : response.users;
                respObj.push(cachedValue);
            } else if (this.unknownIds[id]) {
                this.logger.warn('Unknown id metadata requested', id);
            } else {
                unCachedValues.push(id);
            }
        });

        let idsToRequest = [];
        let updateResponseFromPendingRequests = [];
        unCachedValues.forEach((id) => {
            if (this.pendingRequests[id]) {
                let promise = this.pendingRequests[id].then((principals) => {
                    let principal = principals[id];
                    // Note: In case of inconsistent principal ids we can run into the
                    // case where we don't get a principal back for that id.
                    if (!!principal) {
                        let respObj = principal.isGroup()
                            ? response.groups
                            : response.users;
                        respObj.push(principal);
                    }
                });
                updateResponseFromPendingRequests.push(promise);
            } else {
                idsToRequest.push(id);
            }
        });

        let updatePrincipalsFromServerPromise = getObjectRequestPromise(
            idsToRequest,
            this.logger,
            type
        ).then((principals) => {
            idsToRequest.forEach((id) => {
                let principal = principals[id];
                if (principal) {
                    if (principal.isGroup()) {
                        this.caches[CachedEntityType.GROUP].setItem(id, principal);
                        response.groups.push(principal);
                    } else {
                        this.caches[CachedEntityType.USER].setItem(id, principal);
                        response.users.push(principal);
                    }
                } else {
                    this.unknownIds[id] = true;
                }

                delete this.pendingRequests[id];
            });

            return principals;
        });

        idsToRequest.forEach((id) => {
            this.pendingRequests[id] = updatePrincipalsFromServerPromise;
        });

        updateResponseFromPendingRequests.push(
            updatePrincipalsFromServerPromise
        );

        return $q.all(updateResponseFromPendingRequests).then(() => {
            return response;
        });
    }

    // Note(chab) we expose keys for testing purpose
    public getPendingRequestKeys(): string[] {
        return Object.keys(this.pendingRequests);
    }

    private init() {
        this.logger = Logger.create('Metadata-cache');
        this.caches = [
            new BlinkCache<any>(),
            new BlinkCache<any>()
        ];

        onUserLoggedOut.subscribe(() => {
            MetadataCache.singletonInstance.reset();
        });
    }

    private getCachedObject(id: string, cacheEntityType?: CachedEntityType): any {
        if (_.isNil(cacheEntityType)) {
            return this.caches[CachedEntityType.GROUP].getItem(id)
                || this.caches[CachedEntityType.USER].getItem(id);
        }
        return this.caches[cacheEntityType].getItem(id);
    }
}

// Resolves promise with a object, key id and value principal.
function getObjectRequestPromise(
    ids: string[],
    logger,
    type?: CachedEntityType
) : IPromise<{[id: string] : any}> {
    if (!ids || ids.length <= 0) {
        return $q.when([]);
    }

    let requestParams = {
        batchSize: ids.length,
        fetchIds: ids,
    };

    let isTypeUnknown = type === void 0;
    let shouldQueryUsers = type === CachedEntityType.USER || isTypeUnknown;
    let userRequestPromise = shouldQueryUsers ?
        metadataService.getMetadataList(
            jsonConstants.metadataType.USER,
            requestParams
        ).then((resp) => {
            return getObjects(resp, logger);
        }) :
        $q.when([]);

    let shouldQueryGroups = type === CachedEntityType.GROUP || isTypeUnknown;
    let groupRequestPromise = shouldQueryGroups ?
        metadataService.getMetadataList(
            jsonConstants.metadataType.GROUP,
            requestParams
        ).then((resp) => {
            return getObjects(resp, logger);
        }) :
        $q.when([]);

    return $q.all([userRequestPromise, groupRequestPromise]).then(
        (responses) => {
            let userResponse = responses[CachedEntityType.USER];
            let groupResponse = responses[CachedEntityType.GROUP];
            let response = {};
            userResponse.forEach((user) => {
                response[user.getId()] = user;
            });
            groupResponse.forEach((group) => {
                response[group.getId()] = group;
            });
            return response;
        }
    );
}

function getObjects(metadataResponse, logger) {
    return metadataResponse.data.headers.map((json) => {
        return getPrincipal(json, logger);
    });
}

function getPrincipal(jsonObject: any, logger) {
    let principal = null;
    switch (jsonObject.type) {
        case LOCAL_USER: {
            principal = UserModel.fromHeaderJson(jsonObject);
            break;
        }
        case LOCAL_GROUP: {
            principal = GroupModel.fromHeaderJson(jsonObject);
            break;
        }
        default: {
            logger.error(
                'Cache does not know how to handle the following type',
                jsonObject.type
            );
            break;
        }
    }
    return principal;
}
