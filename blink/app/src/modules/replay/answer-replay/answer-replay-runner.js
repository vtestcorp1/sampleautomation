/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jordie Hannel (jordie@thoughtspot.com)
 *
 * @fileoverview Service to run simulations of answer creation.
 */

'use strict';

/* eslint camelcase: 1 */
blink.app.factory('answerReplayRunner', ['$q',
    '$rootScope',
    'jsonConstants',
    'Logger',
    'metadataService',
    'replayRunner',
    'replayControls',
    'sessionService',
    'util',
    function($q,
    $rootScope,
    jsonConstants,
    Logger,
    metadataService,
    replayRunner,
    replayControls,
    sessionService,
    util) {

        var _logger = Logger.create('answer-replay-service');

        var _nav = replayControls.navigators;

        var RECORDED_REPLAY_DELAY_MS = 2000,
            START_REPLAY_BTN = '.bk-btn:contains(Start Replay)';

    /**
     * Enters query from answer into sage bar
     *
     * @param {Object} answer
     */
        function doSageQuery(answer) {
            return replayControls.enterSageTokens(answer.tokens);
        }

    /**
     * Opens Data Source tab and selects given sources
     *
     * @param {Array} sources - name and guid for each
     */
        function selectSources(sources) {
            if (!sources.length) {
                return $q.when();
            }
            return replayControls.ensureAllSourcesShown()
            .then(function() {
                return util.asyncEach(sources, function(source) {
                    return replayControls.typeDataSource(source.name)
                        .then(function() {
                            return replayControls.selectSource(source.guid);
                        });
                });
            });
        }

    /**
     * Opens Data Source tab and deselects given sources
     *
     * @param {Array} sources - name and guid for each
     */
        function deselectSources(sources) {
            if (!sources.length) {
                return $q.when();
            }
            return util.asyncEach(sources, function(source) {
                return replayControls.typeDataSource(source.name)
                .then(function() {
                    return replayControls.deselectSource(source.guid);
                });
            });
        }

        function setFormulae(formulae) {
            var context = $(uiSelectors.ANSWER_DOCUMENT).scope().$ctrl.sageClient.getContext();

            context.setFormulaeMap(formulae);
        }

        function sourcesFromGuids(guids) {
            if (!guids || guids.length === 0) {
                return $q.when();
            }

            return metadataService.getMetadataDetails(
            jsonConstants.metadataType.LOGICAL_TABLE,
            guids,
            false,
            true
        ).then(function(response) {
            var sources = [];
            response.data.storables.forEach(function(source) {
                sources.push({
                    name: source.header.name,
                    guid: source.header.id
                });
            });
            return sources;
        });
        }

        function efficientlyDeselectSources(shouldDeselectAll, sourcesToDeselect) {
            if (shouldDeselectAll) {
                return replayControls.deselectAllDataSources();
            } else if (sourcesToDeselect) {
                return deselectSources(sourcesToDeselect);
            }

            return $q.when();
        }

        function ensureSourcesSelected(answer) {
            var requiredSourceGuids = Object.keys(answer.requiredSources);
            var selectedSourceGuids = sessionService.getSageDataSource() || [];

            var guidsToDeselect = selectedSourceGuids.subtract(requiredSourceGuids);
            var guidsToSelect = requiredSourceGuids.subtract(selectedSourceGuids);

            var allSelectionsUnneeded = selectedSourceGuids.length === guidsToDeselect.length;
            var manySelectionsUnneeded = guidsToDeselect.length > (requiredSourceGuids.length - guidsToSelect.length);
            var shouldDeselectAll = allSelectionsUnneeded || manySelectionsUnneeded;

            if (shouldDeselectAll) {
                guidsToSelect = requiredSourceGuids;
            }

            if (guidsToSelect.length === 0 && guidsToDeselect.length === 0) {
                return _nav.closeSageDataSourceDialog();
            }

            var sourcesToSelect = [];
            guidsToSelect.forEach(function(guid) {
                sourcesToSelect.push({
                    guid: guid,
                    name: answer.requiredSources[guid]
                });
            });

            return _nav.openSageDataSourceDialog()
            .then(function() {
                return sourcesFromGuids(guidsToDeselect);
            }).then(function(sourcesToDeselect) {
                return efficientlyDeselectSources(
                    shouldDeselectAll,
                    sourcesToDeselect
                );
            }).then(function() {
                return selectSources(sourcesToSelect);
            })
            .then(_nav.closeSageDataSourceDialog);
        }

    /**
     * @param {Object} answer
     */
        function simulateSearch(answer) {
            return _nav.goToAnswer()
            .then(function() {
                return ensureSourcesSelected(answer);
            })
            .then(function() {
                setFormulae(answer.formulae);
                return doSageQuery(answer);
            })
            .then(function() {
                return replayControls.configureViz(
                    answer.vizType,
                    answer.vizConfig
                );
            });
        }

        function fakeClickStartReplay() {
            return replayControls.clickWithEffect($(START_REPLAY_BTN), null, true);
        }

        function doAnswerReplayRecord(answer, onEnd) {
            return replayRunner.doReplay(
            function() {
                return simulateSearch(answer);
            },
            onEnd,
            false,
            RECORDED_REPLAY_DELAY_MS
        );
        }

        function doAnswerReplay(answer) {
            return replayRunner.doReplay(function() {
                return simulateSearch(answer);
            });
        }

        return {
        // Functions
            doAnswerReplay: doAnswerReplay,
            doAnswerReplayRecord: doAnswerReplayRecord
        };
    }]);
