/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Stephane Kiss (stephane@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview View for Table Viz
 *
 * We are using slickgrid for rendering the table.
 * Some examples: https://github.com/mleibman/SlickGrid/wiki/Examples
 * API references: http://www.developerfusion.com/project/18821/slickgrid/ and https://github.com/mleibman/SlickGrid/wiki/API-Reference
 */

'use strict';

blink.app.directive('blinkVizTable', ['$q',
    '$timeout',
    'angularUtil',
    'debugInfoCollector',
    'events',
    'fontMetricService',
    'loadingIndicator',
    'Logger',
    'perfMeter',
    'safeApply',
    'util',
    'serviceNames',
    function ($q,
              $timeout,
              angularUtil,
              debugInfoCollector,
              events,
              fontMetricService,
              loadingIndicator,
              Logger,
              perfMeter,
              safeApply,
              util,
              serviceNames) {

        var _logger = Logger.create('table-ui');
        // This is the maximum width supported in screenshots through mobile form factors.
        var MAX_TABLE_WIDTH_FOR_SCREENSHOT = 1000;

    /**
     * Renders the table viz
     */
        function render(scope, $table) {
            var tableModel = scope.viz.getModel();

            if (!tableModel) {
                return;
            }

            var renderProfileMsg = Logger.ProfileMessages.TABLE_VIZ_RENDER_PREAMBLE + ' \'' + tableModel.getName() + '\'';
            _logger.time(renderProfileMsg);

            scope.configureSlickGrid($table);
            configureTableUiHandlers($table, scope);
            setCanDisplayInScreenshot(scope);

            var childScope = scope.$new();
            angularUtil.getCompiledElementAsync($table, childScope).then(function() {
                perfMeter.reportVizRendered(tableModel.getId());
                scope.onRenderComplete(tableModel, true);
                _logger.timeEnd(renderProfileMsg);
            });
        }

    /**
     * When streaming a png screen shotthrough phantomjs, we do not show wide tables.
     * This function contains the logic for setting the sentinel boolean for this condition.
     * @param scope
     */
        function setCanDisplayInScreenshot(scope) {
            // Set boolean sentinel in screenshot mode.
            scope.canDisplayInScreenshot = true;
            if (flags.getValue('screenshotMode') &&
                scope.tableWidth > MAX_TABLE_WIDTH_FOR_SCREENSHOT) {
                scope.canDisplayInScreenshot = false;
            }
        }

    /**
     * Setup UI handlers like column header divider double clicks, every time the table renders
     * @param $table
     * @param scope
     */
        function configureTableUiHandlers($table, scope) {
            var $resizeHandleEls = $table.find('.slick-resizable-handle');
            $resizeHandleEls.dblclick(function() {
                scope.grid.autosizeColumns();
            });
        }

        function configureWindowEventHandlers(scope) {
            $(window).on('resize.tableReRender', function() {
                $timeout.cancel(scope.windowResizeTimer);
                scope.windowResizeTimer = $timeout(function() {
                    if (scope.grid) {
                        scope.grid.resizeCanvas();
                    }
                }, 500, false);
            });
        }

        function removeWindowEventHandlers (scope) {
            $timeout.cancel(scope.windowResizeTimer);
            $(window).off('resize.tableReRender');
        }

        function linker(scope, $el, attrs) {
            scope.canDisplayInScreenshot = true;
            $el.addClass('bk-viz-table bk-table-cell-customizable');
            var _$table = $el.find('.bk-table');

            scope.viz.reflow = function () {
                if (scope.grid) {
                    scope.grid.resizeCanvas();
                }
            };

            scope.$on(events.REFLOW_VIZ, function () {
                if (scope.grid) {
                    scope.grid.resizeCanvas();
                }
            });

            scope.getTooltipType = function () {
                return attrs.tooltipType;
            };

            scope.showLoadingIndicator = function(){
                loadingIndicator.reAnchorAndShow(_$table, {
                    additionalStyleClasses: ['bk-light-weight'],
                    loadingText:'Downloading',
                    showInstantly: true
                });
            };

            scope.hideLoadingIndicator = function(){
                loadingIndicator.hide();
            };

            scope.unhighlightRow = function ($clickedCell) {
                $clickedCell.parent().removeClass('highlighted');
            };

            scope.highlightRow = function ($clickedCell) {
                $el.find('.highlighted').removeClass('highlighted');
                $clickedCell.parent().addClass('highlighted');
                $clickedCell.addClass('highlighted');
            };

            scope.installHeaderTooltip = function ($colEl) {
                $colEl.find('.slick-column-name').attr('title', '');
                $colEl.tooltip({
                    html: true,
                    placement: 'bottom',
                    container: 'body'
                });
            };

            scope.showCopyConfirmation = false;
            scope.onCellDataCopy = function () {
                scope.showCopyConfirmation = true;
                safeApply(scope);
            };

            scope.$on('$destroy', function () {
                removeWindowEventHandlers(scope);
            });

            var $table = $el.find('.bk-table');
            scope.viz.render = scope.render = function () {
                if (scope.grid) {
                    scope.grid.invalidateAllRows();
                    scope.grid = null;
                }

                var startTime = (new Date()).getTime();
                var debugInfo = {
                    type: 'vizRender',
                    timestamp: startTime,
                    url: scope.viz.getModel().getTitle()
                };
                render(scope, $table);
                debugInfoCollector.collect(serviceNames.RENDER, debugInfo);
            };

            scope.recompileTable = function () {
                angularUtil.getCompiledElement($table, scope);
            };

            scope.getTableWidth = function() {
                return $table.width() - 20; // to avoid collision with the border
            };

            scope.getFooterLeftPadding = function () {
                var $footer = $table.find('.bk-more-download-footer');
                if ($footer.length && angular.isDefined($footer.data('leftPadding'))) {
                    return $footer.data('leftPadding');
                }

                if (!$footer.length) {
                    return -1;
                }

                var tableWidth = $table.width();
            // In case, table is smaller than text width, we want to have a minimum 16px padding on the left.
                var font = window.getComputedStyle($footer[0]).font || '';
                var textWidth = fontMetricService.getTextWidth($footer.text(), font);
                var leftPadding = Math.max((tableWidth - textWidth) / 2, 16) + $table.find('.slick-viewport-left')[0].scrollLeft;

                $footer.data('leftPadding', leftPadding);

                return leftPadding;
            };

            scope.configureScopeHandlers();
            removeWindowEventHandlers(scope);
            configureWindowEventHandlers(scope);

            if (scope.viz.getModel()) {
                scope.initTable();
            }

            scope.$watch(function () {
                return $table.height();
            }, scope.viz.reflow);

            scope.$watch(function () {
                return scope.viz && scope.viz.getModel().isSecondaryRenderReady();
            }, function (newValue) {
                if (!!newValue) {
                    scope.onRenderComplete(scope.viz.getModel(), false);
                }
            });
        }

        return {
            restrict: 'E',
            scope: {
                viz: '=',
                sageClient: '=',
                onRenderComplete: '='
            },
            link: linker,
            controller: 'TableController',
            templateUrl: 'src/modules/viz-layout/viz/table/table.html'
        };
    }]);
