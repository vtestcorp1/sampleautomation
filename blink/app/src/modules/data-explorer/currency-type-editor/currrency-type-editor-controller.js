/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Controller for editing currency type info of a logical column.
 */

'use strict';

blink.app.factory('CurrencyTypeEditorController', ['$q',
    'alertService',
    'blinkConstants',
    'strings',
    'CurrencyTypeInfo',
    'currencyUtil',
    'jsonConstants',
    'RadioButtonComponent',
    'SelectComponent',
    function($q,
             alertService,
             blinkConstants,
             strings,
             CurrencyTypeInfo,
             currencyUtil,
             jsonConstants,
             RadioButtonComponent,
             SelectComponent) {

        function CurrencyTypeEditorController(logicalColumns, currencyTypeInfo, onCurrencyTypeChange) {
            this.strings = strings.metadataExplorer.currencyEditor;
            var currencyTypes = jsonConstants.currencyTypes;
            var currencyInfoJson = null;
            if (currencyTypeInfo &&
                currencyUtil.isValidCurrencyTypeInfo(currencyTypeInfo, logicalColumns)) {
                currencyInfoJson = currencyTypeInfo.toJson();
            }
            this.currencyTypeInfo = currencyTypeInfo = new CurrencyTypeInfo(currencyInfoJson);
            this.onCurrencyTypeChange = onCurrencyTypeChange;
            this.columnsMap = _.reduce(logicalColumns, function(obj, col) {
                obj[col.getGuid()] = col;
                return obj;
            }, {});

            function isSelectNone() {
                return !currencyTypeInfo.getSettingType();
            }

            function isFromUserLocale() {
                return currencyTypeInfo.getSettingType() === currencyTypes.FROM_USER_LOCALE;
            }

            function isFromColumn() {
                return currencyTypeInfo.getSettingType() === currencyTypes.FROM_COLUMN;
            }

            function isFromIsoCode() {
                return currencyTypeInfo.getSettingType() === currencyTypes.FROM_ISO_CODE;
            }

            this.handleSettingChange = function (newCurrencyType) {
                currencyTypeInfo.setCurrencyTypeSetting(newCurrencyType);
                var isFromColumn = newCurrencyType === currencyTypes.FROM_COLUMN,
                    isFromIsoCode = newCurrencyType === currencyTypes.FROM_ISO_CODE;
                if (isFromColumn) {
                    var selectedColGuid = this.columnSelectCtrl.getSelectedID();
                    if (selectedColGuid) {
                        currencyTypeInfo.setColumn(this.columnsMap[selectedColGuid]);
                    }
                }
                if (isFromIsoCode) {
                    currencyTypeInfo.setIsoCode(this.isoCodeSelectCtrl.getSelectedID());
                }
                this.columnSelectCtrl.setIsDisabled(!isFromColumn);
                this.isoCodeSelectCtrl.setIsDisabled(!isFromIsoCode);
                onCurrencyTypeChange(currencyTypeInfo);
            };

            this.noneRadioController = new RadioButtonComponent(
                this.strings.NONE,
                isSelectNone.bind(this),
                this.handleSettingChange.bind(this, null)
            );
            this.localeRadioController = new RadioButtonComponent(
                this.strings.FROM_BROWSER,
                isFromUserLocale.bind(this),
                this.handleSettingChange.bind(this, currencyTypes.FROM_USER_LOCALE)
            );
            this.columnRadioController = new RadioButtonComponent(
                this.strings.FROM_COLUMN,
                isFromColumn.bind(this),
                this.handleSettingChange.bind(this, currencyTypes.FROM_COLUMN)
            );
            this.isoCodeRadioController = new RadioButtonComponent(
                this.strings.FROM_ISO_CODE,
                isFromIsoCode.bind(this),
                this.handleSettingChange.bind(this, currencyTypes.FROM_ISO_CODE)
            );

            this.columnSelectCtrl = new SelectComponent({
                placeholder: this.strings.SELECT_COLUMN,
                options: logicalColumns.map(function (column) {
                    return {
                        id: column.getGuid(),
                        caption: column.getName()
                    };
                }),
                isDisabled: !isFromColumn(),
                onSelectionChanged: function (newColumnOption) {
                    currencyTypeInfo.setColumn(this.columnsMap[newColumnOption.id]);
                    this.onCurrencyTypeChange(this.currencyTypeInfo);
                }.bind(this),
                customCssClass: 'bk-select-currency-column',
                onDropdownToggled: function(isOpen) {
                    if (isOpen) {
                        // This is to prevent the click action to reach the slick grid table, as it will
                        // prematurely commit the edit thinking that editor has blurred.
                        $('body .bk-select-currency-column').on('mousedown.currencyColumn', function ($evt) {
                            $evt.stopPropagation();
                        });
                    } else {
                        $('body .bk-select-currency-column').off('mousedown.currencyColumn');
                    }
                }
            });

            this.isoCodeSelectCtrl = new SelectComponent({
                placeholder: this.strings.SELECT_ISO_CODE,
                options: icu4js.getSupportedCurrencyISOCodes().map(function(code) {
                    return {
                        id: code,
                        caption: code
                    };
                }),
                isDisabled: !isFromIsoCode(),
                onSelectionChanged: function (newIsoCodeOption) {
                    currencyTypeInfo.setIsoCode(newIsoCodeOption.id);
                    this.onCurrencyTypeChange(this.currencyTypeInfo);
                }.bind(this),
                customCssClass: 'bk-select-currency-iso-code',
                onDropdownToggled: function(isOpen) {
                    if (isOpen) {
                        // This is to prevent the click action to reach the slick grid table, as it will
                        // prematurely commit the edit thinking that editor has blurred.
                        $('body .bk-select-currency-iso-code').on('mousedown.currencyIsoCode', function ($evt) {
                            $evt.stopPropagation();
                        });
                    } else {
                        $('body .bk-select-currency-iso-code').off('mousedown.currencyIsoCode');
                    }
                }
            });
        }

        CurrencyTypeEditorController.prototype.includeFromColumnRadioOption = function() {
            return Object.keys(this.columnsMap).length > 0;
        };

        CurrencyTypeEditorController.prototype.isCurrentSelectionValid = function() {
            return currencyUtil.isValidCurrencyTypeInfo(
                this.currencyTypeInfo,
                Object.values(this.columnsMap)
            );
        };

        return CurrencyTypeEditorController;
    }]);
