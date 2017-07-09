/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Utility function to show conditional formatting dialog.
 */

import {ngRequire, Provide} from '../../base/decorators';
import {ColumnMetricsComponent} from '../../common/widgets/column-metrics/column-metrics';
import * as dialog from '../../common/widgets/dialog/dialog-service';

let $q = ngRequire('$q');

type ColumnMetricDefinition = any;

/**
 * Will show a conditional formatting dialog, and return a promise. Promise will remain pending
 * until viewer closes the the dialog either by clicking Done or cancel/dismiss button. The promise
 * will then get resolved/rejected respectively. Resolved promise will pass result in the
 * callback parameter.
 * @param columnMetricsComponent
 */
export function show(
    columnMetricsComponent: ColumnMetricsComponent
): angular.IPromise<{
    hasChanges: boolean,
    newDefinition: ColumnMetricDefinition
}> {
    let isEditable = columnMetricsComponent.isEditable;
    let defer = $q.defer();
    dialog.show({
        cancelBtnLabel: isEditable ? 'Cancel' : 'OK',
        title: 'Conditional Formatting',
        skipConfirmBtn: true,
        confirmAsyncBtnLabel: 'Done',
        onConfirmAsync: isEditable && function() {
            return columnMetricsComponent.commitChanges().then(function (result) {
                defer.resolve(result);
            });
        },
        onCancel: () => {
            defer.reject();
            return true;
        },
        onDismiss: () => {
            defer.reject();
            return true;
        },
        customData: {
            columnMetricsComponent: columnMetricsComponent
        },
        customBodyUrl: 'src/modules/conditional-formatting/conditional-formatting.html'
    });

    return defer.promise;
}

Provide('conditionalFormattingDialog')({
    show
});
