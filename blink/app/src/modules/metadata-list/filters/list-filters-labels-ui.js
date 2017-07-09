/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Directive to provide top level filters with labels.
 *
 * Usage:
 *  Accepts three attributes:
 *      filters: the list of filters, provided by the parent.
 *      filterCallback(labels: list of labels applied if any): the callback called when a user applies a filter or a label.
 *      labelDeletedCallback(label: the deleted label): callback called when a label is deleted by the user.
 */

'use strict';

blink.app.directive('listFiltersAndLabels', ['Logger', 'blinkConstants', 'strings', 'sessionService',
    function (Logger, blinkConstants, strings, sessionService) {

        var _logger = Logger.create('list-filters-and-labels');

        function linker(scope, $el, attrs) {

            scope.hasAdminPrivileges = sessionService.hasAdminPrivileges();

            if(!angular.isFunction(scope.filterCallback)) {
                scope.filterCallback = angular.noop;
            }

            scope.onFilterClick = function(filter, idx) {
                filter.currentFilterIndex = idx;
                scope.onFilterApplied();
            };

            scope.onLabelClicked = function (labelClicked) {
                var name = labelClicked.getName();
                if (scope.stickers.selectedSticker.name === name) {
                    scope.stickers.selectDefault();
                } else {
                    scope.stickers.select(labelClicked);
                }

                scope.onFilterApplied();
            };

            scope.onLabelDeletion = function(label) {
            // If the label being deleted is the label currently selected
                if (scope.stickers.selectedSticker.name === label.getName()) {
                    scope.stickers.selectDefault();
                }
                if(angular.isFunction(scope.labelDeletedCallback)) {
                    scope.labelDeletedCallback({ label: label });
                }
            };
            scope.onLabelUpdate = function(label) {
                if (label.getJson().id === scope.stickers.selectedSticker.id) {
                    scope.stickers.selectedSticker.name = label.name;
                }
            };
        }


        return {
            restrict: 'E',
            scope: {
                filters: '=',
                stickers: '=',
                onFilterApplied: '&',
                labelDeletedCallback: '&'
            },
            link: linker,
            templateUrl: 'src/modules/metadata-list/filters/list-filters-labels.html'
        };

    }]);
