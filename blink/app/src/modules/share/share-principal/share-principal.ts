/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Simple interface and utilities method for holding sharing/schedule informations
 *
 *
 */

import {Provide} from 'src/base/decorators';

export interface SharePrincipal {
    sharingType?: PrincipalType;
    permissionType?: string;
    id?: string;
    name?: string;
    displayName?: string;
    isGroup?: boolean;
}

export enum PrincipalType {
    GROUP = 1,
    USER = 2,
    EMAIL = 3
}

Provide('sharePrincipalService')({
    getSharePrincipal
});

export function getSharePrincipal(id, name, displayName, isGroup, sharingType?) {

    if (sharingType === void 0) {
        sharingType = isGroup ? PrincipalType.GROUP : PrincipalType.USER;
    }

    let sharePrincipal: SharePrincipal = {
        id: id,
        name: name,
        displayName: displayName,
        isGroup: isGroup,
        sharingType: sharingType
    };
    return sharePrincipal;
}
