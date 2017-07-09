/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A utility for table column menu related functions.
 */

'use strict';

blink.app.factory('columnMenuUtil', ['angularUtil', 'Logger', 'safeApply', 'util',
    function (angularUtil, Logger, safeApply, util) {
        var logger = Logger.create('column-menu-util');

        function getNewNode($scope, template, scopePropValues) {
            util.iterateObject(scopePropValues, function(key, value){
                $scope[key] = value;
            });

            var $menu = angularUtil.getCompiledElement($(template), $scope);
            safeApply($scope);

            return $menu;
        }

    /**
     * @param {AnswerSageClient} sageClient
     * @param {VisualizationColumnModel} columnModel
     * @param {TableModel} tableModel
     * @returns {*}
     */
        function getNewFilterMenuButtonNode(childScope, sageClient, columnModel, tableModel) {
            return getNewNode(
            childScope,
            '<column-menu-button sage-client="sageClient" column-model="columnModel" table-model="tableModel"></column-menu-button>',
                {
                    columnModel: columnModel,
                    tableModel: tableModel,
                    sageClient: sageClient
                }
        );
        }

        /**
         *
         * @param {Scope} childScope
         * @param {AnswerSageClient} sageClient
         * @param {VisualizationColumnModel} columnModel
         * @param {TableModel} tableModel
         * @param editAllowed
         * @param onTableRedrawRequired
         * @returns {*}
         */
        function getNewFilterMenuNode(childScope, sageClient, columnModel, tableModel, editAllowed, onTableRedrawRequired) {

            return getNewNode(
                childScope,
                '<column-menu is-editable="isEditable" sage-client="sageClient" column-model="columnModel"' +
                ' table-model="tableModel" on-table-redraw-required="onTableRedrawRequired()"></column-menu>',
                {
                    sageClient: sageClient,
                    columnModel: columnModel,
                    tableModel: tableModel,
                    isEditable: editAllowed,
                    onTableRedrawRequired: onTableRedrawRequired
                }
            );
        }

        function hasFiltersForColumn(tableModel, columnModel) {

            var answerModel = tableModel.getContainingAnswerModel();
            if (!answerModel) {
                return false;
            }
            return answerModel.getCurrentAnswerSheet().hasFilterForColumn(columnModel);
        }

        function hasMetricsForColumn(tableModel, columnModel) {

            var answerModel = tableModel.getContainingAnswerModel();
            if (!answerModel) {
                return false;
            }
            return !!columnModel.getMetricsDefinition();
        }

        function isOptionsAvailable(tableModel, columnModel) {
            return hasFiltersForColumn(tableModel, columnModel) || hasMetricsForColumn(tableModel, columnModel);
        }

        return {
            getNewFilterMenuButtonNode: getNewFilterMenuButtonNode,
            getNewFilterMenuNode: getNewFilterMenuNode,
            hasFiltersForColumn: hasFiltersForColumn,
            hasMetricsForColumn: hasMetricsForColumn,
            isOptionsAvailable: isOptionsAvailable
        };
    }]);
