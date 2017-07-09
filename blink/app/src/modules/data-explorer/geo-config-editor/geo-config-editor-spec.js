/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview  Geo config editor dialog unit tests.
 *
 */

'use strict';

describe('geo config editor', function() {

    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());
    var blinkStrings, $rootScope, $compile, jsonConstants, GeoConfigEditorComponent, GeoConfig,
        originalFlagGetValue;

    /* eslint camelcase: 1 */
    beforeEach(inject(function(_blinkConstants_,
                               _strings_,
                               _$rootScope_,
                               _$compile_,
                               _GeoConfigEditorComponent_,
                               _GeoConfig_,
                               _jsonConstants_) {
        blinkStrings = _strings_;
        /* eslint camelcase: 1 */
        $rootScope = _$rootScope_;
        /* eslint camelcase: 1 */
        $compile = _$compile_;
        /* eslint camelcase: 1 */
        GeoConfigEditorComponent = _GeoConfigEditorComponent_;
        GeoConfig = _GeoConfig_;
        jsonConstants = _jsonConstants_;

        originalFlagGetValue = flags.getValue;
        flags.getValue = jasmine.createSpy().and.returnValue(true);
    }));

    afterEach(function() {
        flags.getValue = originalFlagGetValue;
    });

    it('It should have the right number of options', function() {
        var elem = renderEditor(null /* geoConfig */);
        expect(elem.find('.bk-top-level-radio').length).toBe(6);
        expect(elem.find('.bk-sub-nation-radio').length).toBe(0);

        var geoConfigWithState = {
            type: jsonConstants.geoConfigType.ADMIN_DIV_2,
            parent: {
                type: jsonConstants.geoConfigType.ADMIN_DIV_0,
                fixedValue: 'US'
            }
        };

        // With sub-nation type selected it should have 3 sub-options.
        elem = renderEditor(geoConfigWithState /* geoConfig */);
        expect(elem.find('.bk-top-level-radio').length).toBe(6);
        expect(elem.find('.bk-sub-nation-radio').length).toBe(3);
    });

    it('should select right type and allow switching to another one', function() {
        var labels = blinkStrings.metadataExplorer.geoConfigEditor;
        var geoTypes = jsonConstants.geoConfigType;

        var arr = [
            {geoConfig: null, labelTop: labels.NONE},
            {geoConfig: {type: geoTypes.LATITUDE}, labelTop: labels.LATITUDE},
            {geoConfig: {type: geoTypes.LONGITUDE}, labelTop: labels.LONGITUDE},
            {geoConfig: {type: geoTypes.ADMIN_DIV_0}, labelTop: labels.COUNTRY},
            {
                geoConfig: {
                    type: geoTypes.ADMIN_DIV_1,
                    parent: {type: geoTypes.ADMIN_DIV_0, fixedValue: 'US'}
                },
                labelTop: labels.SUB_NATION,
                labelDown: labels.SUB_DIVISION_NAME.STATE,
            },
            {
                geoConfig: {
                    type: geoTypes.ADMIN_DIV_2,
                    parent: {type: geoTypes.ADMIN_DIV_0, fixedValue: 'US'}
                },
                labelTop: labels.SUB_NATION,
                labelDown: labels.SUB_DIVISION_NAME.COUNTY,
            },
            {
                geoConfig: {
                    type: geoTypes.ZIP_CODE,
                    parent: {type: geoTypes.ADMIN_DIV_0, fixedValue: 'US'}
                },
                labelTop: labels.SUB_NATION,
                labelDown: labels.SUB_DIVISION_NAME.ZIP_CODE,
            },
            {
                geoConfig: {
                    type: geoTypes.CUSTOM_REGION,
                    customFileGuid: 'abcd'

                },
                labelTop: labels.CUSTOM_REGION
            }
        ];
        arr.forEach(function(config, index) {
            var elem = renderEditor(config.geoConfig);
            // expect that right setting was selected based on initial data given.
            expect(elem.find(
                '.bk-top-level-radio .bk-selected .bk-radio-label'
            ).text().trim()).toBe(config.labelTop);

            if (!!config.parent) {
                expect(elem.find(
                    '.bk-sub-nation-radio .bk-selected .bk-radio-label'
                ).text().trim()).toBe(config.labelDown);
                $('.select2-chosen').text().trim().toBe('United States');
            }
            // Now click on some other option.
            var someOtherRootLevelOptionIndex = index == 0 ? 1 : 0;
            elem.find('.bk-top-level-radio .bk-radio-label')[someOtherRootLevelOptionIndex].click();
            // Now check that selected radio button should have updated.
            expect(elem.find(
                '.bk-top-level-radio .bk-selected .bk-radio-label'
            ).text().trim()).toBe(arr[someOtherRootLevelOptionIndex].labelTop);
        });
    });

    it('it should auto show and hide sub-nation config options', function() {
        var elem = renderEditor(null /* geoConfig */);
        expect(elem.find('.bk-top-level-radio').length).toBe(6);
        expect(elem.find('.bk-sub-nation-radio').length).toBe(0);
        elem.find('.bk-top-level-radio .bk-radio-label')[4].click();
        expect(elem.find('.bk-sub-nation-radio').length).toBe(3);
        elem.find('.bk-top-level-radio .bk-radio-label')[1].click();
        expect(elem.find('.bk-sub-nation-radio').length).toBe(0);
    });

    function renderEditor(geoConfig) {
        var elem =
            angular.element('<bk-geo-config-editor bk-ctrl="ctrl"></bk-geo-config-editor>');
        var scope = $rootScope.$new();
        scope.ctrl = new GeoConfigEditorComponent(!!geoConfig ? new GeoConfig(geoConfig) : null);
        $compile(elem)(scope);
        scope.$digest();
        return elem;
    }

    it('should call set country selector to be inside body', function () {
        var geoConfigEditor = new GeoConfigEditorComponent();
        expect(geoConfigEditor.countrySelectorCtrl.appendToBody).toBe(true);
    });
});
