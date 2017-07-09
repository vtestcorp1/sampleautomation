/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit tests for headline controller
 */

'use strict';
/* global addCustomMatchers*/

describe('Headline controller', function() {
    var $scope = null,
        constants = null,
        blinkStrings = null,
        headlineCtrl = null,
        mockVizModel = null,
        util = null,
        dateUtil = null,
        mockTableUtil = {},
        session;

    beforeEach(function() {
        module('blink.app');
        module(function ($provide) {
            $provide.value('tableUtil', mockTableUtil);
        });

        inject(function($injector) {
            session = $injector.get('session');
            /* global spyOnSessionTimezone */
            spyOnSessionTimezone(session);
        });
    });

    beforeEach(addCustomMatchers());

    /* eslint camelcase: 1 */
    beforeEach(inject(function ($rootScope, $controller, _blinkConstants_, _strings_, _util_, _dateUtil_, _events_, Logger) {
        $scope = $rootScope.$new();
        // Expects a viz property to be setup by the viz tile controller.
        $scope.viz = {};
        $scope.initViz = function () {return true;};
        $scope.render = function () {};

        constants = _blinkConstants_;
        blinkStrings = _strings_;

        /* eslint camelcase: 1 */
        util = _util_;
        /* eslint camelcase: 1 */
        dateUtil = _dateUtil_;

        mockTableUtil.getFormattedValue = function(column, value) {
            return value;
        };

        mockVizModel = {
            _hasData: false,
            _aggregateSize: 0,
            _unformattedDataValue: 0,
            _formattedDataValue: '0',
            _headlineCol: {
                isMeasure: function () {
                    return true;
                },
                isDateColumn: function () {
                    return false;
                },
                isTimeColumn: function () {
                    return false;
                },
                getName: function () {
                    return 'colName';
                }
            },
            hasData: function () {
                return this._hasData;
            },
            getColumnName: function () {
                return 'colName';
            },
            getAggregateSize: function () {
                return this._aggregateSize;
            },
            getAggregateType: function () {
                return 'type';
            },
            getHeadlineTitle: function () {
                return 'colName';
            },
            getDataValueUnformatted: function () {
                return this._unformattedDataValue;
            },
            getDataValueFormatted: function () {
                return this._formattedDataValue;
            },
            getColumn: function () {
                return this._headlineCol;
            },
            getSupportedSummaryTypes: function () {
                return ['SUM'];
            },
            getId: function () {
                return 'viz-model-id';
            },
            isTitleUserDefined: function () {
                return false;
            },
            isPinboardViz: function() {
                return false;
            },
            isTableSummary: function() {
                return true;
            }
        };
        $scope.viz = {
            init: angular.noop,
            getModel: function() {
                return mockVizModel;
            }
        };

        var mockDataService = {
            updateDataForVizModel: function () {
                return {
                    then: angular.noop
                };
            }
        };

        /* eslint camelcase: 1 */
        headlineCtrl = $controller('HeadlineController', {
            $scope: $scope,
            util: util,
            events: _events_,
            dataService: mockDataService,
            Logger: Logger
        });
    }));

    it('should have initialized scope properly', function () {
        expect($scope.headline).not.toBeNull();
    });

    it('should set noData', function () {
        expect($scope.viz.noData).toBeFalsy();
        $scope.viz = {
            getModel: function() {
                return null;
            }
        };
        // Trigger the viz model watch.
        $scope.$apply();
        expect($scope.viz.noData).toBeTruthy();
    });

    // This is handled via the watch in viz tile controller.
    xit('should set tile title', function () {
        var title = '';
        $scope.tile = {
            setTitle: function (t) {
                title = t;
            }
        };
        mockVizModel._hasData = true;

        $scope.initHeadline();
        expect(title).toBe(mockVizModel.getColumnName());
    });

    it('should add summaries', function () {
        $scope.tile = {
            setTitle: function (t) {}
        };

        angular.extend(mockVizModel._headlineCol, {
            isEffectivelyPercent: function() {
                return false;
            }
        });

        mockVizModel._hasData = true;

        mockVizModel._aggregateSize = 1;

        $scope.initHeadline();
        expect($scope.viz.noData).toBeFalsy();
        expect($scope.headline.summaries.length).toBe(1);
        expect($scope.headline.summaries[0].aggregateType).toBe(mockVizModel.getAggregateType());
        expect($scope.headline.summaries[0].value).toBe(mockVizModel.getDataValueFormatted());
    });

    it('should handle a change in summary type', function () {
        mockVizModel._hasData = true;

        angular.extend(mockVizModel._headlineCol, {
            isEffectivelyPercent: function() {
                return false;
            }
        });

        angular.extend(mockVizModel, {
            aggTypes: [],
            setAggregateType: function (idx, aggType) {
                this.aggTypes[idx] = aggType;
            }
        });

        $scope.headline.summaries = [{
            aggregateType: 'SUM'
        }, {
            aggregateType: 'COUNT'
        }];

        $scope.headline.onSummaryChange();
        expect($scope.viz.getModel().aggTypes).toBeListOf(['SUM', 'COUNT']);
    });

    it('should show n/a when no data is present', function () {
        $scope.tile = {
            setTitle: function (t) {}
        };
        mockVizModel._hasData = true;

        mockVizModel._aggregateSize = 1;
        mockVizModel._unformattedDataValue = undefined;

        $scope.initHeadline();
        expect($scope.viz.noData).toBeFalsy();
        expect($scope.headline.summaries.length).toBe(1);
        expect($scope.headline.summaries[0].aggregateType).toBe(mockVizModel.getAggregateType());
        expect($scope.headline.summaries[0].value).toBe('N/A');
    });

    //formatting is done in two pass (rounding, then falling back to scientific notation
    // if value is still too wide)

    it('should show a scientific number format when number is too small', function () {
        $scope.tile = {
            setTitle: function (t) {}
        };

        angular.extend(mockVizModel._headlineCol, {
            isDoubleColumn: function() {
                return true;
            },
            isEffectivelyPercent: function() {
                return false;
            },
            getFormatPattern: function () {
                return 'FORMAT_PATTERN';
            }
        });

        mockVizModel._hasData = true;
        mockVizModel._aggregateSize = 1;
        mockVizModel._unformattedDataValue = 0.0000000000000029;
        mockVizModel._formattedDataValue = '0.0000000000000029';

        $scope.initHeadline();
        expect($scope.viz.noData).toBeFalsy();
        expect($scope.headline.summaries.length).toBe(1);
        expect($scope.headline.summaries[0].aggregateType).toBe(mockVizModel.getAggregateType());
        expect($scope.headline.summaries[0].value).toBe('2.90e-15');
    });

    it('should rounds up a double number it overflows the headline', function () {
        $scope.tile = {
            setTitle: function (t) {}
        };

        constants.headline.MAX_PIXEL_WIDTH_SUMMARY_VALUE = 70;

        angular.extend(mockVizModel._headlineCol, {
            isDoubleColumn: function() {
                return true;
            },
            isEffectivelyPercent: function() {
                return false;
            },
            getFormatPattern: function () {
                return '';
            }
        });

        mockVizModel._hasData = true;
        mockVizModel._aggregateSize = 1;
        mockVizModel._unformattedDataValue = 100000.123456;
        mockVizModel._formattedDataValue = '100000.123456';

        $scope.initHeadline();
        expect($scope.viz.noData).toBeFalsy();
        expect($scope.headline.summaries.length).toBe(1);
        expect($scope.headline.summaries[0].aggregateType).toBe(mockVizModel.getAggregateType());
        expect($scope.headline.summaries[0].value).toBe('100,000');
        expect($scope.headline.summaries[0].tooltipContent).toBe(mockVizModel._unformattedDataValue);
    });

    it('should use scientific notation when it overflows the headline (second pass)', function () {
        $scope.tile = {
            setTitle: function (t) {}
        };

        constants.headline.MAX_PIXEL_WIDTH_SUMMARY_VALUE = 0;

        angular.extend(mockVizModel._headlineCol, {
            isDoubleColumn: function() {
                return true;
            },
            isEffectivelyPercent: function() {
                return false;
            },
            getFormatPattern: function () {
                return '';
            }
        });

        mockVizModel._hasData = true;
        mockVizModel._aggregateSize = 1;
        mockVizModel._unformattedDataValue = 100000.123456;
        mockVizModel._formattedDataValue = '100000.123456';

        $scope.initHeadline();

        expect($scope.viz.noData).toBeFalsy();
        expect($scope.headline.summaries.length).toBe(1);
        expect($scope.headline.summaries[0].aggregateType).toBe(mockVizModel.getAggregateType());
        expect($scope.headline.summaries[0].value).toBe('1.00e+5');
        expect($scope.headline.summaries[0].tooltipContent).toBe(mockVizModel._unformattedDataValue);
    });

    it("should round a percent ratio if it overflows the headline", function() {
        $scope.tile = {
            setTitle: function (t) {}
        };

        constants.headline.MAX_PIXEL_WIDTH_SUMMARY_VALUE = 50;
        angular.extend(mockVizModel._headlineCol, {
            isDoubleColumn: function() {
                return true;
            },
            isEffectivelyPercent: function() {
                return true;
            },
            getFormatPattern: function () {
                return '';
            }
        });

        mockVizModel._hasData = true;
        mockVizModel._aggregateSize = 1;
        mockVizModel._unformattedDataValue = 9.876543;
        mockVizModel._formattedDataValue = '987.6543%';

        $scope.initHeadline();
        expect($scope.viz.noData).toBeFalsy();
        expect($scope.headline.summaries.length).toBe(1);
        expect($scope.headline.summaries[0].aggregateType).toBe(mockVizModel.getAggregateType());
        expect($scope.headline.summaries[0].value).toBe('988%');
        expect($scope.headline.summaries[0].tooltipContent).toBeUndefined();
    });

    it("should round a percent ratio if it overflows the headline (second pass)", function() {
        $scope.tile = {
            setTitle: function (t) {}
        };

        constants.headline.MAX_PIXEL_WIDTH_SUMMARY_VALUE = 0;
        angular.extend(mockVizModel._headlineCol, {
            isDoubleColumn: function() {
                return true;
            },
            isEffectivelyPercent: function() {
                return true;
            },
            getFormatPattern: function () {
                return '';
            }
        });

        mockVizModel._hasData = true;
        mockVizModel._aggregateSize = 1;
        mockVizModel._unformattedDataValue = 9.876543;
        mockVizModel._formattedDataValue = '987.6543%';

        $scope.initHeadline();
        expect($scope.viz.noData).toBeFalsy();
        expect($scope.headline.summaries.length).toBe(1);
        expect($scope.headline.summaries[0].aggregateType).toBe(mockVizModel.getAggregateType());
        expect($scope.headline.summaries[0].value).toBe('9.88e+2%');
        expect($scope.headline.summaries[0].tooltipContent).toBeUndefined();
    });



    it('should test hasNewSummaryAvailable', function () {
        $scope.tile = {
            setTitle: function (t) {}
        };
        mockVizModel._hasData = true;

        angular.extend(mockVizModel, {
            getAggregates: function () {
                return [];
            }
        });

        $scope.initHeadline();
        $scope.aggregateTypes = [];
        expect($scope.headline.hasNewSummaryAvailable()).toBeFalsy();
    });

    it('should replace min/max aggregation on date to range aggregation', function () {
        var at = util.aggregateTypes,
            smallerDate = 365 * 86400 * 1000,
            biggerDate = 366 * 86400 * 1000,
            smallerDateFormatted = '12/31/1970',
            biggerDateFormatted = '01/01/1971',
            aggrTypesCombos = [
                {
                    aggTypes: [at.MIN],
                    dataValues: [smallerDate, smallerDate],
                    formattedSummaryValues: [smallerDateFormatted, smallerDateFormatted],
                    expectedSummaries: [{
                        aggregateType: at.RANGE,
                        value: {
                            min: smallerDateFormatted,
                            max: smallerDateFormatted
                        }
                    }]
                }, {
                    aggTypes: [at.MAX],
                    dataValues: [biggerDate, biggerDate],
                    formattedSummaryValues: [biggerDateFormatted, biggerDateFormatted],
                    expectedSummaries: [{
                        aggregateType: at.RANGE,
                        value: {
                            min: biggerDateFormatted,
                            max: biggerDateFormatted
                        }
                    }]
                }, {
                    aggTypes: [at.MIN, at.MAX],
                    dataValues: [smallerDate, biggerDate],
                    formattedSummaryValues: [smallerDateFormatted, biggerDateFormatted],
                    expectedSummaries: [{
                        aggregateType: at.RANGE,
                        value: {
                            min: smallerDateFormatted,
                            max: biggerDateFormatted
                        }
                    }]
                }, {
                    aggTypes: [at.MIN, at.MAX],
                    dataValues: [biggerDate, biggerDate],
                    formattedSummaryValues: [biggerDateFormatted, biggerDateFormatted],
                    effectiveAggrType: at.MAX,
                    expectedSummaries: [{
                        aggregateType: at.MIN,
                        value: biggerDateFormatted
                    }, {
                        aggregateType: at.MAX,
                        value: biggerDateFormatted
                    }]
                }
            ];

        $scope.tile = {
            setTitle: function (t) {}
        };
        mockVizModel._hasData = true;

        aggrTypesCombos.each(function(config){
            angular.extend(mockVizModel, {
                aggTypes: config.aggTypes,
                setAggregateType: function (idx, aggType) {
                    this.aggTypes[idx] = aggType;
                },
                getAggregateType: function(idx) {
                    return this.aggTypes[idx];
                },
                getAggregateSize: function() {
                    return this.aggTypes.length;
                },
                getDataValueUnformatted: function(idx) {
                    return config.dataValues[idx];
                },
                getDataValueFormatted: function(idx) {
                    return config.formattedSummaryValues[idx];
                }
            });

            angular.extend(mockVizModel._headlineCol, {
                isDateColumn: function() {
                    return true;
                },
                isEffectivelyPercent: function() {
                    return false;
                },
                getEffectiveAggregateType: function () {
                    return config.effectiveAggrType || at.NONE;
                }
            });

            $scope.initHeadline();
            expect($scope.headline.summaries.length).toBe(config.expectedSummaries.length);
            $scope.headline.summaries.each(function(summary, index){
                var expectedSummary = config.expectedSummaries[index];

                expect(summary.aggregateType).toBe(expectedSummary.aggregateType);
                expect(summary.value).toEqual(expectedSummary.value);
            });
        });
    });

    it('should shorten datetime summary to remove hour:minute:second: SCAL-3755, SCAL-4039', function () {
        $scope.tile = {
            setTitle: function (t) {}
        };

        var at = util.aggregateTypes,
            smallerDate = 365 * 86400 * 1003,
            biggerDate = 366 * 86400 * 1004,
            aggrConfig = {
                aggTypes: [at.MIN, at.MAX],
                dataValues: [smallerDate, biggerDate],
                summaryValues: {
                    min: smallerDate,
                    max: biggerDate
                }
            };

        angular.extend(mockVizModel, {
            aggTypes: aggrConfig.aggTypes,
            getAggregates: function () {
                return aggrConfig.aggTypes;
            },
            getAggregateType: function(idx) {
                return this.aggTypes[idx];
            },
            getAggregateSize: function() {
                return this.aggTypes.length;
            },
            getDataValueFormatted: function(idx) {
                return dateUtil.formatDate(aggrConfig.dataValues[idx], "yyyyMMdd HH':'mm':'ss");
            }
        });

        angular.extend(mockVizModel._headlineCol, {
            isDateColumn: function() {
                return true;
            },
            isEffectivelyPercent: function() {
                return false;
            },
            getEffectiveAggregateType: function () {
                return at.NONE;
            }
        });

        mockVizModel._hasData = true;

        expect(mockVizModel.getDataValueFormatted(0)).toBe("01/01/1971, 18:16:48");
        expect(mockVizModel.getDataValueFormatted(1)).toBe('01/03/1971, 03:08:09');

        $scope.initHeadline();
        expect($scope.headline.summaries.length).toBe(1);
        expect($scope.headline.summaries[0].aggregateType).toBe(at.RANGE);
        expect($scope.headline.summaries[0].value.min).toBe('01/01/1971');
        expect($scope.headline.summaries[0].value.max).toBe('01/03/1971');
    });
});
