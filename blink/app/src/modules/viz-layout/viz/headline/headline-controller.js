/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Controller for Table Viz
 */

'use strict';

blink.app.controller('HeadlineController', ['$scope',
    '$q',
    'alertService',
    'blinkConstants',
    'strings',
    'util',
    'events',
    'Logger',
    'dataService',
    'tableUtil',
    'UserAction',
    function ($scope,
          $q,
          alertService,
          blinkConstants,
          strings,
          util,
          events,
          Logger,
          dataService,
          tableUtil,
          UserAction) {

        var _logger = Logger.create('headline-controller'),

    // It is important to keep the enum values consistent with the order of items in $scope.headline.menu.items array.
            headlineMenuActions = {
                ADD_FILTER: 0,
                REMOVE_FILTER: 1,
                ADD_SUMMARY: 2
            };

        $scope.headline = {
            hasNewSummaryAvailable: function () {
                if (!$scope.viz.getModel() || !$scope.aggregateTypes) {
                    return false;
                }
                return util.getNextMissing($scope.aggregateTypes, $scope.viz.getModel().getAggregates());
            }
        };

        $scope.headline.isRangeAggregationSummary = function (summary) {
            return summary && summary.aggregateType === util.aggregateTypes.RANGE;
        };

    /**
     * updates the model and fires update-needed evnt when the summary selector value changes
     */
        $scope.headline.onSummaryChange = function () {
            var vizModel = $scope.viz.getModel();

            angular.forEach($scope.headline.summaries, function (summary, idx) {
            //special case handling for range aggregation
            //besides setting the aggregation type at the correct index we also need make sure
            //that if the total number of the aggregations is about to change (e.g. [MIN, MAX] => [AVG] or inverse)
            //the array is re-sized accordingly
                if ($scope.headline.isRangeAggregationSummary(summary)) {
                    vizModel.setAggregateType(idx, util.aggregateTypes.MIN, true);
                    vizModel.setAggregateType(idx + 1, util.aggregateTypes.MAX, true);
                } else {
                    vizModel.setAggregateType(idx, summary.aggregateType, true);
                    if (vizModel.getAggregateSize() > idx + 1) {
                        vizModel.removeAggregate(idx + 1);
                    }
                }
            });

        //this is used to make the summary item invisible while update is happening. Needed in case of
        //date headline because the value of range summary has a different format from other summaries which
        //means in case of range -> simple aggregation switch until the model has been updated the simple aggregation
        //summary view can't properly display the current value (which would still be the value of range summary)
            $scope.isUpdating = true;

            var userAction = new UserAction(UserAction.UPDATE_HEADLINE_DATA);
            var updateHeadlineModelPromise = dataService.updateDataForVizModel(vizModel)
            .then(function(response) {
                return response.data;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
            if (!updateHeadlineModelPromise) {
                return;
            }

        // Note that the current implementation is susceptible to out-of-order issues. For example: user changes
        // the aggregation to unique-count (which is expensive) and then quickly changes to total-count (less expensive).
        // It is possible that the response to unique-count request can come after total-count and show incorrect result.
        // This should be fixed with the key-based promise implementation.
            updateHeadlineModelPromise.then(function () {
                $scope.isUpdating = false;
                $scope.initHeadline();
            }, function () {
                $scope.isUpdating = false;
            });

        };

        function isFormattedColumnTooWide(formattedValue, headlineColumn) {
            var MAX_PIXEL_WIDTH_SUMMARY_VALUE = blinkConstants.headline.MAX_PIXEL_WIDTH_SUMMARY_VALUE,
                SUMMARY_VALUE_FONT_CLASS = 'bk-headline-value';
            if (headlineColumn.isDateColumn()) {
            //remove the hour, minute, seconds part, we know that we never have enough space for such date formats
                return !!formattedValue.match(/\d\d:\d\d:\d\d/);
            }
            var pixelWidth = util.getPixelWidthOfString(formattedValue, SUMMARY_VALUE_FONT_CLASS);

            return pixelWidth > MAX_PIXEL_WIDTH_SUMMARY_VALUE;
        }

        function getCompactFormattedSummaryValue(unformattedValue, formattedValue, headlineColumn) {
        // TODO(vibhor/sunny): Add compact format handling for time column as well
            if (headlineColumn.isTimeColumn()) {
                return formattedValue;
            }

        // On headline summaries, we have limited horizontal real-estate (in most cases), so we use
        // a business number formatting on most summaries (except date-related summaries).
        // However, often times the number would be so large (or so small) that it doesn't make sense to use
        // the business number formatting. So, we use the scientific number format.
            if (isFormattedColumnTooWide(formattedValue, headlineColumn)) {
                if (headlineColumn.isDateColumn()) {
                // TODO (sunny): this needs to be handled in a locale sensitive way
                    return formattedValue.replace(/,?\s+\d\d:\d\d:\d\d/gi, '').trim();
                }

                var isPercentColumn = headlineColumn.isEffectivelyPercent();
                var formatPattern = headlineColumn.getFormatPattern();

            // in case of doubles >= 1 we still have room to save space by
            // rounding before we fall back to ugly scientific notation,
            // for doubles < 1 we can't round off as it might be a too small
            // value (e.g. 0.00000029)
                if (headlineColumn.isDoubleColumn() && Math.abs(unformattedValue) >= 1.0) {
                    var roundedValue;
                    if (isPercentColumn) {
                    // unformatted percentages are represented as ratios (2.3456 instead of 234.56 for 234.56%)
                    // we need to ensure that the digits before decimal in the percentage representation are not
                    // lost to rounding
                        roundedValue = Math.round(unformattedValue * 100) / 100;
                    } else {
                        roundedValue = Math.round(unformattedValue);
                    }

                    var formattedRoundedValue = util.formatDataLabel(roundedValue, {
                        formatPattern: formatPattern,
                        isDouble: false,
                        isPercent: isPercentColumn,
                        nDecimal: 0
                    });

                    if (!isFormattedColumnTooWide(formattedRoundedValue, headlineColumn)) {
                        return formattedRoundedValue;
                    }
                }

                formattedValue = util.scientificFormat(unformattedValue, void 0, isPercentColumn);
            }

            return formattedValue;
        }

        $scope.getHeadlineTitle = function () {
            var vizModel = $scope.viz.getModel();

            if (!vizModel.isPinboardViz()) {
                var skipPrefix = false;
                if (!vizModel.isTableSummary()) {
                    skipPrefix = true;
                }
                return vizModel.getColumn().getName(skipPrefix);

            } else {
                if (!vizModel.isTitleUserDefined()) {
                    var column = vizModel.getColumn(),
                        colNameWithAggregate = column.getName(false),
                        headlineAggregateLabel = util.aggregateTypeLabels[vizModel.getAggregateType()],
                        headlineTitle = headlineAggregateLabel + " of " + colNameWithAggregate;

                    angular.forEach($scope.headline.summaries, function (summary) {
                        if ($scope.headline.isRangeAggregationSummary(summary)) {
                            headlineTitle = colNameWithAggregate;
                        }
                    });

                    return headlineTitle.capitalize();

                } else {
                    return vizModel.getTitle();
                }
            }
        };

    // For percent column, we return the raw ratio.
        function getTooltipContent (headlineColumn, rawValue, summaryValue) {
            if ( (!angular.isDefined(rawValue) || rawValue === null) || headlineColumn.isEffectivelyPercent()) {
                return void 0;
            }

            var isFormatted = (summaryValue +'' != rawValue + '');
            return (isFormatted ? tableUtil.getFormattedValue(headlineColumn, rawValue) : undefined) ;

        }

        $scope.initHeadline = function (triggerReflow) {
            var headlineModel = $scope.viz.getModel();

        //(SCAL-4972): special handling of no/invalid data case for headlines. unlike chart and table vizs where
        //we show 'No data to display' for headlines we show N/A for values and show aggregation options
            $scope.viz.init();

            $scope.aggregateTypes = headlineModel.getSupportedSummaryTypes();
            $scope.isUpdating = false;

            $scope.headline.summaries = [];

            var headlineColumn = headlineModel.getColumn(),
                totalSummaries = headlineModel.getAggregateSize(0);

            for (var i = 0; i < totalSummaries; ++i) {
                $scope.viz.noData = false;
                var rawValue = headlineModel.getDataValueUnformatted(i), summaryValue;

                if (!angular.isDefined(rawValue) || rawValue === null) {
                    summaryValue = 'N/A';
                } else {
                    summaryValue = getCompactFormattedSummaryValue(
                    rawValue,  // unformatted
                    headlineModel.getDataValueFormatted(i),  // formatted
                    headlineColumn);
                }

                $scope.headline.summaries.push({
                    aggregateType: headlineModel.getAggregateType(i),
                    value: summaryValue,
                    tooltipContent : getTooltipContent(headlineColumn, rawValue, summaryValue)
                });
            }

        //begin: special case handling for range aggregation
        //TODO: break the following monolith into functions
            if ((headlineColumn.isDateColumn() || headlineColumn.isTimeColumn()) && headlineColumn.getEffectiveAggregateType() === util.aggregateTypes.NONE) {
                var max, min;
                $scope.headline.summaries.each(function (summary) {
                    if (summary.aggregateType === util.aggregateTypes.MIN) {
                        min = summary.value;
                    } else if (summary.aggregateType === util.aggregateTypes.MAX) {
                        max = summary.value;
                    }
                });

                if (min !== undefined || max !== undefined) {
                    if (min === undefined) {
                        min = max;
                    }
                    else if (max === undefined) {
                        max = min;
                    }

                    $scope.headline.summaries = [
                        {
                            aggregateType: util.aggregateTypes.RANGE,
                            value: {
                                min: min,
                                max: max
                            }
                        }
                    ];
                }

                $scope.aggregateTypes.remove(function (aggrType) {
                    return aggrType === util.aggregateTypes.MIN || aggrType === util.aggregateTypes.MAX;
                });
                $scope.aggregateTypes.unshift(util.aggregateTypes.RANGE);
            }
        //end: special case handling for range aggregation

            $scope.render(triggerReflow);
        };

        $scope.getColumnName = function () {
            var vizModel = $scope.viz.getModel();
            if (!vizModel) {
                return;
            }

            var column = vizModel.getColumn(),
                skipPrefix = !column.isGrowth(),
                columnName = column.getName(skipPrefix);

            return columnName;
        };

        $scope.typeToLabel = function (type) {
            if (!$scope.viz.getModel()|| !type) {
                return;
            }

            var column = $scope.viz.getModel().getColumn();

            var aggregateLabel;
            if (column.isDateColumn() || column.isTimeColumn()) {
                aggregateLabel = util.getDateAggregateLabel(type);
            } else {
                aggregateLabel = util.getAggregateLabel(type);
            }

            return aggregateLabel;
        };

        $scope.isDateHeadline = function () {
            var column = $scope.viz.getModel().getColumn();
            return column.isDateColumn() || column.isTimeColumn();
        };

        function onHeadlineModelChange(newHeadlineModel, oldHeadlineModel) {
            $scope.isUpdating = false;
            if (!newHeadlineModel) {
                $scope.viz.noData = true;
                return;
            }

            $scope.initHeadline(true);
        }

        $scope.$watch(function () {
            return $scope.viz.getModel();
        }, onHeadlineModelChange);

        $scope.$watch(function () {
            return $scope.viz && $scope.viz.getModel().isSecondaryRenderReady();
        }, function (newValue) {
            if (!!newValue) {
                $scope.onRenderComplete($scope.viz.getModel(), false);
            }
        });
    }]);
