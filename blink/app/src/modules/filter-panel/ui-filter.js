/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com),
 * Vibhor Nanavati (vibhor@thoughtspot.com),
 * Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Class representing UI state of a filter in filter panel.
 */

'use strict';

// TODO(Jasmeet): Evaluate in the new design if active state is even a construct we need to
// retain. Otherwise remove this class altogether.
blink.app.factory('UIFilter', [function () {
    function UIFilter(filterModel, isActive) {
        this._filterModel = filterModel;
        this._isActive = isActive;
    }

    UIFilter.prototype.updateFilter = function (filterModel, isActive) {
        this._filterModel = filterModel;
        this._isActive = isActive;
    };

    UIFilter.prototype.isActive = function () {
        return this._isActive || false;
    };

    UIFilter.prototype.getFilterModel = function () {
        return this._filterModel;
    };

    UIFilter.prototype.setFilterModel = function (filterModel) {
        this._filterModel = filterModel;
    };

    UIFilter.prototype.setIsActive = function (isActive) {
        this._isActive = isActive;
    };

    UIFilter.prototype.shouldDisplay = function () {
        return this._filterModel.shouldDisplay();
    };

    return UIFilter;
}]);
