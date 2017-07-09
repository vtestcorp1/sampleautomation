/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview This file contains functions used all over in chart-ui, keeping them independent
 * functions for the sake of better testability.
 */

import _ from 'lodash';
import {blinkConstants} from '../../../../base/blink-constants';
import {ngRequire, Provide} from '../../../../base/decorators';
import {VisualizationColumnModel} from '../../../callosum/model/visualization-column';
import GeoConfig from '../../../document-model/table-model/geo-config';
import {getInputForChartContextMenu} from '../../../viz-context-menu/chart-context-menu-util';
import {jsonConstants} from '../../answer/json-constants';
import {PivotTableComponent} from '../pivot/pivot-component';
import {VisualizationModel} from '../visualization-model';
import {ChartModel} from './chart-model';
import {ChartThemeService} from './chart-theme-service';
import GeoMapComponent from './geomap/2d/blink-geo-map';
import {GeoMapData} from './geomap/base/geo-data-processor';
import {GeoUtils} from './geomap/base/geo-utils';

let Logger = ngRequire('Logger');
let util = ngRequire('util');
let perfMeter = ngRequire('perfMeter');
let debugInfoCollector = ngRequire('debugInfoCollector');
let serviceNames = ngRequire('serviceNames');
let chartUtilService = ngRequire('chartUtilService');
let BlinkHighchartConfig = ngRequire('BlinkHighchartConfig');
let BlinkHighchart = ngRequire('BlinkHighchart');
let vizContextMenuLauncher = ngRequire('vizContextMenuLauncher');
let angularUtil = ngRequire('angularUtil');
let BlinkGeoEarth = ngRequire('BlinkGeoEarth');
let $templateCache = ngRequire('$templateCache');
let chartTypeSpecificationService = ngRequire('chartTypeSpecificationService');
let safeApply = ngRequire('safeApply');

/**
 * When a multi-series chart is drawn, we only show this number of series at most on the initial
 * load. Any progressive addition of the remaining series is done in iterativelyAddSeries. The
 * increment is controlled by NUM_SERIES_TO_ADD_PROGRESSIVELY.
 */
const MAX_ENABLED_SERIES_ON_LOAD = 40;

type ChartRendererFunction = (
    scope: any,
    chartModel: ChartModel,
    $container: JQuery,
    optSupportAnimation: boolean
) => void;

let logger,
    chartRenderers: {[provider: string]: ChartRendererFunction};

declare let flags: any;
declare let Highcharts: any;

export {
    chartUIRender,
    chartUISecondaryRender,
    chartUIRenderHighchart,
    chartUIRenderPivot,
    chartUIRenderGeoMap,
    chartUIRenderGeoEarth,
    chartUIRemoveCurrentChart,
    getGeoChartData
};

Provide('ChartUIUtils')({
    render: chartUIRender,
    secondaryRender: chartUISecondaryRender,
    removeCurrentChart: chartUIRemoveCurrentChart
});


function chartUIRender(
    scope: any,
    $chartContent: JQuery,
    optSupportAnimation: boolean,
    maximized: boolean
): void {
    logger = logger || Logger.create('chart-ui-utils');
    let chartModel: ChartModel = scope.viz.getModel();
    /* global flags */
    optSupportAnimation = flags.getValue('chartAnimations')
        && (optSupportAnimation || scope.viz.inPresentationMode);
    if (!chartModel) {
        return;
    }
    let renderProfileMsg =
        Logger.ProfileMessages.CHART_VIZ_RENDER_PREAMBLE + ' \'' + chartModel.getName() + '\'';
    logger.time(renderProfileMsg);

    if (!scope.isDataNotSupported() && !scope.isChartHidden()) {

        scope.prevWidth = void 0;
        scope.prevHeight = void 0;
        let chartProvider: string
            = chartTypeSpecificationService.getChartProvider(chartModel.getChartType());
        chartUIRemoveCurrentChart(scope);
        getChartRenderers()[chartProvider](scope, chartModel, $chartContent, optSupportAnimation);

        //give time for height to be determined
        util.executeInNextEventLoop(() => {
            scope.legendDisabled = !scope.canShowLegendControl();
            //deciding whether to auto show legend is a one time operation (done at init). We don't
            // try to re-decide later even if the chart might get resized allowing enough space to
            // show Also, since we might be here during a chart-update/refresh cycle we re-show the
            // tool that was already showing. If nothing was already showing (before refresh) we try
            // to show legend if possible SCAL-9104: After linking y-axes together, chart is just
            // redrawn causing y-axis labels get overlapped with the tick labels, an additional
            // reflow here fixes this.
            scope.viz.reflow();
        });

        if (maximized && scope.chart && scope.chart.supportsFullScreenMode()) {
            util.launchIntoFullScreen($chartContent[0]);
        }
    }

    logger.timeEnd(renderProfileMsg);
    perfMeter.reportVizRendered(chartModel.getId());
    scope.onRenderComplete(chartModel, true);
    if (chartModel.isSecondaryRenderReady()) {
        chartUISecondaryRender(scope);
    }
}

function chartUISecondaryRender(scope: any): void {
    if (scope.chart) {
        let startTime = (new Date()).getTime();
        let debugInfo = {
            type: 'secondaryVizRender',
            timestamp: startTime,
            url: scope.viz.getModel().getTitle()
        };
        scope.chart.secondaryRender(scope);
        debugInfoCollector.collect(serviceNames.RENDER, debugInfo);
    }

    scope.onRenderComplete(scope.viz.getModel(), /*partial*/ false);
}

function chartUIRenderHighchart(
    scope: any,
    chartModel: ChartModel,
    $chartContent: JQuery,
    optSupportAnimation: boolean
): void {
    ChartThemeService.useDefaultTheme();

    // TODO(Jasmeet): When this render is called the state of the DOM is not consistent.
    // So the flex on the chart doesnt take effect and the height comes out to be 0 in
    // safari.
    // let $tile = $chartContent.parent();
    let containerDimensions = {
        height: $chartContent.height(),
        width: $chartContent.width()
    };
    let shouldShowLabels: boolean = chartUtilService.isChartBigEnoughToShowLabels(
        containerDimensions,
        chartModel
    );
    let chartConfigOptions = chartTypeSpecificationService.configOptions(
        chartModel.getChartType()
    );
    let shouldBringSelectedSeriesToFront: boolean =
        chartConfigOptions.shouldBringSelectedSeriesToFront;

    let useContextOptionRandomizationIdx = chartModel.isPinboardViz();
    let chartConfig = new BlinkHighchartConfig(chartModel, containerDimensions, shouldShowLabels);
    chartConfig
        .configureDefaults()
        .setColors(useContextOptionRandomizationIdx)
        .setContainer($chartContent)
        .disableZoom()
        .configureSeries(getHighchartOnSeriesClickHandler(
            shouldBringSelectedSeriesToFront,
            scope,
            $chartContent
            ),
            MAX_ENABLED_SERIES_ON_LOAD
        )
        .configureXAxis()
        .configureYAxis()
        .configurePlotLines()
        .setAfterSetExtremesCallback(($event) => onAfterSetExtremes(scope, $event))
        .configureChartTitle()
        .configureWindowing()
        .configureLineOptions()
        .configureGenericTooltip()
        .configureExporting();

    if (!!optSupportAnimation) {
        chartConfig.configureAnimation();
    }

    chartConfig.configureOverrides();

    if (logger === void 0) {
        logger = Logger.create('chart-ui-utils');
    }
    logger.log('chart config', chartConfig);
    scope.chart = new BlinkHighchart(chartConfig.build(), (chart, chartScope) => {
        onHighchartLoaded(chartScope, chart);
    });
    scope.emitNewChart(scope.chart);
    $(scope.chart).bind('redraw.blink-chart', function () {
        chartUtilService.updateRenderedHighChartColorsInModel(chartModel, chartConfigOptions, this);
        formatHighchartAxisLabels(scope, this);
        postProcessHighchartDataLabels(this);
    });
}

function chartUIRenderPivot(
    scope: any,
    chartModel: ChartModel,
    $chartContent: JQuery
): void {
    scope.chart = new PivotTableComponent(chartModel, scope.sageClient, () => {
        scope.onRenderComplete(chartModel, false);
    });
    scope.emitNewChart(scope.chart);
    //TODO(Ashish): Add all renderer types as components and use ng-switch in tpl.
    let $pivot: JQuery = angularUtil.getCompiledElement('<bk-pivot-table bk-ctrl="chart">' +
        '</bk-pivot-table>', scope);
    $chartContent.empty();
    $chartContent.append($pivot);
}

function chartUIRenderGeoEarth(
    scope: any,
    chartModel: ChartModel,
    $chartContent: JQuery
): void {
    util.executeInNextEventLoop(() => {
        scope.showChartLoading();
    });

    scope.chart = new BlinkGeoEarth({
        chartModel: chartModel,
        container: $chartContent,
        projectionType: blinkConstants.geo3dProjectionTypes.MAP,
        onLoad: _.noop
    });
    scope.emitNewChart(scope.chart);

    let geoEarthData = getGeoChartData(scope, chartModel, $chartContent);
    scope.chart.setData(geoEarthData, () => {
        util.executeInNextEventLoop(() => {
            scope.hideChartLoading();
        });
    });
}

function chartUIRenderGeoMap(
    scope: any,
    chartModel: ChartModel,
    $chartContent: JQuery,
    optSupportAnimation: boolean
) {
    // Note (sunny): we don't currently keep track of multiple
    // callers to show/hide loading indicator. In this case
    // external components can end up calling hide on the loading
    // indicator at the end of the digest loop overriding this one
    // hence this workaround to make sure we do our business with
    // the loading indicator only after the current digest cycle is
    // over.
    util.executeInNextEventLoop(() => {
        scope.showChartLoading();
    });

    let geoMapConfig = {
        chartModel: chartModel,
        // We disable map zooming/dragging in pinboards unless the viz is in presentation mode.
        // This is because mouse dragging and scrolling conflicts with the pinboard layout dragging
        enableInteractions: (!chartModel.isPinboardViz() || scope.viz.inPresentationMode),
        onRightClick: ($event) => onSeriesClick(scope, $chartContent, $event)
    };
    scope.chart = new GeoMapComponent(geoMapConfig);

    scope.emitNewChart(scope.chart);
    let $geoMap =
        $('<bk-geo-map bk-ctrl="chart" class="bk-geo-map-container"></bk-geo-map>');
    $chartContent.empty();
    $chartContent.append($geoMap);
    return angularUtil.getCompiledElementAsync($geoMap, scope)
        .then(() => {
            let geoChartData = getGeoChartData(scope, chartModel, $chartContent);
            return scope.chart.setData(geoChartData);
        })
        .then(() => {
            scope.chart.setSize($chartContent.width(), $chartContent.height());
            GeoUtils.updateRenderedGeoMapColorsInModel(chartModel, scope.chart);
            // We need to hide the map while the container is being resized otherwise
            // while the layers are being loaded the map gets stretched to fit the
            // already resized parent and looks ugly.
            util.executeInNextEventLoop(() => {
                scope.hideChartLoading();
            });
        });
}

function chartUIRemoveCurrentChart(scope: any): void {
    if (!scope.chart) {
        return;
    }

    // SCAL-6200: Highcharts does not focus the chart when a click on a point
    // happens. This can lead to a situtation where sage still retains focus,
    // the user changes the query and the underlying chart goes away leaving
    // the context menu hanging. The ideal fix will be to make sure sage bar
    // loses focus when context menu is opened but that doesn't seem to work
    // This is a temp fix.
    vizContextMenuLauncher.close();

    $(scope.chart).unbind('selection');
    $(scope.chart).unbind('redraw.blink-chart');
    if (_.isFunction(scope.chart.destroy)) {
        scope.chart.destroy();
    }
    scope.chart = null;
    scope.emitNewChart(scope.chart);
}

function getChartRenderers(): {[provider: string]: ChartRendererFunction} {
    if (chartRenderers === void 0) {
        chartRenderers = {};
        chartRenderers[chartTypeSpecificationService.chartProviders.HIGHCHART]
            = chartUIRenderHighchart;
        chartRenderers[chartTypeSpecificationService.chartProviders.GEO_EARTH]
            = chartUIRenderGeoEarth;
        chartRenderers[chartTypeSpecificationService.chartProviders.GEO_MAP]
            = chartUIRenderGeoMap;
        chartRenderers[chartTypeSpecificationService.chartProviders.PIVOT_TABLE]
            = chartUIRenderPivot;
    }
    return chartRenderers;
}

function postProcessHighchartDataLabels(chart: any): void {
    if (!chart.isDataLabelsEnabled()) {
        return;
    }
    let visibleStackLabels = [];
    chart.yAxis.forEach((yAxis) => {
        let columns = yAxis.stacks.column || yAxis.stacks.area || {};
        _.forIn(columns, (point) => {
            if (!point.label) {
                return;
            }
            let overlap = false;
            visibleStackLabels.forEach((visibleStackLabel) => {
                let paddingBetweenLabels = 2;
                if (isLabelOnLabel(point.label, visibleStackLabel, paddingBetweenLabels)) {
                    overlap = true;
                }
            });
            // Because stack labels are rendered via html, they must be removed from the view
            // differently than datalabels.
            if (overlap) {
                point.label.element.style.opacity = 0;
            } else {
                point.label.element.style.opacity = 1;
                visibleStackLabels.push(point.label);
            }
        });
    });

    visibleStackLabels.forEach((visibleStackLabel) => {
        chart.series.forEach((series) => {
            if (series && series.points) {
                series.points.forEach((point) => {
                    if (!point.dataLabel) {
                        return;
                    }
                    if (isLabelOnLabel(visibleStackLabel, point.dataLabel)) {
                        point.dataLabel.hide();
                    }
                });
            }
        });
    });
}

function onHighchartLoaded(scope: any, loadedChart: any): void {
    //hack(sunny): when exporting as image, a copy of the chart is created with the original
    // callback and attached to document.body (unlike the viz chart svg which is deep inside the DOM
    // and not directly a child of document.body). we don't want to execute the callback for such a
    // chart and use this fact to tell the original visible chart from the copy.
    if (loadedChart.renderTo.parentNode === document.body) {
        return;
    }

    formatHighchartAxisLabels(scope, loadedChart);
    postProcessHighchartDataLabels(loadedChart);
    scope.updateChartZoomOnDraw(loadedChart);
    scope.updateChartYAxisRange(loadedChart);
    // TODO(Jasmeet): Find how elements that bind to the chart object would get access
    // to the latest rendered chart.
}

/**
 * @param $labelElement
 * @param {AnswerSageClient} sageClient
 * @param {VisualizationModel} vizModel
 * @param {VisualizationColumnModel} vizColumn
 * @param {Scope} scope
 * @param {Boolean} isAxisVertical
 * @param axisRelativePosition
 */
function addAxisControl(
    $labelElement: JQuery,
    sageClient: any,
    vizModel: VisualizationModel,
    vizColumn: VisualizationColumnModel,
    scope: any,
    isAxisVertical: boolean,
    axisRelativePosition: string,
    tooltipVal: string,
    tooltipPlacement: string
) {
    let axisScope = scope.$new(true, scope);
    axisScope.vizModel = vizModel;
    axisScope.vizColumn = vizColumn;
    axisScope.isAxisVertical = isAxisVertical;
    axisScope.sageClient = sageClient;
    axisScope.axisRelativePosition = axisRelativePosition;
    axisScope.isColumnControlOpened = false;
    axisScope.tooltip = tooltipVal;
    axisScope.tooltipPlacement = tooltipPlacement + ' auto';

    let axisTpl = $templateCache.get('chart-axis.html');
    let $axisElement = angularUtil.getCompiledElement(axisTpl, axisScope);
    $labelElement.empty();
    $labelElement.append($axisElement);
}

function isLabelOnLabel(label1, label2, padding?: number) {
    var a = label1.element.getBoundingClientRect();
    var b = label2.element.getBoundingClientRect();
    padding = padding ? padding : 0;

    if (b.left > a.right + padding
        || b.right < a.left - padding
        || b.top > a.bottom + padding
        || b.bottom < a.top - padding) {
        return false;
    }

    return true;
}

function findAxisLabelWrapper(element: HTMLElement, column: VisualizationColumnModel): JQuery {
    return $(element).find('#' + column.getSageOutputColumnId());
}

function formatHighchartAxisLabels(scope: any, chart: any): void {
    let chartModel: ChartModel = scope.viz.getModel(),
        sageClient = scope.sageClient;

    chartModel.getYAxisColumns().forEach(function (yAxisColumn, index) {
        let $yAxisElement: JQuery;
        if (!!chartModel.isYAxisShared()) {
            if (!!chart.yAxis[0] && !!chart.yAxis[0].axisTitle) {
                let sharedYAxisElement = chart.yAxis[0].axisTitle.element;
                $yAxisElement = findAxisLabelWrapper(sharedYAxisElement, yAxisColumn);
            }
        } else {
            let matchingAxis = chart.yAxis.find((axis) => {
                let $element;
                if (!!axis && !!axis.axisTitle) {
                    let axisTitleElement = axis.axisTitle.element;
                    $element = findAxisLabelWrapper(axisTitleElement, yAxisColumn);
                }
                return !!$element && !!$element.length;
            });
            if (!!matchingAxis && !!matchingAxis.axisTitle) {
                let matchingAxisTitleElement = matchingAxis.axisTitle.element;
                $yAxisElement = findAxisLabelWrapper(matchingAxisTitleElement, yAxisColumn);
            }
        }

        if (!!$yAxisElement) {
            let tooltipVal = yAxisColumn.getTooltipInformationModel().getTemplate();

            let isYAxisVertical =
                !chartTypeSpecificationService.isXAxisVertical(chartModel.chartType);
            let axisRelativePosition;
            if (isYAxisVertical) {
                axisRelativePosition = index === 0 ?
                    util.relativePositions.LEFT :
                    util.relativePositions.RIGHT;
            } else {
                axisRelativePosition = index === 0 ?
                    util.relativePositions.DOWN :
                    util.relativePositions.UP;
            }
            addAxisControl($yAxisElement,
                sageClient,
                chartModel,
                yAxisColumn,
                scope,
                isYAxisVertical,
                axisRelativePosition,
                tooltipVal,
                util.popoverPositions.RIGHT
            );
        }
    });

    chartModel.getXAxisColumns().forEach(function (xAxisColumn) {
        let $xAxisElement;
        if (!!chart.xAxis[0] && !!chart.xAxis[0].axisTitle) {
            let xAxisTitleElement = chart.xAxis[0].axisTitle.element;
            $xAxisElement = findAxisLabelWrapper(xAxisTitleElement, xAxisColumn);
        }

        if (!!$xAxisElement) {
            let tooltipVal = xAxisColumn.getTooltipInformationModel().getTemplate();

            let isXAxisVertical =
                chartTypeSpecificationService.isXAxisVertical(chartModel.chartType);
            let axisRelativePosition = isXAxisVertical ?
                util.relativePositions.LEFT :
                util.relativePositions.DOWN;
            addAxisControl(
                $xAxisElement,
                sageClient,
                chartModel,
                xAxisColumn,
                scope,
                isXAxisVertical,
                axisRelativePosition,
                tooltipVal,
                util.popoverPositions.BOTTOM
            );
        }
    });
}

function saveChartExtremes(scope: any): void {
    let xAxisExtremes = scope.chart.getXAxisExtremes(),
        yAxisExtremes = scope.chart.getYAxisExtremes();

    //we want to preserve only min & max. Other props can change between
    //renders (SCAL-4711)
    xAxisExtremes = xAxisExtremes.map(function (axisExtremes) {
        return {
            min: axisExtremes.min,
            max: axisExtremes.max
        };
    });
    yAxisExtremes = yAxisExtremes.map(function (axisExtremes) {
        return {
            min: axisExtremes.min,
            max: axisExtremes.max
        };
    });

    scope.viz.getModel().setAxisExtremes(xAxisExtremes, yAxisExtremes);
}

function onAfterSetExtremes(scope: any, $event): void {
    // NOTE: We make this check is in the case of zoomed in charts the onAfterSetExtremes is called.
    // Which we dont need to handle and we return early.
    if (!scope.chart) {
        return;
    }
    formatHighchartAxisLabels(scope, scope.chart);
    saveChartExtremes(scope);
    if ($event.trigger && $event.trigger === 'zoom') {
        scope.viz.getModel().isZoomedIn($event.userMax || $event.userMin);
    }
}

function bringSelectedSeriesToFront(point: any): void {
    if (point && point.series && point.series.group) {
        point.series.group.toFront();
    }
}

function getHighchartOnSeriesClickHandler(
    shouldBringSelectedSeriesToFront: boolean,
    scope: any,
    $container: JQuery
) {
    let func = ($event) => onSeriesClick(scope, $container, $event);
    return (evt, color, name) => {
        safeApply(scope, () => {
            if (shouldBringSelectedSeriesToFront) {
                // If this is a click on point of a serie in a multi-series chart,
                // bring that serie to front.
                bringSelectedSeriesToFront(evt.point);
            }
            func(evt);
        });
    };
}

function getGeoChartData(scope: any, chartModel: ChartModel, $chartContent: JQuery): GeoMapData {
    let geoConfig,
        xAxisColumns = chartModel.getXAxisColumns();
    if (logger === void 0) {
        logger = Logger.create('chart-ui-utils');
    }

    // TODO (sunny): get callosum to support composite POINT type
    // and remove this conditional logic
    switch (xAxisColumns.length) {
        case 1:
            geoConfig = xAxisColumns[0].getGeoConfig();
            break;
        case 2:
            geoConfig = new GeoConfig({
                type: jsonConstants.geoConfigType.POINT
            });
            break;
        default:
            logger.error('<=2 x-axis columns expected for geo charts');
            return;
    }

    let series = chartModel.getSeries();
    let yAxisColumns = chartModel.getYAxisColumns();
    let multipleYAxes = yAxisColumns.length > 1 && !chartModel.isYAxisShared();
    yAxisColumns.forEach((yAxisColumn, columnIndex) => {
        let metricDefinition = yAxisColumn.getMetricsDefinition();
        if (!metricDefinition) {
            return;
        }

        let serie = multipleYAxes ? series[columnIndex] : series[0];
        // TODO (sunny): handle shared y-axes with conflicting metrics
        serie.data.forEach((dataRow) => {
            let color = metricDefinition.getColorForValue(dataRow.y);
            if (color !== null) {
                dataRow.color = color;
            } else {
                delete dataRow.color;
            }
        });
    });

    let geoObjects = chartModel.getGeoObjects();

    return {
        geoConfig: geoConfig,
        series: series,
        geoObjects: geoObjects,
        labelFormatters: {
            x: (xValue, seriesIndex) => {
                return {
                    name: chartModel.getXAxisColumns().map('getName').join(', '),
                    value: chartModel.getXAxisLabelAt(xValue, void 0, void 0)
                };
            },
            y: (yValue, seriesIndex) => {
                let yAxisColumns = chartModel.getYAxisColumns(),
                    yAxisColumn;
                if (yAxisColumns.length === 1) {
                    yAxisColumn = yAxisColumns[0];
                } else {
                    yAxisColumn = yAxisColumns[seriesIndex];
                }

                let formattedValue = null;
                if (yAxisColumn.isEffectivelyNumeric()) {
                    formattedValue = chartModel.getYAxisLabel({
                        yAxisColumn: yAxisColumn,
                        y: yValue
                    });
                } else {
                    formattedValue = chartModel.getYAxisLabelForAttribute(yAxisColumn, yValue);
                }

                return {
                    name: yAxisColumn.getName(),
                    value: formattedValue
                };
            },
            z: (zValue, seriesIndex) => {
                let radialColumn = chartModel.getRadialColumn();
                if (!radialColumn) {
                    return null;
                }
                return {
                    name: radialColumn.getName(),
                    value: radialColumn.getDataFormatter()(zValue)
                };
            }
        }
    };
}

function selectChartPoint($svgPoint: JQuery, point: any, chartType: string): void {
    if (!point.select) {
        return;
    }

    let selectionColor = util.lightenDarkenColor(point.series.color || '#777', -30);
    switch (chartType) {
        case chartTypeSpecificationService.chartTypes.LINE:
        case chartTypeSpecificationService.chartTypes.AREA:
        case chartTypeSpecificationService.chartTypes.PARETO:
            point.select(true);
            break;
        case chartTypeSpecificationService.chartTypes.BUBBLE:
            let d = $svgPoint.attr('d');
            point.select(true);
            $svgPoint.attr('stroke-width', 0).attr('d', d).attr('fill', selectionColor);
            break;
        default:
            point.select(true);
            $svgPoint.attr('stroke-width', '1').attr('fill', selectionColor);
    }
}

function deselectChartPoint(point) {
    // SCAL-6200: if for some reason the chart goes away
    // without the context menu closing the point object
    // will be cleared up causing this to throw.
    if (point.select) {
        point.select(false);
    }
}

function cloneHighchartsPoint(point) {
    let pointClone = {
        x: point.x,
        y: point.y,
        z: point.z,
        categoryName: point.categoryName,
        series: point.series
    };
    return pointClone;
}

/**
 * The implementation of the series filtered click for context menu.
 * @param scope
 * @param $chartContainer
 * @param evt
 */
function onSeriesClick(scope: any, $chartContainer: JQuery, evt: any): void {
    let chartModel: ChartModel = scope.viz.getModel();

    // Point close is used here as some of the call below can modify the values
    // and break context menu down scenarios.
    let pointClone = cloneHighchartsPoint(evt.point);
    let selectedPoints = (!!scope.chart.getSelectedPoints
        ? scope.chart.getSelectedPoints()
        : []).map(cloneHighchartsPoint);

    let contextMenuInput = getInputForChartContextMenu(
        chartModel,
        pointClone,
        selectedPoints,
        chartModel.getQuestion().getIsChasmTrapQuery()
    );

    let offset = $chartContainer.offset(),
        contextMenuConfig = {
            clickedPosition: {
                left: evt.chartX + offset.left,
                top: evt.chartY + offset.top
            },
            onClose: () => {
                deselectChartPoint(pointClone);
            },
            subMenuItems: contextMenuInput.menuItems
        };

    selectChartPoint($(evt.target), pointClone, scope.getChartType());
    vizContextMenuLauncher.launch({
        config: contextMenuConfig,
        data: {
            drillInput: contextMenuInput,
            columnValuePairs: contextMenuInput.clickedPoint.filteredValues,
            unfilteredColumns: contextMenuInput.clickedPoint.unfilteredValues,
            // For pinboard viz, we want the ansModel of this viz, not of pinboard.
            // and we don't have that as of now. So we pass null.
            documentModel:
                chartModel.isPinboardViz() ? null : chartModel.getContainingAnswerModel(),
            sageClient: scope.sageClient,
            vizModel: scope.viz.getModel()
        }
    });
}
