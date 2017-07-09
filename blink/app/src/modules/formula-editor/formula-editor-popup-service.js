/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A service to manage showing/hiding formula editor popup
 */

'use strict';

blink.app.factory('formulaEditorPopupService', ['$rootScope', 'Logger', 'events',  'popupService',
    function ($rootScope, Logger, events, popupService) {
        var me = {},
            popup = null,
            currentFormulaId = null;

        me.show = function (sageFormula, dataScope, sageContext, formulaEditorCallbacks) {
            if (!!popup) {
                return;
            }

            if (!!sageFormula) {
                currentFormulaId = sageFormula.getId();
            }

            popup = popupService.show('<div class="bk-formula-editor-popup"><div formula-editor></div></div>', {
                sageFormula: sageFormula,
                dataScope: dataScope,
                sageContext: sageContext,
                callbacks: formulaEditorCallbacks
            });
        };

        me.hide = function () {
            popup.hide();
            popup = null;
            currentFormulaId = null;
        };

        me.getCurrentFormulaId = function () {
            return currentFormulaId;
        };

        return me;
    }]);
