/**
* Copyright: ThoughtSpot Inc. 2012-2016
* Author: Shashank Singh (sunny@thoughtspot.com)
*
* @fileoverview The component to allow the user to configure different parameters affecting
* the app L&F.
*/


import {BaseComponent} from '../../base/base-types/base-component';
import {BlobType} from '../../base/blob-service';
import {Component, ngRequire} from '../../base/decorators';
import {FontFace} from '../../base/font-face';
import {
    MultiFontSelectorComponent,
    MultiFontSelectorItem
} from '../../common/widgets/fonts/multi-font-selector/multi-font-selector-component';
import {
    IMultiSectionListItemComponent,
    MultiSectionListItemComponent
    // tslint:disable-next-line
} from '../../common/widgets/multi-section-list/multi-section-list-item/multi-section-list-item-component';
import {
    AppLogoType, CustomizableChartFeature, CustomizableTableFeature,
    CustomStyleBackground, CustomStylingConfig
} from './custom-style-config';
import Color = Chroma.Color;
import IPromise = angular.IPromise;
import _ from 'lodash';
import {blinkConstants} from 'src/base/blink-constants';
import {ColorPalette} from '../../base/base-types/color-palette';
// tslint:disable-next-line
import {ImageBlobEditorComponent} from '../../common/widgets/blob/image-blob-editor/image-blob-editor-component';
// tslint:disable-next-line
import {ColorPaletteListEditorComponent} from '../../common/widgets/color-palette/color-palette-list-editor/color-palette-list-editor-component';
// tslint:disable-next-line
import {MultiSectionListComponent} from '../../common/widgets/multi-section-list/multi-section-list-component';
// tslint:disable-next-line
import {BackgroundConfiguratorComponent} from '../../common/widgets/style-configuration/background-configurator/background-configurator-component';
// tslint:disable-next-line
import {TextBoxConfiguratorComponent} from '../../common/widgets/text-box-customizer/text-box-configurator-component';
import {CustomStylingService} from './custom-styling-service';


let env: any = ngRequire('env');
let Logger: any = ngRequire('Logger');
let sessionService: any = ngRequire('sessionService');
let UserAction: any = ngRequire('UserAction');
let alertService: any = ngRequire('alertService');

class CustomStyleListItem
extends BaseComponent
implements IMultiSectionListItemComponent {
    constructor(private sectionName: string,
                private sectionComponent: BaseComponent,
                private sectionSubtext: string = '',
                private actionLabel: string = '',
                private actionHandler: () => void) {
        super();
    }

    public getItemName(): string {
        return this.sectionName;
    }

    public getActionLabel(): string {
        return this.actionLabel;
    }

    public getItemSubtext(): string {
        return this.sectionSubtext;
    }

    public getItemContentComponent(): BaseComponent {
        return this.sectionComponent;
    }

    public handleAction(): void {
        this.actionHandler();
    }
}

abstract class BaseMultiFontSelectorItem implements MultiFontSelectorItem {
    constructor(private selectedFontFace: FontFace,
                private selectionChangeHandler:(fontFace: FontFace) => angular.IPromise<void>) {}

    abstract getLabel(): string;

    public getSelectedFontFace(): FontFace {
        return this.selectedFontFace;
    }

    public setSelectedFontFace(fontFace: FontFace): angular.IPromise<void> {
        this.selectedFontFace = fontFace;
        return this.selectionChangeHandler(this.selectedFontFace);
    }
}

class ChartMultiFontSelectorItem extends BaseMultiFontSelectorItem {
    constructor(private chartFeature: CustomizableChartFeature,
                selectedFontFace: FontFace,
                selectionChangeHandler:(fontFace: FontFace) => angular.IPromise<void>) {
        super(selectedFontFace, selectionChangeHandler);
    }

    public getLabel(): string {
        return CustomStylingConfig.convertChartFeatureToLabel(
            this.chartFeature
        );
    }

    public getFeature(): CustomizableChartFeature {
        return this.chartFeature;
    }
}

class TableMultiFontSelectorItem extends BaseMultiFontSelectorItem {
    constructor(private tableFeature: CustomizableTableFeature,
                selectedFontFace: FontFace,
                selectionChangeHandler:(fontFace: FontFace) => angular.IPromise<void>) {
        super(selectedFontFace, selectionChangeHandler);
    }

    public getLabel(): string {
        return CustomStylingConfig.covertTableFeatureToLabel(
            this.tableFeature
        );
    }

    public getFeature(): CustomizableTableFeature {
        return this.tableFeature;
    }
}

@Component({
    name: 'bkStyleCustomizer',
    templateUrl: 'src/modules/custom-styling/style-customizer.html',
    directives: [MultiSectionListComponent, MultiSectionListItemComponent]
})
export class StyleCustomizerComponent {

    private static MIN_COLOR_PALETTES: number = 2;
    private static MIN_CHART_COLOR_PALETTE_SIZE: number = 12;

    private logger: any = Logger.create(
        'style-customizer-component'
    );
    private config: CustomStylingConfig = null;

    private defaultAppLogoSelectorListItem: CustomStyleListItem;
    private wideAppLogoSelectorListItem: CustomStyleListItem;
    private chartFontSelectorListItem: CustomStyleListItem;
    private tableFontSelectorListItem: CustomStyleListItem;
    private appBackgroundSelectorListItem: CustomStyleListItem;
    private footerTextSelectorListItem: CustomStyleListItem;
    private chartColorPalettesEditorListItem: CustomStyleListItem;
    private pageTitleSelectorListItem: CustomStyleListItem;

    private chartMultiFontSelector: MultiFontSelectorComponent<ChartMultiFontSelectorItem>;
    private tableMultiFontSelector: MultiFontSelectorComponent<TableMultiFontSelectorItem>;
    private debouncedPersistConfig = _.debounce(this.persistConfig, 500);

    constructor(config: CustomStylingConfig) {
        this.setConfig(config);
    }

    public isFontCustomizationEnabled(): boolean {
        if (!!env.customBrandingFontCustomizationEnabled) {
            return true;
        }
        return sessionService.isFontStyleCustomizationEnabled();
    }

    public getAppLogoSelectorListItem(): CustomStyleListItem {
        return this.defaultAppLogoSelectorListItem;
    }

    public getWideAppLogoSelectorListItem(): CustomStyleListItem {
        return this.wideAppLogoSelectorListItem;
    }

    public getChartFontSelectorListItem(): CustomStyleListItem {
        return this.chartFontSelectorListItem;
    }

    public getTableFontSelectorListItem(): CustomStyleListItem {
        return this.tableFontSelectorListItem;
    }

    public getAppBackgroundSelectorListItem(): CustomStyleListItem {
        return this.appBackgroundSelectorListItem;
    }

    public getFooterTextListItem(): CustomStyleListItem {
        return this.footerTextSelectorListItem;
    }

    public getChartColorPalettesEditorListItem(): CustomStyleListItem {
        return this.chartColorPalettesEditorListItem;
    }

    public getPageTitleListItem(): CustomStyleListItem {
        return this.pageTitleSelectorListItem;
    }

    private setConfig(config: CustomStylingConfig): void {
        this.config = config;

        this.defaultAppLogoSelectorListItem = null;
        this.chartFontSelectorListItem = null;
        this.tableFontSelectorListItem = null;
        this.footerTextSelectorListItem = null;
        this.chartColorPalettesEditorListItem = null;
        this.pageTitleSelectorListItem = null;

        this.chartMultiFontSelector = null;
        this.tableMultiFontSelector = null;

        if (config === null) {
            return;
        }

        let constantsRoot: any = blinkConstants
            .styleCustomizer;

        this.defaultAppLogoSelectorListItem = this.getDefaultAppLogoCustomizer(
            config,
            constantsRoot
        );

        this.wideAppLogoSelectorListItem = this.getWideAppLogoCustomizer(
            config,
            constantsRoot
        );

        this.chartMultiFontSelector = this.getChartMultiFontSelector(
            config,
            constantsRoot
        );

        this.chartFontSelectorListItem = this.getChartFontCustomizer(
            this.chartMultiFontSelector,
            config,
            constantsRoot
        );

        this.tableMultiFontSelector = this.getTableMultiFontSelector(
            config,
            constantsRoot
        );

        this.tableFontSelectorListItem = this.getTableFontCustomizer(
            this.tableMultiFontSelector,
            config,
            constantsRoot
        );

        this.appBackgroundSelectorListItem = this.getAppBackgroundCustomizer(
            config,
            constantsRoot
        );

        this.footerTextSelectorListItem = this.getFooterTextCustomizer(
            config,
            constantsRoot
        );

        this.chartColorPalettesEditorListItem = this.getChartColorPalettesCustomizer(
            config,
            constantsRoot
        );

        this.pageTitleSelectorListItem = this.getPageTitleCustomizer(
            config,
            constantsRoot
        );
    }

    private getDefaultAppLogoCustomizer(config: CustomStylingConfig,
                                        constantsRoot: any): CustomStyleListItem {
        let defaultAppLogoBlobComponent: ImageBlobEditorComponent = new ImageBlobEditorComponent(
            config.getAppLogoImageGuid(AppLogoType.DEFAULT),
            BlobType.IMAGE,
            config.getAppLogoUrl(AppLogoType.DEFAULT),
            (appLogoBlobGuid: string) => {
                this.handleAppLogoUpdate(
                    appLogoBlobGuid,
                    AppLogoType.DEFAULT
                );
            }
        );

        return new CustomStyleListItem(
            constantsRoot.appLogoSelector.HEADER,
            defaultAppLogoBlobComponent,
            constantsRoot.appLogoSelector.SUBTEXT,
            constantsRoot.resetButton.LABEL,
            () => {
                config.resetAppLogoImage(AppLogoType.DEFAULT);
                this.debouncedPersistConfig()
                    .then(
                        () => {
                            defaultAppLogoBlobComponent.setBlobGuid(
                                config.getAppLogoImageGuid(AppLogoType.DEFAULT)
                            );
                            defaultAppLogoBlobComponent.setDefaultImageUrl(
                                config.getAppLogoUrl(AppLogoType.DEFAULT)
                            );
                        }
                    );
            }
        );
    }

    private getWideAppLogoCustomizer(config: CustomStylingConfig,
                                     constantsRoot: any): CustomStyleListItem {

        let wideAppLogoBlobComponent: ImageBlobEditorComponent = new ImageBlobEditorComponent(
            config.getAppLogoImageGuid(AppLogoType.WIDE),
            BlobType.IMAGE,
            config.getAppLogoUrl(AppLogoType.WIDE),
            (wideAppLogoBlobGuid: string) => {
                this.handleAppLogoUpdate(
                    wideAppLogoBlobGuid,
                    AppLogoType.WIDE
                );
            }
        );

        return new CustomStyleListItem(
            constantsRoot.wideAppLogoSelector.HEADER,
            wideAppLogoBlobComponent,
            constantsRoot.wideAppLogoSelector.SUBTEXT,
            constantsRoot.resetButton.LABEL,
            () => {
                config.resetAppLogoImage(AppLogoType.WIDE);
                this.debouncedPersistConfig()
                    .then(
                        () => {
                            wideAppLogoBlobComponent.setBlobGuid(
                                config.getAppLogoImageGuid(AppLogoType.WIDE)
                            );
                            wideAppLogoBlobComponent.setDefaultImageUrl(
                                config.getAppLogoUrl(AppLogoType.WIDE)
                            );
                        }
                    );
            }
        );
    }

    private getChartMultiFontSelector(config: CustomStylingConfig,
                                      constantsRoot: any)
    : MultiFontSelectorComponent<ChartMultiFontSelectorItem> {

        const features: CustomizableChartFeature[]
            = CustomStylingConfig.getAllCustomizableChartFeatures();

        let multiFontSelectorItems: ChartMultiFontSelectorItem[] = features.map(
            feature => {
                return new ChartMultiFontSelectorItem(
                    feature,
                    config.getChartFontFace(feature),
                    (selectedFontFace: FontFace) => {
                        return this.handleChartFontChange(selectedFontFace, feature);
                    }
                );
            }
        );

        return new MultiFontSelectorComponent<ChartMultiFontSelectorItem>(
            multiFontSelectorItems,
            config.getAllCustomFontFaces(),
            (fontFace: FontFace) => {
                return this.handleFontAddOrUpdate(fontFace);
            }
        );
    }

    private getChartFontCustomizer(chartMultiFontSelector:
                                       MultiFontSelectorComponent<ChartMultiFontSelectorItem>,
                                   config: CustomStylingConfig,
                                   constantsRoot: any): CustomStyleListItem {
        return new CustomStyleListItem(
            constantsRoot.chartFontSelector.HEADER,
            chartMultiFontSelector,
            '', //subtext
            constantsRoot.resetButton.LABEL,
            () => {
                config.resetChartFonts();
                this.debouncedPersistConfig()
                    .then(
                        () => {
                            let selectedFeature: CustomizableChartFeature
                                = chartMultiFontSelector.getSelectedItem().getFeature();
                            chartMultiFontSelector.setSelectedFontFace(
                                this.config.getChartFontFace(selectedFeature)
                            );
                        }
                    );
            }
        );
    }

    private getTableMultiFontSelector(config: CustomStylingConfig,
                                      constantsRoot: any)
    : MultiFontSelectorComponent<TableMultiFontSelectorItem> {

        const features: CustomizableTableFeature[]
            = CustomStylingConfig.getAllCustomizableTableFeatures();

        let multiFontSelectorItems: TableMultiFontSelectorItem[] = features.map(
            feature => {
                return new TableMultiFontSelectorItem(
                    feature,
                    config.getTableFontFace(feature),
                    (selectedFontFace: FontFace) => {
                        return this.handleTableFontChange(selectedFontFace, feature);
                    }
                );
            }
        );

        return new MultiFontSelectorComponent<TableMultiFontSelectorItem>(
            multiFontSelectorItems,
            config.getAllCustomFontFaces(),
            (fontFace: FontFace) => {
                return this.handleFontAddOrUpdate(fontFace);
            }
        );
    }

    private getTableFontCustomizer(tableMultiFontSelector
                                       : MultiFontSelectorComponent<TableMultiFontSelectorItem>,
                                   config: CustomStylingConfig,
                                   constantsRoot: any): CustomStyleListItem {

        return new CustomStyleListItem(
            constantsRoot.tableFontSelector.HEADER,
            tableMultiFontSelector,
            '', //subtext
            constantsRoot.resetButton.LABEL,
            () => {
                config.resetTableFonts();
                this.debouncedPersistConfig()
                    .then(
                        () => {
                            let selectedFeature: CustomizableTableFeature
                                = tableMultiFontSelector.getSelectedItem().getFeature();
                            tableMultiFontSelector.setSelectedFontFace(
                                this.config.getTableFontFace(selectedFeature)
                            );
                        }
                    );
            }
        );
    }

    private getAppBackgroundCustomizer(config: CustomStylingConfig,
                                       constantsRoot: any): CustomStyleListItem {
        let appBackgroundConfigurator: BackgroundConfiguratorComponent;

        appBackgroundConfigurator = new BackgroundConfiguratorComponent(
            config.getAppBackground(),
            (updatedAppBackgroundStyle: CustomStyleBackground) => {
                return this.handleAppBackgroundChange(updatedAppBackgroundStyle);
            }
        );

        return new CustomStyleListItem(
            constantsRoot.appBackgroundSelector.HEADER,
            appBackgroundConfigurator,
            '', //subtext
            constantsRoot.resetButton.LABEL,
            () => {
                config.resetAppBackground();
                this.debouncedPersistConfig()
                    .then(
                        () => {
                            let backgroundColor: Color = this.config.getAppBackground().color;
                            appBackgroundConfigurator
                                .getColorConfiguratorComponent()
                                .setColorInstance(backgroundColor);
                        }
                    );
            }
        );
    }

    private getFooterTextCustomizer(config: CustomStylingConfig,
                                    constantsRoot: any): CustomStyleListItem {

        let footerTextConfigurator = new TextBoxConfiguratorComponent(
            config.getFooterText(),
            50,
            (footerText: string) => {
                this.handleFooterTextChange(footerText);
            }
        );

        return new CustomStyleListItem(
            constantsRoot.footerText.HEADER,
            footerTextConfigurator,
            '', //subtext
            constantsRoot.resetButton.LABEL,
            () => {
                config.resetFooterText();
                this.debouncedPersistConfig()
                    .then(
                        () => {
                            footerTextConfigurator.updateTextBoxValue();
                        }
                    );
            }
        );
    }

    private getChartColorPalettesCustomizer(config: CustomStylingConfig,
                                                constantsRoot: any): CustomStyleListItem {

        let colorPalettes: ColorPalette[] = config.getChartColorPalettes();

        let chartColorPaletteListEditor: ColorPaletteListEditorComponent
            = new ColorPaletteListEditorComponent(
            colorPalettes,
            StyleCustomizerComponent.MIN_COLOR_PALETTES,
            Number.POSITIVE_INFINITY,
            StyleCustomizerComponent.MIN_CHART_COLOR_PALETTE_SIZE,
            Number.POSITIVE_INFINITY,
            (updatedColorPalettes: ColorPalette[]) => {
                return this.handleChartColorPalettesChange(updatedColorPalettes);
            }
        );

        return new CustomStyleListItem(
            constantsRoot
                .chartColorPaletteEditor
                .HEADER,
            chartColorPaletteListEditor,
            '', //subtext
            constantsRoot.resetButton.LABEL,
            () => {
                config.resetChartColorPalettes();
                this.debouncedPersistConfig()
                    .then(
                        () => {
                            let chartColorPalettes: ColorPalette[]
                                = this.config.getChartColorPalettes();
                            chartColorPaletteListEditor.setColorPalettes(chartColorPalettes);
                        }
                    );
            }
        );
    }

    private getPageTitleCustomizer(config: CustomStylingConfig,
                                   constantsRoot: any): CustomStyleListItem {

        let pageTitleConfigurator = new TextBoxConfiguratorComponent(
            config.getPageTitle(),
            500,
            (pageTitle: string) => {
                this.handlePageTitleChange(pageTitle);
            }
        );

        return new CustomStyleListItem(
            constantsRoot.pageTitle.HEADER,
            pageTitleConfigurator,
            constantsRoot.pageTitle.SUBTEXT,
            constantsRoot.resetButton.LABEL,
            () => {
                config.resetPageTitle();
                this.debouncedPersistConfig()
                    .then(
                        () => {
                            pageTitleConfigurator.updateTextBoxValue();
                        }
                    );
            }
        );
    }

    private handleAppLogoUpdate(appLogoBlobGuid: string, appLogoType: AppLogoType): void {
        this.config.setAppLogoImageGuid(appLogoBlobGuid, appLogoType);
        this.debouncedPersistConfig();
    }

    private handleFontAddOrUpdate(fontFace: FontFace): angular.IPromise<void> {
        this.config.addOrUpdateFontFace(fontFace);
        this.chartMultiFontSelector.setAvailableFonts(
            this.config.getAllCustomFontFaces()
        );
        this.tableMultiFontSelector.setAvailableFonts(
            this.config.getAllCustomFontFaces()
        );
        return this.debouncedPersistConfig();
    }

    private handleTableFontChange(fontFace: FontFace,
                                  tableFeature: CustomizableTableFeature): angular.IPromise<void> {
        this.config.setTableFont(fontFace, tableFeature);
        return this.debouncedPersistConfig();
    }

    private handleChartFontChange(fontFace: FontFace,
                                  chartFeature: CustomizableChartFeature): angular.IPromise<void> {
        this.config.setChartFont(fontFace, chartFeature);
        return this.debouncedPersistConfig();
    }

    private handleAppBackgroundChange(appBackground: CustomStyleBackground):
    angular.IPromise<void> {
        this.config.setAppBackground(appBackground);
        return this.debouncedPersistConfig();
    }

    private handleFooterTextChange(footerText: string):
    angular.IPromise<void> {
        this.config.setFooterText(footerText);
        return this.debouncedPersistConfig();
    }

    private handleChartColorPalettesChange(colorPalettes: ColorPalette[]): angular.IPromise<void> {
        this.config.setChartColorPalettes(colorPalettes);
        return this.debouncedPersistConfig();
    }

    private handlePageTitleChange(pageTitle: string):
    angular.IPromise<void> {
        this.config.setPageTitle(pageTitle);
        return this.debouncedPersistConfig();
    }

    private persistConfig(): IPromise<void> {
        let userAction = new UserAction(UserAction.UPDATE_CUSTOM_STYLE_CONFIG);
        return CustomStylingService.updateConfig(this.config)
            .then(
                () => {
                    alertService.showUserActionSuccessAlert(userAction);
                    this.logger.info('Custom styling config successfully updated', this.config);
                },
                () => alertService.showUserActionFailureAlert(userAction)
            );
    }
}
