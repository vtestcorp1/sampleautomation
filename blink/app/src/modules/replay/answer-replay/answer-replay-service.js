/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jordie Hannel (jordie@thoughtspot.com)
 *
 * @fileoverview Service to run simulations of answer creation, and record these simulations.
 */

'use strict';

/* eslint camelcase: 1 */
blink.app.factory('answerReplayService', ['answerReplayRunner',
    'autoCompleteService',
    'blinkConstants',
    'strings',
    'chartTypeSpecificationService',
    'dateUtil',
    'dialog',
    'Logger',
    'navService',
    'sageDataSourceService',
    'screenRecorderService',
    'userService',
    'util',
    function(answerReplayRunner,
    autoCompleteService,
    blinkConstants,
    strings,
    chartTypeSpecificationService,
    dateUtil,
    dialog,
    Logger,
    navService,
    sageDataSourceService,
    screenRecorderService,
    userService,
    util) {

        var _answerConfig,
            _answer,
            _objectName,
            _lastURL,
            _$replayCtrls,
            _isRecording;

        var _logger = Logger.create('answer-replay-service');

        var RECORDED_REPLAY_DELAY_MS = 3000;

        function stopRecording() {
            screenRecorderService.stopRecording();
            _isRecording = false;
        }

        function showEndReplayDialog() {
            dialog.show({
                title: strings.replayAnswer.FINISHED_TITLE,
                confirmBtnLabel: strings.replayAnswer.RE_REPLAY,
                cancelBtnLabel: strings.replayAnswer.EDIT_ANSWER,
                customData: {
                    answerId: _answerConfig.model.getMetadata().header.id
                },
                onConfirm: function (customData) {
                    navService.goToReplayAnswer(customData.answerId);
                    return true;
                }
            });
        }

        function canPlayDocument(document) {
            if (!document || !document.getPermission
            || !document.getPermission().isMissingUnderlyingAccess) {
                return false;
            }
            return !document.getPermission().isMissingUnderlyingAccess();
        }

        function canRecord() {
            return screenRecorderService.canRecord();
        }

        function getRecordBtnTooltip() {
            if (canRecord()) {
                return strings.replayAnswer.REPLAY_CANCEL_TOOLTIP_ENABLED;
            } else {
                return strings.replayAnswer.REPLAY_CANCEL_TOOLTIP;
            }
        }

        function showReplayDialogWithUsername(username) {
            dialog.show({
                title: strings.replayAnswer.REPLAY_TITLE,
                customBodyUrl: 'src/common/widgets/dialogs/templates/replay-answer-dialog.html',
                confirmBtnLabel: strings.replayAnswer.REPLAY_CONFIRM,
                cancelBtnLabel: strings.replayAnswer.REPLAY_CANCEL,
                skipCancelBtn: !canRecord(),
                doNotCloseOnNavigation: true,
                cancelTooltip: getRecordBtnTooltip(),
                customData: {
                    nameLabel: strings.replayAnswer.NAME_LABEL,
                    name: _answer.name,
                    description: _answerConfig.model.getDescription() ? _answerConfig.model.getDescription() : '-',
                    descriptionLabel: strings.replayAnswer.DESCRIPTION_LABEL,
                    lastModifiedTime: dateUtil.epochToTimeAgoString(_answerConfig.model.getMetadata().header.modified),
                    lastModifiedLabel: strings.replayAnswer.LAST_MODIFIED_LABEL,
                    author: username,
                    authorLabel: strings.replayAnswer.AUTHOR_LABEL,
                    userId: _answerConfig.model.getMetadata().header.author
                },
                onConfirm: function (customData) {
                    answerReplayRunner.doAnswerReplay(_answer).then(showEndReplayDialog);
                    return true;
                },
                onCancel: function (customData) {
                    record();
                },
                onDismiss: function (customData) {
                    navService.goToSavedAnswer(navService.getCurrentReplayAnswerId());
                    return true;
                }
            });
        }

        function showReplayDialog() {
            userService.getUserById(_answerConfig.model.getMetadata().header.author)
            .then(
            function(userModel) {
                showReplayDialogWithUsername(userModel.getDisplayName());
            },
            function() {
                showReplayDialogWithUsername('-');
            }
        );
        }

        function showCannotReplayDialog() {
            dialog.show({
                title: strings.replayAnswer.CANNOT_REPLAY_TITLE,
                message: strings.replayAnswer.CANNOT_REPLAY_MESSAGE,
                confirmBtnLabel: strings.replayAnswer.CANNOT_REPLAY_CONFIRM,
                skipCancelBtn: true,
                onConfirm: function() {
                    navService.goToSavedAnswer(navService.getCurrentReplayAnswerId());
                    return true;
                }
            });
        }

        function startReplay(answerConfig){
            if (answerConfig && answerConfig.model
            && answerConfig.type === blinkConstants.documentType.ANSWER
            && canPlayDocument(answerConfig.model)) {
                _answerConfig = answerConfig;
                parseAnswer(answerConfig.model).then(function(answer) {
                    _answer = answer;
                    showReplayDialog();
                });
            } else {
                showCannotReplayDialog();
            }
        }

    /**
     * Runs simulation of current object (obj) and records it
     */
        function record() {
            screenRecorderService.startRecording(_objectName)
            .then(
            function() {
                _isRecording = true;
                answerReplayRunner.doAnswerReplayRecord(_answer, stopRecording);
            },
            function() {
                showReplayDialog();
            }
        );
        }

        function getSimpleCol(vizCol) {
            return {
                name: vizCol.getName(),
                guid: vizCol.getBaseColumnGuid()
            };
        }

    /**
     * Extracts/organizes necessary information from answerModel
     *
     * @param {Object} answerModel object
     * @return {Object} minimal representation of an answer needed to simulate creation
     */
        function parseAnswer(answerModel) {
            var answer, phrases, tokens, formulae, vizType, vizConfig, requiredSources = {};

            var answerVizType = answerModel.getCurrentAnswerSheet().getVizSelectionAnswerMode();
            if (answerVizType === util.answerDisplayModes.TABLE) {
                vizType = chartTypeSpecificationService.chartTypes.TABLE;
            } else {
                var chart = answerModel.getCurrentAnswerSheet().getVisualizationsOfType('CHART');
                chart = chart[Object.keys(chart)[0]];
                vizType = chart.getChartType();

                var xAxisCols = chart.getXAxisColumns();
                xAxisCols = xAxisCols ? xAxisCols.map(getSimpleCol) : [];

                var yAxisCols = chart.getYAxisColumns();
                yAxisCols = yAxisCols ? yAxisCols.map(getSimpleCol) : [];

                var legendCols = chart.getLegendColumns();
                legendCols = legendCols ? legendCols.map(getSimpleCol) : [];

                var radialCol = chart.getRadialColumn();
                radialCol = radialCol ? getSimpleCol(radialCol) : null;

                vizConfig = {
                    xAxisCols: xAxisCols || [],
                    yAxisCols: yAxisCols || [],
                    legendCols: legendCols || [],
                    radialCol: radialCol,
                    isYAxisShared: chart.isYAxisShared()
                };
            }

            var question = answerModel.getQuestionInfo();
            var sageContext = answerModel.getSageContext();
            var queryText = question.text;

            formulae = sageContext.getFormulaeMap();
            var tableContext = sageContext.getTables()[0];
            phrases = tableContext.getPhrases();
            tokens = tableContext.getTokens();

            var j;
            var guids = [];
            tokens.forEach(function(token) {
                var guid = token.getTableGuid();
                if (!(guids.any(guid)) && guid) {
                    guids.push(guid);
                }
            });

            return sageDataSourceService.getSourcesModels(guids).then(function(sourceIdToModel){
                var tableNames = {};
                guids.forEach(function(newSourceId){
                    if (!sourceIdToModel[newSourceId]) {
                        return;
                    }
                    var metadata = sourceIdToModel[newSourceId].getMetadataJson();
                    if (metadata.header.id in requiredSources) {
                        return;
                    }

                    var tableName = metadata.header.name;
                    tableNames[metadata.header.id] = tableName;

                    requiredSources[metadata.header.id] = tableName;
                });

                tokens.forEach(function(token, index) {
                    tokens[index].sourceTable = tableNames[token.getTableGuid()];
                });

                _objectName = strings.replayAnswer.NAME_PREFIX + answerModel.getName();

                return {
                    phrases: phrases,
                    tokens: tokens,
                    formulae: formulae,
                    requiredSources: requiredSources,
                    queryText: queryText,
                    name: answerModel.getName(),
                    vizType: vizType,
                    vizConfig: vizConfig
                };
            });
        }

        return {
        // Functions
            canPlayDocument: canPlayDocument,
            startReplay: startReplay
        };
    }]);
