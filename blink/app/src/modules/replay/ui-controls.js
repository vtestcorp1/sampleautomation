/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jordie Hannel (jordie@thoughtspot.com)
 *
 * @fileoverview Service to abstract certain UI interactions.
 */

'use strict';

/* eslint camelcase: 1 */
blink.app.factory('uiControls', ['$q',
    'blinkConstants',
    'strings',
    'chartTypeSpecificationService',
    'Logger',
    'navService',
    'util',
    function($q,
    blinkConstants,
    strings,
    chartTypeSpecificationService,
    Logger,
    navService,
    util) {

        var _logger = Logger.create('answer-replay-ui-controls');

        var _waitForInterval,
            _waitForDeferred,
            _fail = angular.noop,
            WAITFOR_TIMEOUT = 6000,
            WAITFOR_INTERVAL = 100,
            SUGGESTION_CHANGE_TIMEOUT = 2000;

        function answerTab() {
            return $(uiSelectors.ANSWER_TAB);
        }

        function homeTab() {
            return $(uiSelectors.HOME_TAB);
        }

        function sageDataSourceBtn() {
            return $(uiSelectors.DATA_SOURCE_OPEN_BTN);
        }

        function sageDataSourceDialog() {
            return $(uiSelectors.DATA_SOURCE_SELECTOR_DIALOG);
        }

        function dataSourceItems() {
            return $(uiSelectors.SELECT_ITEM_CONTAINER);
        }

        function selectedDataSourceItems() {
            return $(uiSelectors.SELECT_ITEM_CONTAINER_SELECTED);
        }

        function optionContaining(val) {
        // escapes all CSS meta-characters listed at http://api.jquery.com/category/selectors/
            val = val.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\\\$&");
            return 'option:contains("' + val +'")';
        }

    /**
     * waits for test to be true, calls complete. calls fail and stops trying after timeout
     *
     * @param {fn} test
     * @param {fn} complete - callback
     * @param {fn} timeout - in ms
     * @param {fn} fail
     */
        function waitFor(message, test, timeout, canReject) {
            if (!_waitForDeferred) {
                _waitForDeferred = $q.defer();
            }

            timeout = timeout || WAITFOR_TIMEOUT;
            var result, start = new Date().getTime();

            _waitForInterval = setInterval(function() {
                if ((new Date().getTime() - start < timeout) && !result) {
                    result = test();
                } else {
                    if (!result) {
                        clearInterval(_waitForInterval);
                        if (canReject) {
                            _waitForDeferred.reject();
                        } else {
                            _logger.error('waitFor timed out on:', message);
                            _fail();
                        }
                    } else {
                        clearInterval(_waitForInterval);
                        _waitForDeferred.resolve();
                    }
                    _waitForDeferred = null;
                }
            }, WAITFOR_INTERVAL);

            return _waitForDeferred.promise;
        }

    /**
     * clicking directly can cause '$apply already in progress' error
     */
        function queueClick(elem) {
            var deferred = $q.defer();

            util.executeInNextEventLoop(function() {
                elem.click();
                deferred.resolve();
            });

            return deferred.promise;
        }

    /**
     * Returns selectable element of source with given guid
     *
     * @param {str} sourceGuid
     */
        function getSourceWithGuid(sourceGuid){
            var sources = $.makeArray(dataSourceItems());

            return $(sources.find(function(source) {
                return $(source).scope().item.id === sourceGuid;
            }));
        }

        function navigate(navigator) {
            if (navigator.inState()) {
                return $q.when();
            }

            return queueClick(navigator.getElement())
            .then(function() {
                return waitFor('navigator.inState', navigator.inState);
            });
        }

    /**
     * utilities to navigate
     */
        var navigators = {
            goToAnswer: {
                getElement: answerTab,
                inState: function() {
                    return navService.isCurrentAnswerPath() && $(uiSelectors.SAGE_INPUT).length > 0;
                }
            },
            goHome: {
                getElement: homeTab,
                inState: function() {
                    return $(uiSelectors.HOME_SAGE_BAR).length > 0;
                }
            },
            showSageDataSourcePanel: {
                getElement: function() {
                    return $(uiSelectors.DATA_SOURCE_SHOW_BTN);
                },
                inState: function() {
                    return $(uiSelectors.DATA_SOURCE_SHOW_BTN).length === 0;
                }
            },
            hideSageDataSourcePanel: {
                getElement: function() {
                    return $(uiSelectors.DATA_SOURCE_HIDE_BTN);
                },
                inState: function() {
                    return $(uiSelectors.DATA_SOURCE_SHOW_BTN).length > 0;
                }
            },
            showSageDataSourceDialog: {
                getElement: sageDataSourceBtn,
                inState: function() {
                    return sageDataSourceDialog().length > 0;
                }
            },
            hideSageDataSourceDialog: {
                getElement: function() {
                    return $(uiSelectors.CLOSE_DATA_SOURCE_DIALOG);
                },
                inState: function() {
                    return $(uiSelectors.CLOSE_DATA_SOURCE_DIALOG).length === 0;
                }
            },
            clearDataSourceSelections: {
                getElement: function() {
                    return $(uiSelectors.CLEAR_SELECTIONS);
                },
                inState: function() {
                    return $(uiSelectors.CLEAR_SEARCH_BUTTON).length > 0 || selectedDataSourceItems().length === 0;
                }
            },
            confirmClearSearch: {
                getElement: function() {
                    return $(uiSelectors.CLEAR_SEARCH_BUTTON);
                },
                inState: function() {
                    return $(uiSelectors.CLEAR_SEARCH_BUTTON).length === 0;
                }
            },
            showAllSources: {
                getElement: function() {
                    return $(uiSelectors.ALL_SOURCES_BUTTON);
                },
                inState: function() {
                    return $(uiSelectors.SELECT_ALL_SOURCES).length > 0;
                }
            },
            openChartTypeSelector: {
                getElement: function() {
                    return $(uiSelectors.CHART_SELECTOR_BUTTON_SELECTOR);
                },
                inState: function() {
                    return $(uiSelectors.CHART_SELECTOR_PANEL_SELECTOR + ':visible').length > 0;
                }
            },
            closeChartTypeSelector: {
                getElement: function() {
                    return $(uiSelectors.CHART_SELECTOR_BUTTON_SELECTOR);
                },
                inState: function() {
                    return $(uiSelectors.CHART_SELECTOR_PANEL_SELECTOR + ':visible').length === 0;
                }
            }
        };

        function highlightElement(elem) {
            $(elem).addClass('active');
        }

        function unhighlightElement(elem) {
            $(elem).removeClass('active');
        }

        function endsWith(str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }

        function getSageContext() {
            var context = $(uiSelectors.ANSWER_DOCUMENT).scope().$ctrl.sageClient.getContext();

            return context;
        }

        function sageInputElement() {
            var selector = uiSelectors.SAGE_INPUT;

            function element() {
                return $(selector);
            }

            function enter(val) {
                var $sageInput = $(selector);
                $sageInput.focus();
                $sageInput.val(val);
                $sageInput.scrollLeft(9999);
                $sageInput.trigger('input');
                $sageInput.trigger('change');
            /*
            // NOTE(vibhor): Due to an angular synchronization issue with IE, force the caret to be at the end of
            // the input after this call. The caret position can change the behavior of sage server and thus the response.
            setCaretPosition($sageInput, val.length);
            */
            }

            function append(val) {
                var deferred = $q.defer();
                var suggestions = $(uiSelectors.AUTOCOMPLETE_ITEM);

                var $sageInput = $(selector);
                $sageInput.focus();
                var newVal = $sageInput.val() + val;

                var suggestionsChange = sageInputElement().onSuggestionsChange();

                $sageInput.val(newVal);
                $sageInput.scrollLeft(9999);
                $sageInput.trigger('input');
                $sageInput.trigger('change');
            /*
            // NOTE(vibhor): Due to an angular synchronization issue with IE, force the caret to be at the end of
            // the input after this call. The caret position can change the behavior of sage server and thus the response.
            setCaretPosition($sageInput, val.length);
            */

                suggestionsChange.then(deferred.resolve, deferred.resolve);

                return deferred.promise;
            }

            function val() {
                var $sageInput = $(selector);
                return $sageInput.val();
            }

            function setVal(val) {
                var $sageInput = $(selector);
                $sageInput.val(val);
            }

            function hasMJP() {
                return $(uiSelectors.AMBIGUOUS_JOIN_PATH).length > 0;
            }

            function getPhrases() {
                try {
                    return getSageContext().getTables()[0].getPhrases();
                } catch (err) {
                    return null;
                }
            }

            function getTokens() {
                try {
                    var tokens = getSageContext().getTables()[0].getTokens();
                    tokens = tokens.filter(function(token) {
                        return !(token.isNonEmptyUnrecognizedToken()
                        || token.getToken().length === 0);
                    });
                    return tokens;
                } catch (err) {
                    return null;
                }
            }

            function getSageSuggestions() {
                return $(uiSelectors.AUTOCOMPLETE_ITEM);
            }


            function getViewMoreSuggestion() {
                var viewmore = $(uiSelectors.AUTO_COMPLETE_VIEW_ALL_VISIBLE);
                if (viewmore && viewmore.length) {
                    return $(viewmore[0]);
                } else {
                    return null;
                }
            }

            function buildQueryTextFromTokens(tokens) {
                return tokens.map(function(token) {
                    return token.token;
                }).join(' ').toLowerCase().trim();
            }

            function suggestionsSyncedWithCurrentQuery() {
                var queryForCurrentSuggestions = buildQueryTextFromTokens($(uiSelectors.SAGE_INPUT).scope().getTokens());
                var currentQuery = val().toLowerCase().trim();

                if (!(angular.isDefined(queryForCurrentSuggestions) && queryForCurrentSuggestions !== null)) {
                    return false;
                }

                if (!(angular.isDefined(currentQuery) && currentQuery !== null)) {
                    return false;
                }

                return queryForCurrentSuggestions.toLowerCase() === currentQuery.toLowerCase();
            }

            function onSuggestionsChange() {
                return waitFor('suggestions changed', suggestionsSyncedWithCurrentQuery, SUGGESTION_CHANGE_TIMEOUT, true)
                .finally(function() {
                    return $q.when();
                });
            }

            function hasUnrecognizedText() {
                var phrases = getPhrases();
                var tokens = getTokens();
                var lastPhrase = phrases[phrases.length - 1];

                return !(lastPhrase.start_index + lastPhrase.num_tokens === tokens.length
                || (lastPhrase.start_index + lastPhrase.num_tokens === tokens.length - 1
                    && tokens[tokens.length-1].token.length === 0));
            }

            function allResolved() {
                var phrases = getPhrases();

                if (phrases.length) {
                    if (!hasUnrecognizedText()) {
                        return (!sageBarErrorOrWarning());
                    } else {
                        return false;
                    }
                } else {
                    return val().length === 0;
                }
            }

        /**
         * @param {str} sageText
         * @return whether sage bar text is fully reflected in answer
         */
            function inState(sageText) {
                var phrases = getPhrases();

                if (phrases.length) {
                    if (!hasUnrecognizedText()) {
                        return (!sageBarErrorOrWarning()
                            && val().toLowerCase().trim() === sageText.toLowerCase().trim());
                    } else {
                        return false;
                    }
                } else {
                    return sageText.length === 0;
                }
            }

            function focus() {
                var $sageInput = $(selector);
                $sageInput.focus();
            }

            function blur() {
                var $sageInput = $(selector);
                $sageInput.blur();
            }

            function pressEnter() {
                var $sageInput = $(selector);
                $sageInput.focus();
                var e = $.Event('keypress');
                e.which = 13;
                $sageInput.trigger(e);
            }

        /**
         * @return whether sage bar is displaying error or warning
         */
            function sageBarErrorOrWarning() {
                return $(uiSelectors.SAGE_ERROR).length > 0 || $(uiSelectors.AMBIGUOUS_JOIN_PATH).length > 0;
            }

            return {
                val: val,
                append: append,
                element: element,
                inState: inState,
                allResolved: allResolved,
                setVal: setVal,
                hasMJP: hasMJP,
                getTokens: getTokens,
                getSageSuggestions: getSageSuggestions,
                getViewMoreSuggestion: getViewMoreSuggestion,
                onSuggestionsChange: onSuggestionsChange
            };
        }

        function dataSourceInputElement() {
            var selector = uiSelectors.DATA_SOURCE_INPUT;

            function enter(val) {
                var $dataSourceInput = $(selector);
                $dataSourceInput.focus();
                $dataSourceInput.val(val);
                $dataSourceInput.trigger('input');
                $dataSourceInput.trigger('change');
            /*
            // NOTE(vibhor): Due to an angular synchronization issue with IE, force the caret to be at the end of
            // the input after this call. The caret position can change the behavior of sage server and thus the response.
            setCaretPosition($sageInput, val.length);
            */
            }

            function append(val) {
                var $dataSourceInput = $(selector);
                $dataSourceInput.focus();
                $dataSourceInput.val($dataSourceInput.val() + val);
                $dataSourceInput.trigger('input');
                $dataSourceInput.trigger('change');
            /*
            // NOTE(vibhor): Due to an angular synchronization issue with IE, force the caret to be at the end of
            // the input after this call. The caret position can change the behavior of sage server and thus the response.
            setCaretPosition($sageInput, val.length);
            */
            }

            function val() {
                var $dataSourceInput = $(selector);
                return $dataSourceInput.val();
            }

            function element() {
                return $(selector);
            }

            function pressEnter() {
                var $dataSourceInput = $(selector);
                $dataSourceInput.focus();
                var e = $.Event('keypress');
                e.which = 13;
                $dataSourceInput.trigger(e);
            }

            return {
                enter: enter,
                element: element,
                append: append
            };
        }

        function getCurrentVizType() {
            var vizIcon = $(uiSelectors.CHART_SELECTOR_ICON_IMG)[0].currentSrc.replace(/^.*[\\\/]/, '');
            var endPos = vizIcon.indexOf('_icon');
            return vizIcon.substr(0, endPos).toUpperCase();
        }

        function chartTypeSelectorButton(chartType) {
            return $(uiSelectors.chartTypeButton(chartType));
        }

        return {
        // Functions
            onFail: function (failFn) {
                _fail = failFn;
            },
            sageInputElement: sageInputElement,
            dataSourceInputElement: dataSourceInputElement,
            navigators: navigators,
            navigate: navigate,
            getSourceWithGuid: getSourceWithGuid,
            waitFor: waitFor,
            highlightElement: highlightElement,
            unhighlightElement: unhighlightElement,
            dataSourceItems: dataSourceItems,
            queueClick: queueClick,
            getCurrentVizType: getCurrentVizType,
            chartTypeSelectorButton: chartTypeSelectorButton,
            optionContaining: optionContaining,
            getSageContext: getSageContext
        };
    }]);
