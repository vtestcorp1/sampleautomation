/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Model for currency type info of a logical column.
 */

'use strict';

blink.app.factory('CurrencyTypeInfo', ['jsonConstants',
    'Logger',
    function (
    jsonConstants,
    Logger) {

        var _logger = Logger.create('currency-type-info');

        var CurrencyTypeInfo = function (json) {
            if (!json) {
                return;
            }
            this._settingType = json.setting;
            this._columnGuid = json.columnGuid;
            this._isoCode = json.isoCode;
            this.clean();
        };

        CurrencyTypeInfo.prototype.getSettingType = function () {
            return this._settingType;
        };

        CurrencyTypeInfo.prototype.getColumnGuid = function () {
            return this._columnGuid;
        };

        CurrencyTypeInfo.prototype.getIsoCode = function () {
            return this._isoCode;
        };

        CurrencyTypeInfo.prototype.setCurrencyTypeSetting = function (settingType, value) {
            this._settingType = settingType;
            if (this._settingType === jsonConstants.currencyTypes.FROM_COLUMN) {
                this._columnGuid = value;
            } else if (this._settingType === jsonConstants.currencyTypes.FROM_ISO_CODE) {
                this._isoCode = value;
            }
            this.clean();
        };

        CurrencyTypeInfo.prototype.setColumn = function (column) {
            if (this._settingType === jsonConstants.currencyTypes.FROM_COLUMN) {
                this._columnGuid = column.getGuid();
            } else {
                _logger.warn("Updating selected column without setting type set to FROM_COLUMN");
            }
        };

        CurrencyTypeInfo.prototype.setIsoCode = function (isoCode) {
            if (this._settingType == jsonConstants.currencyTypes.FROM_ISO_CODE) {
                this._isoCode = isoCode;
            } else {
                _logger.warn("Updating ISO code without setting type set to FROM_ISO_CODE");
            }
        };

    /**
     * Delete unnecessary fields, otherwise next time user will open dialog, they will be there
     */
        CurrencyTypeInfo.prototype.clean = function() {
            var columnGuid = this._columnGuid;
            var isoCode = this._isoCode;
            this._columnGuid = this._isoCode = null;
            if (this._settingType === jsonConstants.currencyTypes.FROM_COLUMN) {
                this._columnGuid = columnGuid;
            } else if (this._settingType === jsonConstants.currencyTypes.FROM_ISO_CODE) {
                this._isoCode = isoCode;
            }
        };

        CurrencyTypeInfo.prototype.toJson = function() {
            if (!this._settingType) {
                return null;
            }
            var json = {setting: this._settingType};
            if (this._columnGuid) {
                json.columnGuid = this._columnGuid;
            }
            if (this._isoCode) {
                json.isoCode = this._isoCode;
            }
            return json;
        };

        return CurrencyTypeInfo;
    }]);

