/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Utility function to show filter dialog.
 */

import {ngRequire, Provide} from '../../base/decorators';
import * as dialog from '../../common/widgets/dialog/dialog-service';

let $q = ngRequire('$q');

type FilterController = any;

/**
 * Will show a filter dialog, and return a promise. Promise will remain pending until viewer
 * close the the dialog either by clicking Done or cancel/dismiss button. The promise will then
 * get resolved/rejected respectively. Resolved promise will pass queryTransformations in the
 * callback parameter.
 * @param filterController
 */
export function show(filterController: FilterController): angular.IPromise<any[]> {
    let defer = $q.defer();
    dialog.show({
        title: filterController.filterModel.getColumn().getName(),
        customCssClass: 'bk-filter-panel-popover',
        skipConfirmBtn: true,
        confirmAsyncBtnLabel: 'Done',
        cancelBtnLabel: filterController.isReadOnly ? 'OK' : 'Cancel',
        onConfirmAsync: !filterController.isReadOnly && function () {
            return filterController.getQueryTransformationOnDone()
                .then((queryTransformations) => {
                    defer.resolve(queryTransformations);
                });
        },
        onCancel: function () {
            defer.reject();
            return true;
        },
        onDismiss: function () {
            defer.reject();
            return true;
        },
        customData: {
            filterController: filterController
        },
        customBodyUrl: 'src/modules/filter-panel/filter-dialog.html'
    });

    return defer.promise;
}

Provide('filterDialog')({
    show
});
