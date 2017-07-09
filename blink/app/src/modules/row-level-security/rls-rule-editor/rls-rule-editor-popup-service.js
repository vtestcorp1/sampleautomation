/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview A service to manage showing/hiding rule editor popup
 */

'use strict';

blink.app.factory('rlsRuleEditorPopupService', ['Logger',
    'popupService',
    'RlsRuleEditorController',
    function (Logger,
          popupService,
          RlsRuleEditorController) {
        var me = {},
            popup = null;

        me.show = function (rule, dataScope, onSave) {
            if (!!popup) {
                return;
            }

            popup = popupService.show('<div class="bk-rule-editor-popup"><rls-rule-editor>' +
            '</rls-rule-editor></div>', {
                ctrl: new RlsRuleEditorController(rule, dataScope, onSave, me.hide)
            });
        };

        me.hide = function () {
            if(!popup) {
                return;
            }
            popup.hide();
            popup = null;
        };

        return me;
    }]);
