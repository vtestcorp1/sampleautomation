/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview A collection of common objects used for unit testing.
 */

'use strict';

blink.app.factory('mocks', [function () {
    function getVisualizationColumn(id, name, params) {
        var visualizationColumn = {
            sageOutputColumnId: id,
            baseColumnName: name,
            effectiveType: 'ATTRIBUTE',
            effectiveAggrType: 'NONE',
            effectiveDataType: 'VARCHAR'
        };
        return Object.merge(visualizationColumn, params || {});
    }

    return {
        getVisualizationColumn : getVisualizationColumn
    };
}]);
