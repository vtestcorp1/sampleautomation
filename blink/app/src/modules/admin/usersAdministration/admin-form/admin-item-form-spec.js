/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview  admin item form unit tests
 *
 */

'use strict';
describe('admin form', function () {

    beforeEach(module('blink.app'));

    var $rootScope, $compile, AdminItemFormController, elm, formConstants, formStrings, AdminItemFieldModel;

    var scope, ctrl;

    /* eslint camelcase: 1 */
    beforeEach(inject(function (_$rootScope_,
                                _$compile_,
                                _AdminItemFieldModel_,
                                _AdminItemFormController_,
                                _blinkConstants_,
                                _strings_) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        AdminItemFormController = _AdminItemFormController_;
        AdminItemFieldModel = _AdminItemFieldModel_;
        formStrings = _strings_.adminUI.formFields;
        formConstants = _blinkConstants_.adminUI.formFields;

        var template = '<admin-form bk-ctrl="ctrl"></admin-form>';
        elm = angular.element(template);
        scope = $rootScope.$new();
        ctrl = new AdminItemFormController({});
        ctrl.fields = [
            new AdminItemFieldModel(formConstants.fields.NAME,
                formConstants.fields.NAME,
                formConstants.type.PLAIN,
                formConstants.inputType.TEXT,
                'FIELD',
                null,
                true,
                true)
        ];
        scope.ctrl = ctrl;
        $compile(elm)(scope);
        scope.$digest();
    }));

    it('have the correct number of fields', function () {
        expect(elm.find('.label').length).toBe(1);
        expect(elm.find('input').length).toBe(1);
    });

    it('should honor the required flag', function() {
        expect(elm.find('.bk-asterisk').length).toBe(1);
        ctrl.fields = [
            new AdminItemFieldModel(formConstants.fields.NAME,
                formConstants.fields.NAME,
                formConstants.type.PLAIN,
                formConstants.inputType.TEXT,
                'FIELD',
                null,
                false,
                false)
        ];
        scope.$digest();
        expect(elm.find('.bk-asterisk').length).toBe(0);
        expect(elm.find('.label').text().trim()).toBe('FIELD');
    });

    it('should have correct name attribute', function(){
        expect(elm.find('input').attr('name')).toBe('name');
        ctrl.fields = [
            new AdminItemFieldModel(formConstants.fields.NAME,
                'test',
                formConstants.type.PLAIN,
                formConstants.inputType.TEXT,
                'FIELD',
                null,
                true,
                true)
        ];
        scope.$digest();
        expect(elm.find('input').attr('name')).toBe('test');
    });
});
