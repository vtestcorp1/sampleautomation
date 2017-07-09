/**
 * Copyright: ThoughtSpot Inc. 2012-2014
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview Controller for help page
 */

'use strict';

/* global addBooleanFlag */
addBooleanFlag('enableHelp',
    'If true, start showing Help page in navigation',
    false);

blink.app.controller('HelpController', [
    '$scope',
    'helpKeywords',
    'strings',
    'supportService',
    function ($scope, helpKeywords, strings, supportService) {

        $scope.menus = [
            {
                header: '',
                items: [
                    {
                        actionType: 'system-info',
                        label: 'System Info',
                        selected: true
                    }
                ]
            },
            {
                header: 'Keywords',
                items: [ ]
            }
        ];

        var keywordMenuItems = $scope.menus[1].items;

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
            angular.forEach($scope.menus, function (menu) {
                angular.forEach(menu.items, function (item) {
                    item.selected = item.label === menuItem.label;
                });
            });
            determineCurrentMenuItem();
        };

        function determineCurrentMenuItem() {
            $scope.currentMenuItem = $scope.menus.map(function (menu) {
                return menu.items;
            }).reduce(function (p, c) {
                return p.concat(c);
            }, []).filter(function (item) {
                return item.selected;
            })[0];
        }
        determineCurrentMenuItem();

        var StatusTypes = {
            FETCHING: 'fetching',
            COMPLETE: 'complete',
            NOT_FOUND: 'not-found',
            ERROR: 'error'
        };

        $scope.getReleaseNameDisplayString = function () {
            switch ($scope.releaseNameComputationStatus) {
                case StatusTypes.FETCHING:
                    return 'Determining version ...';
                case StatusTypes.COMPLETE:
                    return $scope.releaseVersionName;
                case StatusTypes.NOT_FOUND:
                    return 'Not a release cluster';
                case StatusTypes.ERROR:
                    return 'Oops, there was an error determining version.';
            }
        };

        /**
         * Determine the release version.
         *
         * @return {string} release version name
         */
        $scope.releaseVersionName = '';
        $scope.releaseNameComputationStatus = StatusTypes.FETCHING;

        supportService.getReleaseVersion().then(function (versionName) {
            $scope.releaseNameComputationStatus = StatusTypes.COMPLETE;
            // Regex for extracting release version. Format - [Major.Minor.SubMinor]
            var matches = /^(\d+\.\d+(\.\d+){0,0}).*/.exec(versionName);
            if (!!matches && matches.length >= 2) {
                $scope.versionNameForLink = matches[1];
            } else {
                $scope.releaseNameComputationStatus = StatusTypes.NOT_FOUND;
            }
            $scope.releaseVersionName = versionName;
        }, function (status) {
            if (status === 404) {
                $scope.releaseNameComputationStatus = StatusTypes.NOT_FOUND;
            } else {
                $scope.releaseNameComputationStatus = StatusTypes.ERROR;
            }
        });
    }
]);
