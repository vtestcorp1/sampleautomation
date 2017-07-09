
/**
* Copyright: ThoughtSpot Inc. 2013
* Author: Vibhor Nanavati (vibhor@thoughtspot.com)
*
* @fileoverview Theme packages to decorate various components of the chart.
*/
import {ColorPalette} from '../../../../base/base-types/color-palette';
import {Provide} from '../../../../base/decorators';
import {FontFaceCSSStyle} from '../../../../base/font-face';
import {CustomizableChartFeature, CustomStylingConfig}
    from '../../../custom-styling/custom-style-config';
import {CustomStylingService} from '../../../custom-styling/custom-styling-service';

@Provide('chartThemeService')
export class ChartThemeService {
    public static getDefaultTheme() {
        let customStyleConfig: CustomStylingConfig = CustomStylingService.getConfig();

        let areaChartFontStyle: FontFaceCSSStyle = customStyleConfig.getChartFontFace(
            CustomizableChartFeature.AREA_CHART
        ).toStyle();

        let areaChartStyle: any = <any>areaChartFontStyle;
        areaChartStyle.textShadow = 'none';

        let barChartFontStyle: FontFaceCSSStyle = customStyleConfig.getChartFontFace(
            CustomizableChartFeature.BAR_CHART
        ).toStyle();

        let columnChartFontStyle: FontFaceCSSStyle = customStyleConfig.getChartFontFace(
            CustomizableChartFeature.COLUMN_CHART
        ).toStyle();

        let lineChartFontStyle: FontFaceCSSStyle = customStyleConfig.getChartFontFace(
            CustomizableChartFeature.LINE_CHART
        ).toStyle();

        let pieChartFontStyle: FontFaceCSSStyle = customStyleConfig.getChartFontFace(
            CustomizableChartFeature.PIE_CHART
        ).toStyle();

        let scatterChartFontStyle: FontFaceCSSStyle = customStyleConfig.getChartFontFace(
            CustomizableChartFeature.SCATTER_CHART
        ).toStyle();

        let tooltipFontStyle: FontFaceCSSStyle = customStyleConfig.getChartFontFace(
            CustomizableChartFeature.TOOLTIP
        ).toStyle();

        let tooltipStyle: any = <any>tooltipFontStyle;
        tooltipStyle.padding = '15px';

        let xAxisLabelFontStyle: FontFaceCSSStyle = customStyleConfig.getChartFontFace(
            CustomizableChartFeature.X_AXIS_LABEL
        ).toStyle();

        let xAxisLabelStyle: any = <any>xAxisLabelFontStyle;
        // TODO (sunny): Does this even work?
        xAxisLabelStyle.WebkitFontSmoothing = 'antialiased';
        xAxisLabelStyle.whiteSpace = 'nowrap';

        let xAxisTitleFontStyle: FontFaceCSSStyle = customStyleConfig.getChartFontFace(
            CustomizableChartFeature.X_AXIS_TITLE
        ).toStyle();

        let yAxisLabelFontStyle: FontFaceCSSStyle = customStyleConfig.getChartFontFace(
            CustomizableChartFeature.Y_AXIS_LABEL
        ).toStyle();

        let yAxisTitleFontStyle: FontFaceCSSStyle = customStyleConfig.getChartFontFace(
            CustomizableChartFeature.Y_AXIS_TITLE
        ).toStyle();

        let colorPalettes: ColorPalette[] = customStyleConfig.getChartColorPalettes();
        let cssColorPalettes: string [][] = colorPalettes.map(
            (palette: ColorPalette) => palette.getCssColors()
        );

        let lessColors: string[] = cssColorPalettes[0];
        let moreColors: string[] = cssColorPalettes[1] || lessColors;
        let alphaColors: string[] = lessColors.map(
            (color: string) => chroma(color).alpha(0.5).css()
        );


        return {
            chart: {
                spacingTop: 15,
                spacingLeft: 3,
                spacingRight: 3,
                spacingBottom: 0,
                backgroundColor: '',
                resetZoomButton: {
                    theme: {
                        style: {
                            display: 'none'
                        }
                    }
                }
            },
            lessColors: lessColors,
            moreColors: moreColors,
            alphaColors: alphaColors,
            credits: {
                enabled: false
            },
            plotOptions: {
                areaspline: {
                    fillOpacity: 0.2,
                    marker: {
                        enabled: false
                    },
                    dataLabels: {
                        enabled: true,
                        style: areaChartStyle
                    }
                },
                bar: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        style: barChartFontStyle
                    }
                },
                column: {
                    states: {
                        hover: {
                            brightness: 0.16
                        }
                    },
                    dataLabels: {
                        enabled: true,
                        style: columnChartFontStyle
                    }
                },
                line: {
                    lineWidth: 1,
                    marker: {
                        enabled: false,
                        symbol: 'square'
                    },
                    dataLabels: {
                        enabled: true,
                        style: lineChartFontStyle
                    }
                },
                pie: {
                    cursor: 'pointer',
                    dataLabels: {
                        style: pieChartFontStyle
                    },
                    showInLegend: true
                },
                scatter: {
                    marker: {
                        symbol: 'circle',
                        radius: 5,
                        lineWidth: 1
                    },
                    dataLabels: {
                        enabled: true,
                        style: scatterChartFontStyle
                    }
                },
                series: {
                    animation: false,
                    dataGrouping: {
                        enabled: false
                    },
                    cursor: 'pointer',
                    shadow: false,
                    zoneAxis: 'x'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderWidth: 1,
                style: tooltipStyle,
                shadow: true
            },
            xAxis: {
                gridLineColor: 'transparent',
                labels: {
                    style: xAxisLabelStyle,
                    y: 20,
                    autoRotationLimit: 60,
                    padding: 15
                },
                title: {
                    style: xAxisTitleFontStyle,
                    margin: 10
                }
            },
            yAxis: {
                gridLineColor: '#e0e0e0',
                gridLineWidth: 1,
                gridLineDashStyle: 'Solid',
                minPadding: 0,
                tickColor: 'red',
                tickLength: 0,
                tickWidth: 0,
                tickPosition: 'outside',
                lineWidth:0,
                labels: {
                    style: yAxisLabelFontStyle
                },
                title: {
                    style: yAxisTitleFontStyle
                }
            }
        };
    }

    public static useDefaultTheme() {
        let theme = ChartThemeService.getDefaultTheme();
        (<any>window).Highcharts.theme = theme;
        (<any>window).Highcharts.setOptions((<any>window).Highcharts.theme);
    }
}
