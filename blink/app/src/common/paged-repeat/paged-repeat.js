/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Utility directive to add pagination to ng-repeat
 *
 * Example Usage:
 *
 * <span blink-paged-repeat="(matchIndex, match) in list.items"
 *     model="list.items"
 *     page-size="3"
 *     show-all-in-second-page="true">
 *     <li ng-class="{active: isActive(matchIndex, listIndex) }"
 *         <div ng-include="getItemTemplateUrl()(match, list)"></div>
 *     </li>
 * </span>
 */

'use strict';

blink.app.directive('blinkPagedRepeat', ['Logger', 'safeApply', 'angularUtil',
    function (Logger, safeApply, angularUtil) {

    // Note(sunny): limitTo does not like Number.POSITIVE_INFINITY
        var MAX_ITEMS = 1000000,
            EXPANDED_STATE_CLASS = 'bk-paged-repeat-expanded';

        var _logger = Logger.create('blink-paged-repeat');

        function compiler($el, attrs) {
            var ngRepeatExpression = attrs.blinkPagedRepeat;
            ngRepeatExpression += ' | limitTo: limitTo';

            var repeatType = (attrs.userVirtualScroll == 'true') ? 'sf-virtual-repeat' : 'ng-repeat';
            $el.children().eq(0).attr(repeatType, ngRepeatExpression);
            return linker;
        }

        function linker(scope, $el, attrs) {
            scope.pageSize = scope.$eval((attrs.pageSize));
            if (isNaN(scope.pageSize)) {
                if (!!attrs.pageSize) {
                    _logger.warn('pageSize must be an integer');
                }
                scope.pageSize = MAX_ITEMS;
            }

            scope.showAllInSecondPage = scope.$eval(attrs.showAllInSecondPage);
            scope.allowExpansion = scope.$eval(attrs.allowExpansion);
            scope.limitTo = scope.pageSize;

            scope.addNextPage = scope.$eval(attrs.addNextPage);

            scope.getHiddenItemsCount = function () {
                return Math.max(0, scope.model.length - scope.limitTo);
            };

            scope.showExpansionButton = function () {
                return scope.isFetching || (scope.allowExpansion && scope.getHiddenItemsCount() > 0);
            };

            scope.model = scope.$eval(attrs.model);

            scope.viewAllButtonText = scope.$eval(attrs.viewAllButtonText);

            scope.isFetching = false;

        // TODO(sunny): extract the view out of this code (may be delegate the view to the user of this directive)
            var $viewAllButton = $('<div><div ng-include="\'src/common/paged-repeat/paged-repeat-expand-button.html\'"></div></div>');
            $viewAllButton = angularUtil.getCompiledElement($viewAllButton, scope);
            $el.parent().append($viewAllButton);

            function onNextPage() {
                if (scope.showAllInSecondPage) {
                    scope.limitTo = MAX_ITEMS;
                } else {
                    scope.limitTo += scope.pageSize;
                }
            }

            function viewMoreHandler($evt){
                $evt.preventDefault();
                $evt.stopPropagation();

                if (scope.addNextPage) {
                    scope.isFetching = true;
                    scope.addNextPage().then(function(){
                        onNextPage();
                        scope.isFetching = false;
                    }, function(){
                        scope.isFetching = false;
                    });
                } else {
                    onNextPage();
                }

                $el.parent().addClass(EXPANDED_STATE_CLASS);

                safeApply(scope);
            }

            $viewAllButton.on('click.blinkPagedRepeat', viewMoreHandler);
            $viewAllButton.on('mousedown.blinkPagedRepeat', function(e){
                e.preventDefault();
                e.stopPropagation();
            });
            scope.$on('$destroy', function(){
                $viewAllButton.off('click.blinkPagedRepeat');
                $viewAllButton.off('mousedown.blinkPagedRepeat');
            });
            scope.$watch(
            function() {
                return scope.$eval(attrs.model);
            }, function(newValue) {
                scope.model = newValue;
            }
        );
        }

        return {
            restrict: 'A',
            compile: compiler
        };
    }]);
