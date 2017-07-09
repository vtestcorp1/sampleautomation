/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview Controller for Help widget
 */

'use strict';

blink.app.controller('HelpWidgetController', [
    '$scope',
    'blinkConstants',
    'strings',
    'helpKeywords',

    function ($scope,
              blinkConstants,
              strings,
              helpKeywords) {

        $scope.noConnectionMessages = strings.help.noConnectionViewMessages;

        if ($scope.releaseNameComputationStatus == 'error') {
            $scope.showInfoMessage = false;
        }

        $scope.menus = [
            {
                items: [ ]
            }
        ];

        var keywordMenuItems = $scope.menus[0].items;

        var keywordHelpDefinition = $scope.keywordHelpDefinition = {};

        function parseExamples(exampleList, keywordText) {
            return exampleList.map(function (example, i) {
                var words = example.text;
                var highlightedWords = example.highlightedWords.sort();

                function getHighlightedWords() {
                    var currentWord = '';
                    var wordIndex = 0;
                    var range = [];
                    for (var charIndex = 0, highlightedWordsIndex = 0; charIndex < words.length; charIndex++) {
                        if (/\s/.test(words[charIndex])) {
                            if (currentWord !== '') {
                                if (wordIndex === highlightedWords[highlightedWordsIndex]) {
                                    range.push({start: charIndex - currentWord.length, size: currentWord.length});
                                    highlightedWordsIndex++;
                                }
                                wordIndex++;
                                currentWord = '';
                            }
                        } else {
                            currentWord += words[charIndex];
                        }
                    }
                    if (wordIndex === highlightedWords[highlightedWordsIndex]) {
                        range.push({start: charIndex - currentWord.length, size: currentWord.length});
                    }
                    return range;
                }

                var item = {
                    text: example.text,
                    highlight: highlightedWords && getHighlightedWords() || null
                };

                if (i === 0) {
                    item.keyword = keywordText;
                }
                return item;
            });
        }

        function flattenGroup(setList) {
            var flattenedList = setList.map(function (keywordSet, i) {
                var listItem = {
                    keywordTitle: keywordSet.keywordSetName,
                    example: [],
                    cssBottomBorder: true
                };
                keywordSet.keywords.each(function (keyword) {
                    var parsedExample = parseExamples(keyword.examples, keyword.keyword);

                    Array.prototype.push.apply(listItem.example, parsedExample);
                });
                return listItem;
            });
            return flattenedList;
        }

        /**
         * convertHelpKeywordJson will convert helpkeywords.js into the following structure
         *
         * @return {array} Following structure
         *
         *  groupCatergory{
         *       keywordTitle: {string},
         *       example:[
         *           {
         *               text: {string},
         *               highlight: [
         *                   {
         *                       size: {number},
         *                       start: {number}
         *                   }
         *               ],
         *               keyword: {string}
         *           }
         *       ],
         *       cssBottomBorder: {boolean}
         *   }
         *
         */
        function convertHelpKeywordJson(helpDefinition) {
            Object.keys(helpDefinition).forEach(function (group) {
                var groupDef = helpDefinition[group];
                keywordHelpDefinition[group] = flattenGroup(groupDef.sets);
                keywordMenuItems.push({
                    actionType: group,
                    label: groupDef.groupName
                });
            });
        }

        convertHelpKeywordJson(helpKeywords.helpKeywordsJson);

        /**
         * Determine the selected item from the multiple menus.
         *
         * @param {MenuItem} menuItem
         */
        $scope.onMenuItemClick = function (menuItem) {
            if (!menuItem.selected) {
                angular.forEach($scope.menus, function (menu) {
                    angular.forEach(menu.items, function (item) {
                        item.selected = item.label === menuItem.label;
                    });
                });
            }
            else {
                menuItem.selected = false;
            }
        };
    }
]);
