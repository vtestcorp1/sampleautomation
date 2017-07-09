/*
* Copyright: ThoughtSpot Inc. 2014
* Author: Shashank Singh (sunny@thoughtspot.com)
*
* @fileoverview A horizontal tree view widget
*
*/

'use strict';

blink.app.directive('treeMenu', ['Logger', 'util',
    function (Logger, util) {
        var logger = Logger.create('tree-menu-ui'),
            formattedValuesForLevelCache = {};

    // TODO (sunny); extract the unit testable functions into a controller
    // and add tests for them
        function getTreeDepth(tree) {
            if (!Object.has(tree, 'children')) {
                return 0;
            }
            return 1 + tree.children.map(function(child){
                return getTreeDepth(child);
            }).max();
        }

        function computeSpaceDistribution(scope) {
            if (!scope.spaceDistribution) {
                scope.spaceDistribution = [];
            }

            var specifiedFraction = scope.spaceDistribution.sum();

            if (scope.maxDepth === 0) {
                logger.warn('data is empty');
                scope.spaceDistribution = [];
                return;
            }

            if (specifiedFraction > 1) {
                logger.warn('sum of values in spaceDistribution may not be > 1');
                scope.spaceDistribution.repeat(1/scope.maxDepth, scope.maxDepth);
                return;
            }

            if (scope.spaceDistribution.length > scope.maxDepth) {
                logger.warn('too many levels in spaceDistribution, specified {1}, available: {2}'
                .assign(scope.spaceDistribution.length, scope.maxDepth));
                scope.spaceDistribution = scope.spaceDistribution.first(scope.maxDepth);
                return;
            }

            if (scope.spaceDistribution.length === scope.maxDepth) {
                return;
            }

            var unspecifiedFraction = 1 - specifiedFraction,
                unspecifiedLevels = scope.maxDepth - scope.spaceDistribution.length,
                evenFraction = unspecifiedFraction/unspecifiedLevels;
            for (var i = 0; i<unspecifiedLevels; i++) {
                scope.spaceDistribution.push(evenFraction);
            }
        }

        function selectNode(scope, level, indexInLevel) {
            for (var i=0; i<scope.maxDepth; i++) {
                if (i < level) {
                    if (scope.selectedIndexForLevel[i] === void 0) {
                        scope.selectedIndexForLevel[i] = 0;
                    }
                } else if (i === level) {
                    scope.selectedIndexForLevel[i] = indexInLevel;
                } else {
                    scope.selectedIndexForLevel[i] = 0;
                }
            }
        }

        function getCurrentPathForLevel(scope, level) {
            return scope.selectedIndexForLevel.slice(0, level);
        }

        function getValuesForPath(scope, path) {
            var cacheKey = path.join('-');
            if (Object.has(formattedValuesForLevelCache, cacheKey)) {
                return formattedValuesForLevelCache[cacheKey];
            }

            var valueList = scope.treeData.children;
            path.each(function(indexAtCurrentLevel){
                valueList = valueList[indexAtCurrentLevel].children;
            });

        // if the caller wants to format the entire level itself it will return
        // a truthy value in level formatter otherwise we'll try to get it
        // to format each value in the level separately
            var levelFormatter = scope.getLevelFormatter();
            if (levelFormatter) {
                var formattedLevelValue = levelFormatter(valueList, path.length);
                if (!!formattedLevelValue) {
                    if (!Array.isArray(formattedLevelValue)) {
                        formattedLevelValue = [formattedLevelValue];
                    }
                    formattedValuesForLevelCache[cacheKey] = formattedLevelValue;
                    return formattedLevelValue;
                }
            }

            var valueFormatter = scope.getValueFormatter();
            if (!valueFormatter) {
            // no value formatter was provided, we'll use the raw unformatted value
                var rawValues = valueList.map(function(item){
                    if (!Array.isArray(item)) {
                        return item.value;
                    }
                    return item.value.map('value').join('');
                });
                formattedValuesForLevelCache[cacheKey] = rawValues;
                return rawValues;
            }


            var formattedItemValues = valueList.map(function(item){
                return valueFormatter(item.value, item.type);
            });
            formattedValuesForLevelCache[cacheKey] = formattedItemValues;
            return formattedItemValues;
        }

        function isSelectedItem(scope, level, indexInLevel) {
            return scope.selectedIndexForLevel[level] === indexInLevel;
        }

        function setUpSelectionIndicators(scope, $el) {
        // TODO(sunny): move this to HTML and use ng-switch
            scope.$watch('selectedIndexForLevel', function(){
            // update the current data for each level
                var path = [];
                scope.formattedValuesForLevels = [];
                scope.selectedIndexForLevel.each(function(selectedIndex, level){
                    var formattedValues = getValuesForPath(scope, path);
                    scope.formattedValuesForLevels.push(formattedValues);
                    path.push(selectedIndex);
                });

            // update the selected-item-in-level indicator
                util.executeInNextEventLoop(function() {
                // there is no indicator for last level
                    for (var i =0; i<scope.selectedIndexForLevel.length - 1; i++) {
                        var $level = $el.find('.bk-tree-level').eq(i),
                            $selectedItemValue = $level.find('.bk-tree-item-value.selected'),
                            $indicator = $level.find('.bk-tree-level-selection-indicator');

                        if ($selectedItemValue.length === 0) {
                            $indicator.hide();
                        } else {
                            $indicator.show();
                            var $selectedItem = $selectedItemValue.closest('.bk-tree-item');
                        // constant adjustment factor because of the sizing of the indicator element
                            $indicator.css('top', $selectedItem.position().top + $selectedItem.height()/2 - 3);
                        }
                    }
                });
            }, true);

        }

        function linker(scope, $el, attrs) {
            scope.formattedValuesForLevels = [];
            scope.maxDepth = getTreeDepth(scope.treeData);
            scope.selectedIndexForLevel = util.repeat(0, scope.maxDepth);
            computeSpaceDistribution(scope);
            scope.selectNode = angular.bind(null, selectNode, scope);
            scope.isSelectedItem = angular.bind(null, isSelectedItem, scope);

            setUpSelectionIndicators(scope, $el);
        }

        return {
            restrict: 'A',
            replace: false,
            scope: {
                treeData: '=',
                spaceDistribution: '=treeSpaceDistribution',
                getValueFormatter: '&treeValueFormatter',
                getLevelFormatter: '&treeLevelFormatter'
            },
            link: linker,
            templateUrl: 'src/common/tree-menu/tree-menu.html'
        };
    }]);
