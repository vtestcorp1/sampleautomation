/**
* Copyright: ThoughtSpot Inc. 2012-2016
* Author: Shashank Singh (sunny@thoughtspot.com)
*
* @fileoverview  A generic component popup service that can show
* the provided component as a modal popup.
*/

import {BaseComponent} from '../base-types/base-component';
import {ngRequire} from '../decorators';

let popupService = ngRequire('popupService');

export class ComponentPopupService {

    private static COMPONENT_HTML_TEMPLATE: string = '<div class="bk-component-popup">' +
        '<{componentName} bk-ctrl="bkCtrl"></{componentName}></div>';

    private static popup: any;

    public static show(componentName: string, component: BaseComponent) {
        if (!!ComponentPopupService.popup) {
            return;
        }

        var html: string = ComponentPopupService.COMPONENT_HTML_TEMPLATE.assign({
            componentName: componentName,
        });

        ComponentPopupService.popup = popupService.show(html, {
            bkCtrl: component
        });
    }

    public static hide() {
        if (!ComponentPopupService.popup) {
            return;
        }

        ComponentPopupService.popup.hide();
        ComponentPopupService.popup = null;
    }
}
