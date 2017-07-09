/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview View for formula editor
 *
 * The interface of this module consists of these points:
 *
 * 1. addFormulaToDocument (OUT)
 * 2. updateFormulaName (OUT)
 * 3. {formulaEditorPopupService}.hide (OUT)
 */

'use strict';

blink.app.directive('formulaEditor', ['Logger',
    'formulaEditorPopupService',
    'util',
    function (Logger,
          formulaEditorPopupService,
          util) {

        var logger = Logger.create('formula-editor-ui'),
            uiVersionCounter = 0,
            FORMULA_ASSISTANT_LINK = 'bk-formula-assistant-link';



        function exampleTreeLevelFormatter (valueList, level) {
        // examples is level 2 in our data
            if (level != 2) {
                return null;
            }

            var data = {};
            valueList.each(function(item){
                data[item.type] = item.value;
            });

            return {
                templateUrl: 'src/modules/formula-editor/formula-examples/formula-examples-example-section.html',
                data: data
            };
        }

        function initializeScope(scope) {

            scope.cancel = function () {
            // TODO(sunny): check if there are any unsaved changes
            // and alert the user

            // implemented by popup service
                formulaEditorPopupService.hide();
            };

            scope.getUIVersionNumber = function () {
                return uiVersionCounter;
            };

            scope.advancedSettingsPanelShowing = false;
            scope.examplesPanelShowing = false;
            scope.exampleTreeLevelFormatter = exampleTreeLevelFormatter;

        }

        function linker(scope, $el, attrs) {
        // SCAL-10110: workaround for webkit float bug that causes floating formula
        // assistant's position to be messed up.
        // https://bugs.webkit.org/show_bug.cgi?id=58806
            util.executeInNextEventLoop(function(){
                $el.find('.' + FORMULA_ASSISTANT_LINK).css({
                    display: 'inline-block',
                    float: 'right'
                });
            });

            initializeScope(scope);

        }

        return {
            restrict: 'A',
            replace: true,
            link: linker,
            templateUrl: 'src/modules/formula-editor/formula-editor.html',
            controller: 'FormulaEditorController'
        };

    }]);
