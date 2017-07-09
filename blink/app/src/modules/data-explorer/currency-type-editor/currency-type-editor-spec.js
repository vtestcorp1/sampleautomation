/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview  Currency type editor unit tests.
 *
 */

'use strict';

describe('currency type info editor spec', function () {
    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());
    var constants, blinkStrings, $rootScope, $compile, jsonConstants,
        CurrencyTypeInfo, CurrencyTypeEditorController;

    /* eslint camelcase: 1 */
    beforeEach(inject(function (
        _blinkConstants_,
        _strings_,
        _$rootScope_,
        _$compile_,
        _CurrencyTypeEditorController_,
        _CurrencyTypeInfo_,
        _jsonConstants_) {
        constants = _blinkConstants_;
        blinkStrings = _strings_;
        /* eslint camelcase: 1 */
        $rootScope = _$rootScope_;
        /* eslint camelcase: 1 */
        $compile = _$compile_;
        /* eslint camelcase: 1 */
        CurrencyTypeEditorController = _CurrencyTypeEditorController_;
        CurrencyTypeInfo = _CurrencyTypeInfo_;
        jsonConstants = _jsonConstants_;
    }));

    it('It should have 4 options', function () {
        var ret = renderEditor(null /* currencyTypeInfo */);
        var elem = ret[0];
        expect(elem.find('.bk-form-radio').length).toBe(4);
    });

    it('should select right setting and allow switching to another one', function () {
        var labels = blinkStrings.metadataExplorer.currencyEditor;
        var settings = jsonConstants.currencyTypes;

        var arr = [
            {currencyTypeInfo: null, label: labels.NONE},
            {currencyTypeInfo: {setting: settings.FROM_USER_LOCALE}, label: labels.FROM_BROWSER},
            {currencyTypeInfo: {setting: settings.FROM_COLUMN, columnGuid: '456'}, label: labels.FROM_COLUMN},
            {currencyTypeInfo: {setting: settings.FROM_ISO_CODE, isoCode: 'INR'}, label: labels.FROM_ISO_CODE}
        ];
        arr.forEach(function (config, index) {
            var currencyTypeInfo = new CurrencyTypeInfo(config.currencyTypeInfo);
            var ret = renderEditor(currencyTypeInfo);
            var elem = ret[0];
            // expect that right setting was selected based on initial data given.
            expect(elem.find('.bk-selected .bk-radio-label').text().trim()).toBe(config.label);
            // Now click on the next option.
            elem.find('.bk-form-radio')[(index + 1) % 4].click();
            // Now check that selected radio button should have updated.
            expect(elem.find('.bk-selected .bk-radio-label').text().trim())
                .toBe(arr[(index + 1) % 4].label);
        });
    });

    it('should disable column selector if column setting is not selected', function () {
        var ret = renderEditor(null /* currencyTypeInfo */);
        var ctrl = ret[1];
        expect(ctrl.columnSelectCtrl.getIsDisabled()).toBe(true);
    });

    it('should enable column selector if column setting is selected', function () {
        var currencyTypeInfo = new CurrencyTypeInfo({
            setting: jsonConstants.currencyTypes.FROM_COLUMN,
            columnGuid: "456"
        });
        var ret = renderEditor(currencyTypeInfo);
        var ctrl = ret[1];
        expect(ctrl.columnSelectCtrl.getIsDisabled()).toBe(false);
    });

    it("should fallback to 'None' setting if currency data is invalid", function () {
        var currencyTypeInfo = new CurrencyTypeInfo({
            setting: jsonConstants.currencyTypes.FROM_COLUMN,
            columnGuid: 'SomeInvalidGuid'
        });
        var ret = renderEditor(currencyTypeInfo);
        var elem = ret[0];
        expect(elem.find('.bk-selected .bk-radio-label').text().trim()).toBe(
            blinkStrings.metadataExplorer.currencyEditor.NONE
        );
    });

    function renderEditor(currencyTypeInfo) {
        var elem =
            angular.element('<bk-currency-type-editor bk-ctrl="ctrl"></bk-currency-type-editor>');
        var scope = $rootScope.$new();
        var logicalColumns = [
            {
                getGuid: function () {
                    return "123";
                },
                getName: function() {
                    return 'Col 123';
                }
            },
            {
                getGuid: function() {
                    return '456';
                },
                getName: function() {
                    return 'Col 456';
                }
            }
        ];
        scope.ctrl = new CurrencyTypeEditorController(logicalColumns, currencyTypeInfo, null);
        elem = $compile(elem)(scope);
        scope.$digest();
        return [elem, scope.ctrl];
    }
});
