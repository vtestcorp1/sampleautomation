/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com),
 *         Ashish Shubham (ashish.shubham@thoughtspot.com),
 *         Mahesh Sharma (mahesh@thoughtspot.com)
 */
'use strict';

describe('Axis column Validation service', function () {
    var axisColumnValidationService, constants, errorMessage, CurrencyTypeInfo;

    function getVizColumn(outputColId, name, isEffectiveNumeric, isAttribute) {
        return {
            getSageOutputColumnId: function() {
                return outputColId;
            },
            isEffectivelyNonNumeric: function() {
                return !isEffectiveNumeric;
            },
            isEffectivelyNumeric: function() {
                return isEffectiveNumeric;
            },
            getName: function () {
                return name;
            },
            isAttribute: function () {
                return isAttribute;
            }
        };
    }

    beforeEach(function(done) {
        module('blink.app');
        System.import('src/modules/viz-layout/viz/chart/axis-column-validation-service').
            then(function(module) {
                axisColumnValidationService = module;
                /* eslint camelcase: 1 */
                inject(function(_blinkConstants_, _strings_, _CurrencyTypeInfo_) {
                    /* eslint camelcase: 1 */
                    constants = _blinkConstants_;
                    errorMessage = _strings_;
                    CurrencyTypeInfo = _CurrencyTypeInfo_;
                });
                done();
            }, function(e) {console.log('error loading', e, e.stack);});
    });


    // TODO(Jasmeet): Add more test cases to cover other validations.
    it('should invalidate config with multi-y containing non numeric attribute', function () {
        var column1 = getVizColumn('id1', 'name1', false),
            column2 = getVizColumn('id1', 'name2', true),
            column3 = getVizColumn('id1', 'name3', true);
        var validity = axisColumnValidationService.validateAxisColumns({
            xAxisColumns: [column1],
            yAxisColumns: [column2, column3],
            legendColumns: [],
            radialColumn: null
        });
        expect(validity.other).toBe('name2 is already in use.');
    });

    it('should invalidate config with multi-y and legend column', function () {
        var column1 = getVizColumn('id1', 'name1', false),
            column2 = getVizColumn('id2', 'name2', true),
            column3 = getVizColumn('id3', 'name3', true),
            column4 = getVizColumn('id4', 'name4', false, true);
        var validity = axisColumnValidationService.validateAxisColumns({
            xAxisColumns: [column1],
            yAxisColumns: [column2, column3],
            legendColumns: [column4],
            radialColumn: null
        }, 'COLUMN');

        var expectedError =  errorMessage
            .chartEditorErrorExplanation
            .UNSUPPORTED_LEGEND_WITH_MULTIPLE_Y;

        expect(validity.legend).toBe(expectedError);
    });


    it('should invalidate config if y-axis is being shared for columns with different currency setting', function () {
        var column1 = getVizColumn('id1', 'name1', false),
            column2 = getVizColumn('id2', 'name2', true),
            column3 = getVizColumn('id3', 'name3', true);

        column2.getCurrencyTypeInfo = function () {
            return new CurrencyTypeInfo({setting: 'FROM_ISO_CODE', isoCode: 'USD'});
        };
        column3.getCurrencyTypeInfo = function () {
            return new CurrencyTypeInfo(null);
        };
        var validity = axisColumnValidationService.validateAxisColumns(
            {
                xAxisColumns: [column1],
                yAxisColumns: [column2, column3],
                legendColumns: [],
                radialColumn: null
            },
            'COLUMN',
            true /*is Y-axis shared*/
        );

        var expectedError =  errorMessage
            .chartEditorErrorExplanation
            .INVALID_AXIS_SHARING;

        expect(validity.yAxis).toBe(expectedError);
    });

});
