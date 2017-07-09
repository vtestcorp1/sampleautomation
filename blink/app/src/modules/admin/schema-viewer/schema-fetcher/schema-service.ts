/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Service that returns the current schema as a hierarchy of typed objects
 *
 *
 */

'use strict';

import IPromise = angular.IPromise;
import {ngRequire, Provide} from 'src/base/decorators';
import {jsonConstants} from  'src/modules/viz-layout/answer/json-constants';
import {BKSchema} from './schema-model';

let $q = ngRequire('$q');
let alertService = ngRequire('alertService');
let metadataService = ngRequire('metadataService');
let UserAction = ngRequire('UserAction');

export let options = {
    SYSTEM_TABLE: {
        value: 1,
        filter: jsonConstants.metadataType.subType.SYSTEM_TABLE
    },
    IMPORTED_DATA: {
        value: 2,
        filter: jsonConstants.metadataType.subType.IMPORTED_DATA
    },
    WORKSHEET: {
        value: 4,
        filter: jsonConstants.metadataType.subType.WORKSHEET
    },
    PRIVATE_WKS_FLAG: {
        value: 8,
        filter: jsonConstants.metadataType.subType.PRIVATE_WORKSHEET
    },
    AGGR_WKS_FLAG: {
        value: 16,
        filter: jsonConstants.metadataType.subType.AGGR_WORKSHEET
    }
};

function computeFilter(filterMask: number): string[] {
    /* eslint no-bitwise: 1 */
    let filters = [];

    for(let key in options) {
        let option = options[key];
        if (option.value & filterMask) {
            filters.push(option.filter);
        }
    }
    return filters;
}

// TODO(chab) remove filtering when this will be implemented on callosum side
/**
 * Ask callosum for the schema
 *
 * @param {number} filterMask - A bit mask that indicates which elements should be fetched
 * @returns {Promise}
 */
export function getSchema(filterMask: number): IPromise<BKSchema> {
    let userAction = new UserAction(UserAction.FETCH_SCHEMA);
    return metadataService.getSchema().then((tablesJson) => {
        // avoid filtering if we use all options
        if (filterMask !== 31 ) {
            let filters = computeFilter(filterMask);
            tablesJson = tablesJson.filter((table) => {
                return filters.indexOf(table.type) > -1;
            });
        }
        return new BKSchema(tablesJson);
    }, function(response){
        alertService.showUserActionFailureAlert(userAction, response);
        return $q.reject(response);
    });
}


Provide('schemaService')({
    getSchema: getSchema,
    options: options
});
