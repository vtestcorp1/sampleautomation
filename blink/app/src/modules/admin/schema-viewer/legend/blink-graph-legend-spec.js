/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Spec for schema-navigation-controller
 *
 *
 */

'use strict';

describe('blink-graph-legend', function () {
    /* eslint camelcase: 1 */
    var $compile,
        $scope,
        $rootScope,
        compiledElement,
        testedCtrl;

    var colorsItems = {
        'a': '#000000',
        'b': '#111111',
        'c': '#222222'
    };

    var picureItems = {
        'a': 'url1',
        'b': 'url2',
        'c': 'url3'
    };

    beforeEach(function () {
        module('blink.app');
        inject(function (_$compile_, _$rootScope_, GraphLegendComponent) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;

            testedCtrl = new GraphLegendComponent(colorsItems, picureItems);

            $scope = $rootScope.$new();
            $scope.ctrl = testedCtrl;

            compiledElement = $compile('<bk-graph-legend bk-ctrl="ctrl"/>')($scope);
            $scope.$digest();
        });
    });
    it('displays the right number of element', function () {
        // Compile a piece of HTML containing the directive
        expect(compiledElement.find('.legend-color').length).toBe(Object.keys(colorsItems).length);
        expect(compiledElement.find('.legend-color').length).toBe(Object.keys(picureItems).length);
    });

    it('should collapse and re-expand correctly', function () {
        compiledElement.find('.bk-close-legend').click();
        $scope.$digest();
        expect(compiledElement.find('.legend-color').length).toBe(3);
        expect(compiledElement.find('.bk-close-legend').text().trim()).toBe('Show Legend');
        compiledElement.find('.bk-close-legend').click();
        $scope.$digest();
        expect(compiledElement.find('.legend-color').length).toBe(3);
        expect(compiledElement.find('.bk-close-legend').text().trim()).toBe('Hide Legend');

    });
});
