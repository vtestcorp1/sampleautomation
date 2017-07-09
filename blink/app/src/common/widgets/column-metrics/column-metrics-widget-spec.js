/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Unit tests for column metrics editor widget.
 */

'use strict';

// TODO(mahesh) Figure out why angular promise is not being resolved when multiple tests are run
// in parallel.
/* global xdescribe */
xdescribe('Column metrics widget', function() {
    var basePath = getBasePath(document.currentScript.src);
    var $scope, elem, updatedMetricsDefinition, ColumnMetricsComponent;

    beforeEach(function(done) {
        module('blink.app');

        freshImport(basePath, './column-metrics').then(function(module) {
            ColumnMetricsComponent = module.ColumnMetricsComponent;
            inject(function($rootScope, $compile) {
                $scope = $rootScope.$new();
                updatedMetricsDefinition = null;
                var mockMetricsDefinition = {
                    toJson: function() {
                        return {
                            name: 'MockMetricsDef',
                            row: [{
                                color: 'red',
                                range: {
                                    min: 10,
                                    max: 30
                                }
                            }, {
                                color: 'yellow',
                                range: {
                                    min: 100,
                                    max: 1000
                                }
                            }]
                        };
                    }
                };
                $scope.ctrl = new ColumnMetricsComponent(
                    mockMetricsDefinition,
                    true // isEditable
                );
                var template = '<bk-column-metrics bk-ctrl="ctrl"></bk-column-metrics>';
                elem = $compile(angular.element(template))($scope);
                $('body').append(elem);
                $scope.$digest();
                done();
            });
        });
    });

    afterEach(function() {
        $('body').empty();
    });

    it('should show existing metrics', function() {
        expect(elem.find('.bk-column-metric').length).toBe(2);

        expect(elem.find('input[ng-model="metric.range.min"]').eq(0).val()).toBe('10');
        expect(elem.find('input[ng-model="metric.range.max"]').eq(0).val()).toBe('30');

        expect(elem.find('input[ng-model="metric.range.min"]').eq(1).val()).toBe('100');
        expect(elem.find('input[ng-model="metric.range.max"]').eq(1).val()).toBe('1000');

        expect(
            elem
                .find('.bk-metric-color-picker .bk-color-picker-fill')
                .eq(0)
                .css('background-color')
        ).toBe('rgb(255, 0, 0)');

        expect(
            elem.find('.bk-metric-color-picker .bk-color-picker-fill')
                .eq(1)
                .css('background-color')
        ).toBe('rgb(255, 255, 0)');
    });

    function updateMetric(index, min, max, color, doNotCommit) {
        elem.find('input[ng-model="metric.range.min"]').eq(index).val(min).trigger('change');
        elem.find('input[ng-model="metric.range.max"]').eq(index).val(max).trigger('change');

        elem.find('.bk-metric-color-picker').click();
        elem.find('.bk-color-picker-anchor').colorpicker('setValue', color);

        if (!doNotCommit) {
            $scope.$digest();
            $scope.ctrl.commitChanges().then(function(result) {
                if (result.hasChanges) {
                    updatedMetricsDefinition = result.newDefinition;
                }
            });
            $scope.$digest();
        }
    }

    function updateMetricAndExpectErrorMessage(index, min, max, color, errorMessage) {
        expect(elem.find('.bk-column-metric-validation-error-message').length).toBe(0);

        updateMetric(index, min, max, color);

        expect(updatedMetricsDefinition).toBeNull();
        expect(elem.find('.bk-column-metric-validation-error-message').length).toBe(1);
        expect(elem.find('.bk-column-metric-validation-error-message').text()).toMatch(errorMessage);
    }

    function addMetric(min, max, color) {
        elem.find('.bk-column-metric-add .bk-icon').click();
        $scope.$digest();
        updateMetric(
            2,
            min,
            max,
            color
        );
    }

    it('should allow changing existing metrics', function() {
        expect(updatedMetricsDefinition).toBeNull();
        expect(elem.find('input[ng-model="metric.range.min"]').eq(0).val()).toBe('10');
        updateMetric(0, 20, 40, '#0000ff');

        expect(updatedMetricsDefinition).toBeTruthy();
        expect(updatedMetricsDefinition.toJson().row[0].range.min).toBe(20);
        expect(updatedMetricsDefinition.toJson().row[0].range.max).toBe(40);
        expect(updatedMetricsDefinition.toJson().row[0].color).toBe('rgba(0, 0, 255, 1)');
    });

    it('should allow adding new metrics', function() {
        expect(elem.find('.bk-column-metric').length).toBe(2);

        addMetric(80, 90, '#f98679');
        expect(elem.find('.bk-column-metric').length).toBe(3);

        expect(updatedMetricsDefinition).toBeTruthy();
        expect(updatedMetricsDefinition.toJson().row[2].range.min).toBe(80);
        expect(updatedMetricsDefinition.toJson().row[2].range.max).toBe(90);
        expect(updatedMetricsDefinition.toJson().row[2].color).toBe('rgba(249, 134, 121, 1)');
    });

    it('should allow deleting metrics', function() {
        expect(elem.find('.bk-column-metric').length).toBe(2);

        elem.find('.bk-metric-remove-button .bk-icon').eq(0).click();
        $scope.$digest();

        expect(elem.find('.bk-column-metric').length).toBe(1);

        expect(updatedMetricsDefinition).toBeTruthy();
        expect(updatedMetricsDefinition.toJson().row.length).toBe(1);
        expect(updatedMetricsDefinition.toJson().row[0].range.min).toBe(100);
    });

    it('should ignore ranges with both ends empty', function() {
        expect(elem.find('.bk-column-metric').length).toBe(2);

        updateMetric(0, '', '', '#f98679');

        expect(updatedMetricsDefinition).toBeTruthy();
        expect(updatedMetricsDefinition.toJson().row.length).toBe(1);
        expect(updatedMetricsDefinition.toJson().row[0].range.min).toBe(100);
    });

    it('should treat empty min as -Infinity', function() {
        updateMetric(0, '', 20, '#f98679');

        expect(updatedMetricsDefinition).toBeTruthy();
        expect(updatedMetricsDefinition.toJson().row[0].range.min).toBeUndefined();
        expect(updatedMetricsDefinition.toJson().row[0].range.max).toBe(20);
        expect(updatedMetricsDefinition.getMetricAtIndex(0).isValueInRange(-100000)).toBe(true);
        expect(updatedMetricsDefinition.getMetricAtIndex(0).isValueInRange(30)).toBe(false);
    });

    it('should treat empty min as -Infinity', function() {
        updateMetric(1, 110, '', '#f98679');

        expect(updatedMetricsDefinition).toBeTruthy();
        expect(updatedMetricsDefinition.toJson().row[1].range.min).toBe(110);
        expect(updatedMetricsDefinition.toJson().row[1].range.max).toBeUndefined();
        expect(updatedMetricsDefinition.getMetricAtIndex(1).isValueInRange(100000)).toBe(true);
        expect(updatedMetricsDefinition.getMetricAtIndex(1).isValueInRange(100)).toBe(false);
    });

    it('should parse business numbers', function() {
        updateMetric(1, '0.11K', '1.1K', '#f98679');

        expect(updatedMetricsDefinition).toBeTruthy();
        expect(updatedMetricsDefinition.toJson().row[1].range.min).toBe(110);
        expect(updatedMetricsDefinition.toJson().row[1].range.max).toBe(1100);
    });

    it('should handle negative numbers', function() {
        updateMetric(0, '-10', '50', '#f98679');

        expect(updatedMetricsDefinition).toBeTruthy();
        expect(updatedMetricsDefinition.toJson().row[0].range.min).toBe(-10);
        expect(updatedMetricsDefinition.toJson().row[0].range.max).toBe(50);
    });

    it('should show error when range data is non numeric', function() {
        updateMetricAndExpectErrorMessage(0, 'alpha', 20, '#f98679', /must be numbers/);
    });

    it('should show error when range data is alpha numeric non business number', function() {
        updateMetricAndExpectErrorMessage(0, '2.3G', 20, '#f98679', /must be numbers/);
    });

    it('should show error when any range is empty', function() {
        updateMetricAndExpectErrorMessage(0, 20, 20, '#f98679', /min should be smaller than the max/);
    });

    it('should show error when any range decreasing', function() {
        updateMetricAndExpectErrorMessage(0, 20, 20, '#f98679', /min should be smaller than the max/);
    });

    it('should show error when ranges overlap', function() {
        updateMetricAndExpectErrorMessage(0, 10, 120, '#f98679', /may not overlap/);
    });

    it('should show error in correct rows when ranges overlap: SCAL-12669', function() {
        addMetric(0, 150, '#f98679');
        $scope.$digest();

        expect(elem.find('.bk-numeric-range:eq(0).bk-numeric-range-invalid').length).toBe(1);
        expect(elem.find('.bk-numeric-range:eq(1).bk-numeric-range-invalid').length).toBe(0);
        expect(elem.find('.bk-numeric-range:eq(2).bk-numeric-range-invalid').length).toBe(1);
    });

    it('should not make any changes in case of "cancel"', function() {
        updateMetric(0, 30, 50, 'pink', true);

        expect(updatedMetricsDefinition).toBeNull();
    });
});
