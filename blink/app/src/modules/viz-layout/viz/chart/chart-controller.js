/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Controller for Chart Viz
 */

'use strict';

blink.app.controller('ChartController', ['$scope',
    '$q',
    '$timeout',
    'alertService',
    'blinkConstants',
    'strings',
    'callosumTypes',
    'chartTypeSpecificationService',
    'dataService',
    'dateUtil',
    'events',
    'loadingIndicator',
    'Logger',
    'slackService',
    'UserAction',
    'util',
    function ($scope,
              $q,
              $timeout,
              alertService,
              blinkConstants,
              strings,
              callosumTypes,
              chartTypeSpecificationService,
              dataService,
              dateUtil,
              events,
              loadingIndicator,
              Logger,
              slackService,
              UserAction,
              util) {

    // special way to name the scope for ease of debugging
        $scope.__name = 'chart-controller';

        var _logger = Logger.create($scope.__name),

    // to prevent a data fetch call when one is underway. can happen if user paginates too fast.
            _vizDataInFlight = false;

        function setHighchartsTimezone() {
            var timezone = dateUtil.getTimeZone();
            var globalHighchartsOptions = {
                useUTC: false  // defaults to the client default timezone.
            };
        // As part of the session info, callosum also sends server timezone. Use that if available.
            if (timezone) {
            /* global moment */
                globalHighchartsOptions.useUTC = true;
                globalHighchartsOptions.timezoneOffset = 0;
            }
            Highcharts.setOptions({
                global: globalHighchartsOptions
            });
        }
        setHighchartsTimezone();

    /**
     * Returns whether the legend "which series are visible" state can
     * preserved in the new chart model that has been derived after
     * transformation on old chart model.
     *
     * @param {ChartModel} oldChartModel
     * @param {ChartModel} newChartModel
     * @returns {*}
     */
        function canPreserveLegendState(oldChartModel, newChartModel) {
            if (!oldChartModel || !newChartModel) {
                return false;
            }

            var oldLegendColumns = oldChartModel.getLegendColumns(),
                newLegendColumns = newChartModel.getLegendColumns();

            if (!oldLegendColumns || !newLegendColumns) {
                return false;
            }

            if (oldLegendColumns.length != newLegendColumns.length) {
                return false;
            }

            return util.areArraysEqual(oldLegendColumns, newLegendColumns, function(col){
                return col.getSageOutputColumnId();
            });
        }

    /**
     *
     * @param {ChartModel} oldChartModel
     * @param {ChartModel} newChartModel
     */
        function resetNonApplicableState(oldChartModel, newChartModel) {
        // Any fixes like that of SCAL-7662 should go in this function.
            newChartModel.clearAxisExtremes();
            if (canPreserveLegendState(oldChartModel, newChartModel)) {
                return;
            }

            newChartModel.clearVisibleSeriesIds();
            var series = newChartModel.getSeries();
            if (series) {
                series.each(function (serie) {
                    serie.visible = true;
                });
            }
        }

        $scope.isChartHidden = function () {
            if (!$scope.viz) {
                return true;
            }

            return $scope.viz.isEmpty()
            || $scope.viz.dataError
            || $scope.viz.isPendingDataLoad()
            || $scope.isDataNotSupported();
        };

    // TODO(Jasmeet): Currently when the chart is removed from DOM in the case of no data, reflow on the added
    // chart causes the chart to hide behind the legend and also doesnt show the x axis labels.
    // This avoid that situation.
        $scope.markChartInvisible = function () {
            return $scope.viz.getModel() && $scope.viz.getModel().hasNoData();
        };

        $scope.getChartType = function() {
            var vizModel = $scope.viz.getModel();
            if (!vizModel) {
                return null;
            }
            return vizModel.getChartType();
        };
        $scope.isCurrentType = function (chartType) {
            return chartType === this.getChartType();
        };

        $scope.isDataNotSupported = function () {
            return $scope.viz.getModel().doesNotSupportData();
        };

        $scope.getDataDisabledChartExplanation = function () {
            return $scope.viz.getModel().getUnsupportedDataError();
        };

        $scope.$on(events.DOWNLOAD_CHART, function($evt){
            onChartDownloadBtnClick();
        });

        $scope.$on(events.CHART_MODEL_CHANGED_D, function($evt, newModel, oldModel){
            resetNonApplicableState(oldModel, newModel);
            $scope.onChartModelChange();
        });

        $scope.$on(events.CHART_TYPE_CHANGED_U, function($evt, newChartType){
            var vizModel = $scope.viz.getModel();
            vizModel.setAllowChartTypeChangeOnDataLoad(false);
            var axisConfigurationChanged = vizModel.setChartType(newChartType);
            if (axisConfigurationChanged) {
                reloadChart();
            } else {
                $scope.$emit(events.CHART_NEEDS_REDRAW_U);
            }
        });

        $scope.isInPanMode = function () {
            // NOTE(mahesh): isInPanMode is high chart specific, so it is not present in other chart
            // provider classes, so we need to check if this function exists or not.
            // Ideally this should be moved inside the highchart class.
            return $scope.chart &&
                _.isFunction($scope.chart.isInPanMode) &&
                $scope.chart.isInPanMode();
        };

        $scope.isZoomedIn = function () {
            if (!$scope.chart) {
                return false;
            }

            var vizModel = $scope.viz.getModel();
            return vizModel.isZoomedIn();
        };


        function reloadChart () {
            var vizModel = $scope.viz.getModel();
            var answerModel = vizModel.getContainingAnswerModel();
            if (!answerModel || !vizModel) {
                _logger.error('Can not update viz model without required inputs for vizModel, answerModel: ',
                vizModel,
                answerModel);
                return;
            }
            if ($scope.chartDataRequestPromise) {
                $scope.chartDataRequestPromise.cancel();
            }
            var userAction = new UserAction(UserAction.FETCH_CHART_DATA);
            $scope.chartDataRequestPromise = dataService.getDataForVizWithCancelablePromise(
                answerModel,
                vizModel,
                {
                    requestType: callosumTypes.RequestTypes.DATA_CHART_CONFIG
                },
                true
            );
            if (!$scope.chartDataRequestPromise) {
                return;
            }
            $scope.showChartLoading();

            var oldChartModel = _.cloneDeep(vizModel);

            $scope.chartDataRequestPromise
            .then(function (response) {
                var data = response.data;
                answerModel.getCurrentAnswerSheet().setDataForViz(vizModel.getId(), vizModel.getVizType(), data);
                vizModel.updateData(data);

                resetNonApplicableState(oldChartModel, vizModel);

                $scope.hideChartLoading();
                $scope.$emit(events.CHART_NEEDS_REDRAW_U);
                $scope.chartDataRequestPromise = null;
            }, function (respnose) {
                $scope.hideChartLoading();
                $scope.chartDataRequestPromise = null;
                alertService.showUserActionFailureAlert(userAction, respnose);
            });
        };

        $scope.$on(events.CHART_NEEDS_RELOAD, reloadChart);

        $scope.maximized = false;


    // Parameters controlling zoom functionality.
        $scope.zoomParams = {
        // The model bound to the zoom slider that controls the zoom level. Higher the number, more fine grained view user gets.
            level: {
                low: 1
            },
        // If true, the zooming-in/out happens with animation.
            withAnimation: false,
        // If not null, the zoom happens with the targetPoint (in pixel) as the center.
            targetPoint: null
        };

    /**
     * Chart settings logic.
     * Maintain the state of the chart settings drop down (open/close) and let it be controlled by the click on selector button.
     *
     * @type {{ onClick: Function, open: Function, close: Function }}
     */
        $scope.chartSettings = {
            isOpen: false,
            onClick: function () {
                if (!this.isOpen) {
                    $scope.chartSettings.open();
                } else {
                    $scope.chartSettings.close();
                }
            },
            open: function () {
                $scope.chartSettings.isOpen = true;
                $(window).on('mousedown.vizDropDown', function(evt) {
                    if ($(evt.target).closest('.bk-viz-menu').hasClass('bk-open')) {
                        return;
                    }
                    $scope.chartSettings.close();
                    $scope.$digest();
                });
            },
            close: function () {
                $(window).off('mousedown.vizDropDown');
                $scope.chartSettings.isOpen = false;
            },
            chartTypes: []
        };

    /**
     * Chart pagination control logic
     * @type {{  }}
     */
        $scope.chartPagination = {
            onPaginate: function (isNext) {
                if (isNext && !this.canShowNext()) {
                    return;
                }
                if (!isNext && !this.canShowPrev()) {
                    return;
                }
                $scope.fetchDataForChart(isNext).then(function (newVizData) {
                    updateChartData(newVizData);
                });
            },
            onNext: function () {
                this.onPaginate(true);
            },

            onPrev: function () {
                this.onPaginate(false);
            },

            canShowNext: function () {
                var chartModel = $scope.viz.getModel();
                return !!chartModel && !chartModel.hasNoData() && !chartModel.getVizData().isLastBatch;
            },

            canShowPrev: function () {
                var chartModel = $scope.viz.getModel();
                return !!chartModel && !chartModel.hasNoData() && chartModel.getVizData().currentOffset > 0;
            },

            canPaginate: function () {
                return this.canShowNext() || this.canShowPrev();
            }
        };

        $scope.initChart = function () {
            var chartModel = $scope.viz.getModel(),
                validData = $scope.viz.init();

            if (!validData) {
                return;
            }

            if (!$scope.viz.init()) {
                $scope.viz.noData = chartModel.hasNoData();
                return;
            }


            $scope.viz.isDownloadChartSupported = isDownloadChartSupported;
            $scope.viz.onChartDownloadBtnClick = onChartDownloadBtnClick;

            $scope.render();
        };

        $scope.getCurrentPageNumber = function () {
            var vizModel = $scope.viz.getModel();

            if (!vizModel) {
                return 0;
            }

            var vizData = vizModel.getVizData();
            return Math.floor(vizData.currentOffset / vizData.currentBatchSize) + 1;
        };

        function updateChartData(newVizData) {
            var chartModel = $scope.viz.getModel(),
                vizData = chartModel.getVizData();

        //Note(sunny): We don't trigger reflow here as update data usually happens for a bunch of vizs in quick
        //succession and could cause too many unnecessary reflows. The updater of the data will trigger the reflow
            $scope.viz.noData = !vizData.data || vizData.data.length === 0;
            chartModel.updateData(newVizData);
            $scope.onChartDataUpdate();
        }

        $scope.fetchDataForChart = function (isNextBatch) {
            var vizModel = $scope.viz.getModel(),
                vizData = vizModel.getVizData(),
                answerModel = vizModel.getContainingAnswerModel(),
                deferred = $q.defer(),
                offset = 0;

            if (isNextBatch) {
                offset = vizData.currentOffset + vizData.currentBatchSize;
            } else {
                offset = vizData.currentOffset - vizData.currentBatchSize;
                if (offset < 0) {
                    offset = 0;
                }
            }

            if (_vizDataInFlight || (isNextBatch && vizData.isLastBatch) || (!isNextBatch && offset === vizData.currentOffset)) {
                deferred.reject('');
                return deferred.promise;
            }

            var extraPostParams = {
                offset: offset
            };

            var userAction = new UserAction(UserAction.FETCH_CHART_DATA);
            dataService.getDataForViz(answerModel, vizModel, extraPostParams, true)
            .then(function(response) {
                var newVizData = response.data;
                _vizDataInFlight = false;
                deferred.resolve(newVizData);
            }, function (response) {
                alertService.showUserActionFailureAlert(userAction, response);
                _vizDataInFlight = false;
                deferred.reject(response);
            });

            _vizDataInFlight = true;
            return deferred.promise;
        };

        $scope.updateChartZoomOnDraw = function (chart) {
            var vizModel = $scope.viz.getModel(),
                xAxisExtremes = vizModel.getXAxisExtremes(),
                yAxisExtremes = vizModel.getYAxisExtremes();

            chart.setExtremes(xAxisExtremes, yAxisExtremes);
            if (!!chart && vizModel.isZoomedIn()) {
                chart.redraw();
            }
        };

        $scope.updateChartYAxisRange = function (chart) {
            var vizModel = $scope.viz.getModel();
            var yAxisRange = vizModel.getYAxisRange();
            if (!!yAxisRange) {
                chart.setYAxisRange(yAxisRange, vizModel);
            }
        };

        $scope.isDataLabelsEnabled = function () {
            return !!$scope.chart ? $scope.chart.isDataLabelsEnabled() : false;
        };

        $scope.isStackedChart = function () {
            return chartTypeSpecificationService.isStackedChart($scope.viz.getModel().getChartType());
        };

        $scope.canOverlayHeatmapOnChart = function () {
            if(!$scope.chart) {
                return false;
            }
            return $scope.chart.canOverlayHeatmap();
        };

        function formatChartFileName(baseName) {
            var MAX_FILE_NAME_LENGTH = 124;
            if (!baseName) {
                return 'chart';
            }
            var name = baseName.toLowerCase().replace(/\s+/g, '_');
            name = name.slice(0, MAX_FILE_NAME_LENGTH);

            if (!name.match(/chart/i)) {
                name += '_chart';
            }
            return name;
        }

        function getChartFileName() {
            var vizModel = $scope.viz.getModel();
            var title = vizModel && vizModel.getTitle();
            if (title) {
                return formatChartFileName(title);
            }

            var answerModel = vizModel && vizModel.getContainingAnswerModel();
            if (answerModel) {
                var questionText = answerModel.getQuestionText();
                return formatChartFileName(questionText);
            }

            return 'chart';
        }

        var isDownloadChartSupported = function () {
            if (!$scope.chart || !$scope.chart.supportsDownload()) {
                return false;
            }

            return true;
        };

        var onChartDownloadBtnClick = function() {
            var vizModel = $scope.viz.getModel();
            var chart = $scope.chart;
            var options = {
                chart: {
                    backgroundColor: '#ffffff'
                },
                legend: {
                    enabled: vizModel.downloadedChartContainsLegend()
                }
            };
            if (!(chart.options && chart.options.title && chart.options.title.text)) {
                options.title = {
                    text: vizModel.getTitle()
                };
            } else {
                options.title = {
                    text: vizModel.getTitle() + ' (' + chart.options.title.text + ')'
                };
            }

            chart.downloadChart(options, getChartFileName());
        };

        $scope.viz.shareOnSlack = function(channel) {
            var model = $scope.viz.getModel();

            var fileId = model.getUserData('file_id');

            if (!!fileId) {
                return slackService.shareFileOnChannel(fileId, channel.id);
            } else {
                var options = {
                    chart: {
                        backgroundColor: '#ffffff'
                    },
                    legend: {
                        enabled: true
                    }
                };

                options.title = {
                    text: $scope.viz.getModel().getTitle()
                };

                var defer = $q.defer();
                $scope.chart.toBlob(options, function (blob) {
                    var title = getChartFileName();
                    slackService.uploadBlobAsFile(blob, channel.id, title, title).then(function(fileInfo) {
                        model.setUserData('file_id', fileInfo.file.id);
                        defer.resolve();
                    });
                }, 1);

                return defer.promise;
            }
        };
    }]);
