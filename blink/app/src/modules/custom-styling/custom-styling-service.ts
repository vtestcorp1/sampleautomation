import {IPromise} from 'angular';
import {ngRequire, Provide} from 'src/base/decorators';
import {FontFace, FontFaceCSSRule} from '../../base/font-face';
import {AppLogoType,
        CustomizableTableFeature,
        CustomStyleBackground,
        CustomStylingConfig} from './custom-style-config';

let Command = ngRequire('Command');
let $q = ngRequire('$q');


@Provide('CustomStylingService')
export class CustomStylingService {
    private static GET_STYLE_END_POINT: string = '/file/getcustomstyle';
    private static UPDATE_STYLE_END_POINT: string = '/file/updatecustomstyle';

    private static CUSTOM_STYLE_NODE_ID = 'bk-custom-style-a1707549-c84e-4e32-ac44-876ead00001c';

    private static CustomStyleTemplates = {
        FONT_FACE: `@font-face \{
            font-family: {fontFamily};
            src: url('{fontUrl}') format('{fontFormat}');
        \}`,

        APP_LOGO: `.bk-logo-customizable \{
            background: url({appLogoUrl}) no-repeat center !important;
            background-size: 48px 48px !important;
            max-width: 48px !important;
            max-height: 48px !important;
        \}`,

        APP_LOGO_WIDE: `.bk-logo-wide-customizable \{
            background: url('{appLogoUrl}') no-repeat center !important;
            background-size: 220px 49px !important;
            max-width: 220px !important;
            max-height: 49px !important;
        \}`,

        TABLE_CELL: `.bk-table-cell-customizable .slick-cell \{
            font-family: {fontFamily} !important;
            font-weight: {fontWeight} !important;
            font-style: {fontStyle} !important;
            font-size: {fontSize} !important;
            color: {color} !important;
        \}`,

        APP_BACKGROUND: `.bk-embedded.bk-app-background-customizable \{
            background-color: {color} !important;
        \}`
    };

    private static config: CustomStylingConfig = null;

    public static initialize(withCustomizationsDisabled: boolean): IPromise<CustomStylingConfig>  {
        if (withCustomizationsDisabled) {
            let defaultConfig = CustomStylingService.getDefaultConfig();
            this.setConfig(defaultConfig);
            return $q.resolve(defaultConfig);
        }

        // TODO (sunny): user action
        return this.getRemoteConfig()
            .then(
                (config: CustomStylingConfig) => {
                    this.setConfig(config);
                    return config;
                }
            );
    }

    public static getConfig(): CustomStylingConfig {
        return this.config;
    }

    public static updateConfig(config: CustomStylingConfig): IPromise<CustomStylingConfig> {
        var content: string = JSON.stringify(config.toJson());

        var command = new Command()
            .setPath(CustomStylingService.UPDATE_STYLE_END_POINT)
            .setIgnorable(false)
            .setPostMethod()
            .setIsMultipart(true)
            .setPostParams({
                content: content
            });

        return command.execute()
            .then(
                function(response: any) {
                    CustomStylingService.setConfig(config);
                    return config;
                }
            );
    }

    public static addCustomFontFaceStyle(fontFace: FontFace): void {
        // Note (sunny): We could add/update the style of just this fontFace
        // but we re-do the entire update for simplicity.
        CustomStylingService.updateStyles(CustomStylingService.config, [fontFace]);
    }

    private static getRemoteConfig(): IPromise<CustomStylingConfig> {
        var command = new Command()
            .setPath(CustomStylingService.GET_STYLE_END_POINT)
            .setIgnorable(false);

        return command.execute()
            .then(
                function(response: any) {
                    var config: CustomStylingConfig
                        = CustomStylingConfig.fromJson(response.data);
                    return config;
                }
            );
    }

    private static getDefaultConfig(): CustomStylingConfig {
        return CustomStylingConfig.fromJson('{}');
    }

    private static setConfig(config: CustomStylingConfig): void {
        CustomStylingService.config = config;
        CustomStylingService.updateStyles(config);
    }

    private static updateStyles(config: CustomStylingConfig, unsavedFontFaces: FontFace[] = [])
    : void {
        var styleNode: HTMLStyleElement = this.getCustomStyleNode();

        var styleSheet: CSSStyleSheet = <CSSStyleSheet>styleNode.sheet;
        // TODO (sunny): Rewrite of the entire CSS causes flicker on
        // elements that are affected by these rules and are visible. Find a
        // way to eliminate the flicker.
        this.removeAllCustomStyles(styleSheet);

        var widAppLogoRuleText: string = CustomStylingService
            .CustomStyleTemplates
            .APP_LOGO_WIDE
            .assign({
                appLogoUrl: config.getAppLogoUrl(AppLogoType.WIDE)
            });

        CustomStylingService.appendRuleToSheet(styleSheet, widAppLogoRuleText);

        var appLogoRuleText: string = CustomStylingService
            .CustomStyleTemplates
            .APP_LOGO
            .assign({
                appLogoUrl: config.getAppLogoUrl(AppLogoType.DEFAULT)
            });

        CustomStylingService.appendRuleToSheet(styleSheet, appLogoRuleText);

        // Note (sunny): Although we use a small subset of all the fonts uploaded
        // by the admin into the system we need to have all font-faces available in
        // the document for the admin to able to see their previews in styling
        // configuration UI. This can be optimized later.
        var allFontFaces: FontFace[] = config.getAllCustomFontFaces().concat(unsavedFontFaces);
        allFontFaces.forEach(function(fontFace: FontFace){
            var fontFaceRule: FontFaceCSSRule = fontFace.toFontFaceRule();

            var fontFaceRuleText: string = CustomStylingService
                .CustomStyleTemplates
                .FONT_FACE
                .assign(fontFaceRule);

            CustomStylingService.appendRuleToSheet(styleSheet, fontFaceRuleText);
        });

        var tableFontFace: FontFace = config.getTableFontFace(CustomizableTableFeature.CELL);
        var tableCellFontRuleText: string = CustomStylingService
            .CustomStyleTemplates
            .TABLE_CELL
            .assign(tableFontFace.toStyle());
        CustomStylingService.appendRuleToSheet(styleSheet, tableCellFontRuleText);

        var appBackground: CustomStyleBackground = config.getAppBackground();
        var appBackgroundRuleText: string = CustomStylingService
            .CustomStyleTemplates
            .APP_BACKGROUND
            .assign({
                color: appBackground.color.css()
            });
        CustomStylingService.appendRuleToSheet(styleSheet, appBackgroundRuleText);
    }

    private static getCustomStyleNode(): HTMLStyleElement {
        var styleNode: Element = document.querySelector(
            '#' + CustomStylingService.CUSTOM_STYLE_NODE_ID
        );

        if (!styleNode) {
            styleNode = document.createElement('style');
            styleNode.setAttribute('id', CustomStylingService.CUSTOM_STYLE_NODE_ID);
            styleNode.setAttribute('type', 'text/css');
            document.head.appendChild(styleNode);
        }
        return <HTMLStyleElement>styleNode;
    }

    private static removeAllCustomStyles(sheet: CSSStyleSheet): void {
        if (sheet.cssRules) {
            while (sheet.cssRules.length > 0) {
                sheet.deleteRule(0);
            }
        }
    }

    private static appendRuleToSheet(sheet: CSSStyleSheet, ruleText: string): void {
        sheet.insertRule(ruleText, sheet.cssRules.length);
    }
}
