/**
* Copyright: ThoughtSpot Inc. 2012-2016
* Author: Shashank Singh (sunny@thoughtspot.com)
*
* @fileoverview A model for custom style config stored in the backend.
*/

import {Provide} from '../../base/decorators';
import Color = Chroma.Color;
import {blinkConstants} from 'src/base/blink-constants';
import {ColorPalette} from '../../base/base-types/color-palette';
import {BlobService} from '../../base/blob-service';
import {FontFace, FontFaceFormat} from '../../base/font-face';
import {strings} from '../../base/strings';


export enum AppLogoType {
    DEFAULT = 0,
    WIDE
}

export enum CustomizableChartFeature {
    X_AXIS_LABEL = 0,
    X_AXIS_TITLE,
    Y_AXIS_LABEL,
    Y_AXIS_TITLE,
    TOOLTIP,
    SCATTER_CHART,
    PIE_CHART,
    LINE_CHART,
    COLUMN_CHART,
    BAR_CHART,
    AREA_CHART,
    TAIL_FEATURE /* Not a real feature, used only for iteration over enum values */
}

export enum CustomizableTableFeature {
    CELL = 0,
    TAIL_FEATURE /* Not a real feature, used only for iteration over enum values */
}

export interface CustomStyleImage {
    guid: string;
}

export class CustomStyleBackground {
    public static fromJson(json: any): CustomStyleBackground {
        let color: Color = chroma(json.color);
        return new CustomStyleBackground(color);
    }

    constructor(public color: Color) {}

    public toJson(): any {
        return {
            color: this.color.css()
        };
    }
}

type FeatureIdToFontGuidMap = {[featureId: number /*CustomizableChartFeature*/]: string};
type AppLogoTypeToImage = {[appLogoType: number /*AppLogoType*/]: CustomStyleImage};

type FeatureIdToFontFaceMap = {[featureId: number /*CustomizableChartFeature*/]: FontFace};

@Provide('CustomStylingConfig')
export class CustomStylingConfig {


    // for upgrading configs on major structure changes
    // private static CURRENT_CONFIG_VERSION: number = 1;

    private static readonly primaryColors = [
        '#FF9419',
        '#F75534',
        '#E356C5',
        '#9450E6',
        '#3956CC',
        '#2D90E1',
        '#1AC5DB',
        '#46C27B'
    ];

    private static readonly multiHuePatterns = [
        /* tslint:disable:max-line-length */
        // YlOrRed
        ['#ffffb2', '#fddd87', '#fba35d', '#f75534', '#f9140a', '#d70315', '#b10026'],
        // blues
        ['#f7fbff', '#cfe0f9', '#a6c6f3', '#77aded', '#3295e6', '#287ac6', '#1e60a6', '#144888', '#08306b'],
        // YlGn
        ['#ffffe5', '#d5f0ca', '#abe1af', '#7dd295', '#46c27b', '#34a165', '#238150', '#11623c', '#004529'],
        // pink
        ['#f7f4f9', '#f5cfec', '#f1aadf', '#eb83d2', '#e356c5', '#c44198', '#a52c6d', '#861744', '#67001f'],
        // ylGnBu
        ['#ffffd9', '#d7f1da', '#abe2db', '#78d4db', '#1ac5db', '#2397b9', '#226c97', '#194377', '#081d58'],
        // Reds
        ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
        // Purples
        ['#fcfbfd', '#e6d0f8', '#cda6f3', '#b27ced', '#9450e6', '#7e3dcb', '#692bb0', '#541796', '#3f007d']
        /* tslint:enable:max-line-length */
    ];

    private static Defaults = {
        APP_LOGO_URL: 'resources/img/logo/TS-logo-nav.png',
        WIDE_APP_LOGO_URL: 'resources/img/logo/TS-logo-login.png',
        APP_FAVICON: 'resources/img/logo/favicon_3.ico',
        Table: {
            FONT_FAMILY: 'Regular, \'helvetica neue\', helvetica, Arial, sans-serif',
            FONT_SIZE: 14
        },
        Pivot: {
            HEATMAP_COLOR: '#109FFF'
        },
        Geo: {
            COLORS: {
                BUBBLE: CustomStylingConfig.primaryColors,
                AREA: CustomStylingConfig.multiHuePatterns
            },
        },
        Chart: {
            DEFAULT_FONT_FAMILY: 'RetinaMP-Book, Semibold, Lucida Grande, sans-serif',
            DEFAULT_FONT_SIZE: 12,
            DEFAULT_FONT_COLOR: '#131313',
            LIGHT_FONT_FAMILY: 'Regular, Lucida Grande, sans-serif',
            AXIS_FONT_SIZE: 13,
            AXIS_FONT_COLOR: '#333333',
            TOOLTIP_FONT_SIZE: 11,

            ColorPalette: {
                Small: {
                    COLORS: CustomStylingConfig.primaryColors
                },
                Large: {
                    COLORS: [
                        '#FF9419',
                        '#F75534',
                        '#E356C5',
                        '#9450E6',
                        '#3956CC',
                        '#2D90E1',
                        '#1AC5DB',
                        '#46C27B',
                        '#FFB866',
                        '#FF8269',
                        '#F589DD',
                        '#B282FA',
                        '#6782EB',
                        '#5DB1F5',
                        '#6CDAEB',
                        '#82D9A6',
                        '#F08418',
                        '#E63D17',
                        '#C23AA9',
                        '#7E3DC7',
                        '#2A40AD',
                        '#1775C2',
                        '#0AA7B5',
                        '#41A36C',
                        '#FFCE91',
                        '#FFAC9C',
                        '#FFB3F5',
                        '#C9AEFF',
                        '#93A7F5',
                        '#85C8FF',
                        '#98E7F5',
                        '#ABEBBF',
                        '#CC6308',
                        '#BF3115',
                        '#9C2E8B',
                        '#612DA1',
                        '#172791',
                        '#095EA3',
                        '#098F97',
                        '#42855F',
                        '#FFE5BF',
                        '#FFCCC2',
                        '#FFCCF4',
                        '#DBCAFD',
                        '#B0C0FF',
                        '#A6D7FF',
                        '#B5EEF5',
                        '#C6F8CE',
                        '#A84900',
                        '#A11C01',
                        '#732267',
                        '#471D7A',
                        '#0C157A',
                        '#024A85',
                        '#026C6E',
                        '#386643'
                    ]
                }
            }
        },
        AppBackground: {
            COLOR: '#eef1f4'
        },
        PAGE_TITLE: strings.Page_title
    };

    private tableFeatureToDefaultFontFace: FeatureIdToFontFaceMap = {};
    private chartFeatureToDefaultFontFace: FeatureIdToFontFaceMap = {};
    private defaultColors: Color[][] = null;

    public static getAllCustomizableTableFeatures(): CustomizableTableFeature[] {
        let features: CustomizableTableFeature[] = [];

        for (let feature: CustomizableTableFeature = CustomizableTableFeature.CELL;
             feature < CustomizableTableFeature.TAIL_FEATURE;
             ++feature) {
            features.add(feature);
        }
        return features;
    }

    public static getAllCustomizableChartFeatures(): CustomizableChartFeature[] {
        let features: CustomizableChartFeature[] = [];

        for (let feature: CustomizableChartFeature = CustomizableChartFeature.X_AXIS_LABEL;
             feature < CustomizableChartFeature.TAIL_FEATURE;
             ++feature) {
            features.add(feature);
        }
        return features;
    }

    public static fromJson(configJson: any): CustomStylingConfig {
        let version: number = configJson.version;

        let appLogoTypeToGuid: AppLogoTypeToImage = configJson.appLogoTypeToImage || {};

        let customFontFaces: FontFace[] = [];
        if (!!configJson.customFontFaces) {
            customFontFaces = configJson.customFontFaces.map(
                (customFontFace: any) => FontFace.fromJson(customFontFace)
            );
        }

        let chartFeatureToFontGuid: FeatureIdToFontGuidMap =
            configJson.chartFeatureToFontGuid || {};
        let tableFeatureToFontGuid: FeatureIdToFontGuidMap =
            configJson.tableFeatureToFontGuid || {};

        let appBackground: CustomStyleBackground = null;
        if (!!configJson.appBackground) {
            appBackground = CustomStyleBackground.fromJson(configJson.appBackground);
        }

        let footerText: string = '';

        if (!!configJson.footerText && !!configJson.footerText) {
            footerText = configJson.footerText;
        }

        let chartColorsPalettes: ColorPalette[] = [];
        if (configJson.chartColorPalettes) {
            chartColorsPalettes = configJson.chartColorPalettes.map(
                (colorPalette: any) => ColorPalette.fromJson(colorPalette)
            );
        }

        let pageTitle: string = CustomStylingConfig.Defaults.PAGE_TITLE;

        if (!!configJson.pageTitle) {
            pageTitle = configJson.pageTitle;
        }

        return new CustomStylingConfig(
            version,
            customFontFaces,
            appLogoTypeToGuid,
            chartFeatureToFontGuid,
            tableFeatureToFontGuid,
            appBackground,
            footerText,
            chartColorsPalettes,
            pageTitle
        );
    }

    public static convertChartFeatureToLabel(feature: CustomizableChartFeature): string {
        let constantsRoot: any = blinkConstants
            .styleCustomizer
            .customizableFeatures
            .chart;

        switch (feature) {
            case CustomizableChartFeature.X_AXIS_LABEL:
                return constantsRoot.X_AXIS_LABEL;
            case CustomizableChartFeature.X_AXIS_TITLE:
                return constantsRoot.X_AXIS_TITLE;
            case CustomizableChartFeature.Y_AXIS_LABEL:
                return constantsRoot.Y_AXIS_LABEL;
            case CustomizableChartFeature.Y_AXIS_TITLE:
                return constantsRoot.Y_AXIS_TITLE;
            case CustomizableChartFeature.TOOLTIP:
                return constantsRoot.TOOLTIP;
            case CustomizableChartFeature.SCATTER_CHART:
                return constantsRoot.SCATTER_CHART;
            case CustomizableChartFeature.PIE_CHART:
                return constantsRoot.PIE_CHART;
            case CustomizableChartFeature.LINE_CHART:
                return constantsRoot.LINE_CHART;
            case CustomizableChartFeature.COLUMN_CHART:
                return constantsRoot.COLUMN_CHART;
            case CustomizableChartFeature.BAR_CHART:
                return constantsRoot.BAR_CHART;
            case CustomizableChartFeature.AREA_CHART:
                return constantsRoot.AREA_CHART;
            default:
                return null;
        }
    }

    public static covertTableFeatureToLabel(feature: CustomizableTableFeature): string {
        let constantsRoot: any = blinkConstants
            .styleCustomizer
            .customizableFeatures
            .table;

        switch (feature) {
            case CustomizableTableFeature.CELL:
                return constantsRoot.CELL;
            default:
                return null;
        }
    }

    public static getPivotHeatmapColor() : Color {
        return chroma(CustomStylingConfig.Defaults.Pivot.HEATMAP_COLOR);
    }

    public static getGeoBubbleColors(): string[] {
        return CustomStylingConfig.Defaults.Geo.COLORS.BUBBLE;
    }

    public static getGeoAreaColors(): string[][] {
        return CustomStylingConfig.Defaults.Geo.COLORS.AREA;
    }

    private static createNewDefaultTableFontFace(tableFeature: CustomizableTableFeature): FontFace {
        let fontFace: FontFace = new FontFace(
            null,
            CustomStylingConfig.Defaults.Table.FONT_FAMILY,
            FontFaceFormat.WOFF,
            null
        );

        fontFace.size = CustomStylingConfig.Defaults.Table.FONT_SIZE;

        return fontFace;
    }

    private static createNewDefaultChartFontFace(chartFeature: CustomizableChartFeature): FontFace {
        let fontFace: FontFace = new FontFace(
            null,
            CustomStylingConfig.Defaults.Chart.DEFAULT_FONT_FAMILY,
            FontFaceFormat.WOFF
        );
        fontFace.color = chroma(CustomStylingConfig.Defaults.Chart.DEFAULT_FONT_COLOR);
        fontFace.size = CustomStylingConfig.Defaults.Chart.DEFAULT_FONT_SIZE;

        switch (chartFeature) {
            case CustomizableChartFeature.TOOLTIP:
                fontFace.family = CustomStylingConfig.Defaults.Chart.LIGHT_FONT_FAMILY;
                fontFace.size = CustomStylingConfig.Defaults.Chart.TOOLTIP_FONT_SIZE;
                break;
            case CustomizableChartFeature.X_AXIS_TITLE:
            case CustomizableChartFeature.Y_AXIS_TITLE:
                fontFace.family = CustomStylingConfig.Defaults.Chart.LIGHT_FONT_FAMILY;
                fontFace.color = chroma(CustomStylingConfig.Defaults.Chart.AXIS_FONT_COLOR);
                fontFace.size = CustomStylingConfig.Defaults.Chart.AXIS_FONT_SIZE;
                break;
        }

        return fontFace;
    }

    private static sortChartColorPalettes(colorPalettes: ColorPalette[]): void {
        colorPalettes.sort(
            (colorPaletteA: ColorPalette, colorPaletteB: ColorPalette) => {
                return colorPaletteA.getColors().length
                    - colorPaletteB.getColors().length;
            }
        );

    }

    constructor(private version: number,
                private customFontFaces: FontFace[],
                private appLogoTypeToImage: AppLogoTypeToImage = {},
                private chartFeatureToFontGuid: FeatureIdToFontGuidMap = {},
                private tableFeatureToFontGuid: FeatureIdToFontGuidMap = {},
                private appBackground: CustomStyleBackground = null,
                private footerText: string = null,
                private chartColorPalettes: ColorPalette[] = [],
                private pageTitle: string = null) {

        // populate default fonts for all chart and table features
        CustomStylingConfig.getAllCustomizableTableFeatures().map(
            (tableFeature: CustomizableTableFeature) => {
                this.tableFeatureToDefaultFontFace[tableFeature]
                    = CustomStylingConfig.createNewDefaultTableFontFace(tableFeature);
            }
        );

        CustomStylingConfig.getAllCustomizableChartFeatures().map(
            (chartFeature: CustomizableChartFeature) => {
                this.chartFeatureToDefaultFontFace[chartFeature]
                    = CustomStylingConfig.createNewDefaultChartFontFace(chartFeature);
            }
        );

        let defaultColorCodes: string[][] = [
            CustomStylingConfig.Defaults.Chart.ColorPalette.Small.COLORS,
            CustomStylingConfig.Defaults.Chart.ColorPalette.Large.COLORS
        ];

        this.defaultColors = defaultColorCodes.map(
            (colorCodes: string[]) => {
                return colorCodes.map(
                    (colorCode: string) => chroma(colorCode)
                );
            }
        );

        CustomStylingConfig.sortChartColorPalettes(this.chartColorPalettes);

    }

    public getAllCustomFontFaces(): FontFace[] {
        return this.customFontFaces.slice(0);
    }

    public getAppLogoImageGuid(appLogoType: AppLogoType): string {
        let customImage: CustomStyleImage = this.appLogoTypeToImage[appLogoType];
        if (!!customImage) {
            return customImage.guid;
        }
        return null;
    }

    public getAppLogoUrl(appLogoType: AppLogoType): string {
        let customLogoImage: CustomStyleImage = this.appLogoTypeToImage[appLogoType];
        if (!!customLogoImage) {
            return BlobService.getBlobUrl(customLogoImage.guid);
        }

        switch (appLogoType) {
            case AppLogoType.WIDE:
                return CustomStylingConfig.Defaults.WIDE_APP_LOGO_URL;
            default:
                return CustomStylingConfig.Defaults.APP_LOGO_URL;
        }
    }

    public setAppLogoImageGuid(appLogoImageGuid: string, appLogoType: AppLogoType): void {
        this.appLogoTypeToImage[appLogoType] = {
            guid: appLogoImageGuid
        };
    }

    public resetAppLogoImage(appLogoType: AppLogoType): void {
        delete this.appLogoTypeToImage[appLogoType];
    }

    public getFaviconUrl(appLogoType: AppLogoType): string {
        let customLogoImage: CustomStyleImage = this.appLogoTypeToImage[appLogoType];
        if (!!customLogoImage) {
            return BlobService.getBlobUrl(customLogoImage.guid);
        }
        return CustomStylingConfig.Defaults.APP_FAVICON;

    }

    public getTableFontFace(tableFeature: CustomizableTableFeature): FontFace {
        if (!!this.tableFeatureToFontGuid) {
            let fontGuid: string = this.tableFeatureToFontGuid[tableFeature];
            if (!!fontGuid) {
                return this.getFontFaceForGuid(fontGuid);
            }
        }
        return this.tableFeatureToDefaultFontFace[tableFeature];
    }

    public setTableFont(fontFace: FontFace,
                        tableFeature: CustomizableTableFeature): void {
        if (!!fontFace.guid) {
            this.addOrUpdateFontFace(fontFace);
        }
        this.tableFeatureToFontGuid[tableFeature] = fontFace.guid;
    }

    public resetTableFonts(): void {
        this.tableFeatureToFontGuid = {};
    }

    public getChartFontFace(chartFeature: CustomizableChartFeature): FontFace {
        if (!!this.chartFeatureToFontGuid) {
            let fontGuid: string = this.chartFeatureToFontGuid[chartFeature];
            if (!!fontGuid) {
                return this.getFontFaceForGuid(fontGuid);
            }
        }
        return this.chartFeatureToDefaultFontFace[chartFeature];
    }

    public setChartFont(fontFace: FontFace,
                        chartFeature: CustomizableChartFeature): void {
        if (!!fontFace.guid) {
            this.addOrUpdateFontFace(fontFace);
        }
        this.chartFeatureToFontGuid[chartFeature] = fontFace.guid;
    }

    public resetChartFonts(): void {
        this.chartFeatureToFontGuid = {};
    }

    public addOrUpdateFontFace(fontFace: FontFace): void {
        // local default fonts can be available for the user
        // to choose but they are not persisted as custom
        // fonts.
        if (fontFace.isLocal()) {
            return;
        }

        this.customFontFaces.remove(function(existingFontFace: FontFace){
            return fontFace.guid === existingFontFace.guid;
        });
        this.customFontFaces.unshift(fontFace);
    }

    public getAppBackground(): CustomStyleBackground {
        if (!!this.appBackground) {
            return this.appBackground;
        }
        return CustomStyleBackground.fromJson({
            color: CustomStylingConfig.Defaults.AppBackground.COLOR
        });
    }

    public setAppBackground(appBackground: CustomStyleBackground): void {
        this.appBackground = appBackground;
    }

    public resetAppBackground(): void {
        this.appBackground = null;
    }

    public getFooterText(): string {
        return this.footerText;
    }

    public setFooterText(footerText: string): void {
        this.footerText = footerText;
    }

    public resetFooterText(): void {
        this.footerText = '';
    }

    public getChartColorPalettes(): ColorPalette[] {
        // NOTE: We want to ensure that the colors used from custom template is always corrected to
        // the same size as the default template.
        if (this.chartColorPalettes && this.chartColorPalettes.length > 0) {
            this.chartColorPalettes.forEach((palette, index) => {
                palette.sanitizeColors(this.defaultColors[index]);
            });

            return this.chartColorPalettes;
        }
        return this.defaultColors.map(
            (defaultColorList: Color[]) => new ColorPalette(defaultColorList)
        );
    }

    public setChartColorPalettes(colorPalettes: ColorPalette[]) {
        this.chartColorPalettes = colorPalettes;
        CustomStylingConfig.sortChartColorPalettes(this.chartColorPalettes);
    }

    public resetChartColorPalettes(): void {
        this.chartColorPalettes = [];
    }

    public getPageTitle(): string {
        return this.pageTitle;
    }

    public setPageTitle(pageTitle: string): void {
        this.pageTitle = pageTitle;
    }

    public resetPageTitle(): void {
        this.pageTitle = strings.Page_title;
    }

    public toJson(): any {
        let fontFaceJson: any = this.customFontFaces.map(
            function(customFontFace: FontFace){
                return customFontFace.toJson();
            }
        );

        let chartColorPaletteJson: any = this.chartColorPalettes.map(
            (chartColorPalette: ColorPalette) => chartColorPalette.toJson()
        );

        let appBackground: any = this.appBackground
            ? this.appBackground.toJson() : null;

        return {
            appLogoTypeToImage: this.appLogoTypeToImage,
            customFontFaces: fontFaceJson,
            chartFeatureToFontGuid: this.chartFeatureToFontGuid,
            tableFeatureToFontGuid: this.tableFeatureToFontGuid,
            appBackground: appBackground,
            footerText: this.footerText,
            chartColorPalettes: chartColorPaletteJson,
            pageTitle: this.pageTitle
        };
    }

    private getFontFaceForGuid(guid: string): FontFace {
        if (!guid || !this.customFontFaces) {
            return null;
        }
        return this.customFontFaces.find(function(fontFace: FontFace){
            return fontFace.guid === guid;
        }) || null;
    }
}
