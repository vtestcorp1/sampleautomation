/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi(jasmeet@thoughtspot.com)
 *
 * @fileoverview Model for pinboard answers.
 */

'use strict';

/*global addStringFlag */
addStringFlag(
    'relatedInsightsId',
    'This flag indicates there is a related pinboard for insights',
    ''
);

blink.app.factory('PinboardAnswerModel', ['Logger',
    'AnswerModel',
    'autoCompleteObjectUtil',
    'DocumentPermissionFactory',
    'jsonConstants',
    'QuestionModel',
    'sessionService',
    'VisualizationColumnModel',
    'util',
    function (Logger,
              AnswerModel,
              autoCompleteObjectUtil,
              DocumentPermissionFactory,
              jsonConstants,
              QuestionModel,
              sessionService,
              VisualizationColumnModel,
              util) {

        var _logger = Logger.create('pinboard-answer-model');

    /**
     * @constructor
     * @extends AnswerModel
     * @param {Object} pinboardAnswerJson
     */
        var PinboardAnswerModel = function (pinboardAnswerJson) {
            PinboardAnswerModel.__super.call(this, pinboardAnswerJson);
            this._docPermission = DocumentPermissionFactory.createPinboardPermissiveInstance(
                this.getContextAnswerIds()
            );
        };

        util.inherits(PinboardAnswerModel, AnswerModel);

    /**
     * @override
     * @returns {Array.<sage.RecognizedToken>}
     */
        PinboardAnswerModel.prototype.getRecognizedTokens = function () {
            return null;
        };

    /**
     * @override
     * @returns {Array.<string>} the answerIds of the referenced answers
     */
        PinboardAnswerModel.prototype.getContextAnswerIds = function() {
            var pinboardAnswerSheet = this.getCurrentAnswerSheet();
            var pinboardVisualizations = pinboardAnswerSheet.getVisualizations();

            return Object.values(pinboardVisualizations).map(function(pinboardViz) {
                return pinboardViz.getReferencedAnswerBookId();
            }).filter(function(refAnswerId){
                return !!refAnswerId;
            });
        };

        PinboardAnswerModel.prototype.hasNoTableVizs = function() {
            var tables = this.getCurrentAnswerSheet().getPinboardVisualizationsArrayOfType(
                jsonConstants.vizType.TABLE
            );
            return !tables.length;
        };

        PinboardAnswerModel.prototype.getUsedSources = function() {
            var vizIdToUsedSourcesMap = this.getVizIdUsedSourcesMap();
            var sources = {};
            Object.values(vizIdToUsedSourcesMap).forEach(function(currentSources){
                $.extend(sources, currentSources);
            });
            return Object.keys(sources);
        };

        PinboardAnswerModel.prototype.getVizIdUsedSourcesMap = function () {
            var pinboardAnswerSheet = this.getCurrentAnswerSheet();
            var pinboardVisualizations = pinboardAnswerSheet.getVisualizations();
            var vizIdToUserSourcesMap = {};
            util.iterateObject(pinboardVisualizations, function(id, pinboardVizModel){
                var referencedViz = pinboardVizModel.getReferencedVisualization();
                if (referencedViz.isGenericViz() || referencedViz.isCorrupted()) {
                    return;
                }
                var vizColumns = referencedViz.getVizColumns();
                var sources = {};
                vizColumns.forEach(function(vizColumn){
                    var sourceIds = vizColumn.getReferencedTableIds();
                    sourceIds.forEach(function(sourceId) {
                        sources[sourceId] = true;
                    });
                });
                vizIdToUserSourcesMap[id] = sources;
            });
            return vizIdToUserSourcesMap;
        };

        PinboardAnswerModel.prototype.getVizIdToQuestionMap = function (vizIds) {
            var pinboardAnswerSheet = this.getCurrentAnswerSheet();
            var pinboardVisualizations = pinboardAnswerSheet.getVisualizations();
            var vizIdToQuestionMap = {};
            var visualizationsToShow = (vizIds && vizIds.length > 0)
                ? _.pick(pinboardVisualizations, vizIds)
                : pinboardVisualizations;
            _.forEach(visualizationsToShow, function(pinboardVizModel, id) {
                var referencedViz = pinboardVizModel.getReferencedVisualization();
                var vizType = referencedViz.getVizType();
                var isVizCluster = vizType === jsonConstants.VIZ_TYPE_CLUSTER;
                if (referencedViz.isGenericViz() || isVizCluster) {
                    return;
                }

                vizIdToQuestionMap[id] = pinboardVizModel.getOriginalQuestion();
            });
            return vizIdToQuestionMap;
        };

        PinboardAnswerModel.prototype.getVizIdToEffectiveQuestionMap = function () {
            var pinboardAnswerSheet = this.getCurrentAnswerSheet();
            var pinboardVisualizations = pinboardAnswerSheet.getVisualizations();
            var vizIdToEffectiveQuestionMap = {};
            util.iterateObject(pinboardVisualizations, function(id, pinboardVizModel){
                var referencedViz = pinboardVizModel.getReferencedVisualization();
                var vizType = referencedViz.getVizType();
                var isVizCluster = vizType === jsonConstants.VIZ_TYPE_CLUSTER;
                if (referencedViz.isGenericViz() || isVizCluster) {
                    return;
                }
                var effectiveQuestion = pinboardVizModel.getEffectiveQuestion();
                if (!!effectiveQuestion) {
                    vizIdToEffectiveQuestionMap[id] = effectiveQuestion;
                }
            });

            return vizIdToEffectiveQuestionMap;
        };

        PinboardAnswerModel.prototype.getVizIdToOverrideQuestionMap = function () {
            var pinboardAnswerSheet = this.getCurrentAnswerSheet();
            var pinboardVisualizations = pinboardAnswerSheet.getVisualizations();
            var vizIdToOverrideQuestionMap = {};
            util.iterateObject(pinboardVisualizations, function(id, pinboardVizModel){
                var referencedViz = pinboardVizModel.getReferencedVisualization();
                var vizType = referencedViz.getVizType();
                var isVizCluster = vizType === jsonConstants.VIZ_TYPE_CLUSTER;
                if (referencedViz.isGenericViz() || isVizCluster) {
                    return;
                }
                var overrideQuestion = pinboardVizModel.getOverrideQuestion();
                if (!!overrideQuestion) {
                    vizIdToOverrideQuestionMap[id] = overrideQuestion;
                }
            });

            return vizIdToOverrideQuestionMap;
        };

        PinboardAnswerModel.prototype.getVizIdToApplicableQuestionMap = function() {
            var vizIdToQuestionMap = this.getVizIdToQuestionMap();
            var effectiveQuestionMap = this.getVizIdToEffectiveQuestionMap();
            var overrideQuestionMap = this.getVizIdToOverrideQuestionMap();

            // The precedence order of question to use is Override Question > Effective Question
            // > Viz Context Question.
            _.assign(vizIdToQuestionMap, effectiveQuestionMap, overrideQuestionMap);

            return vizIdToQuestionMap;
        };

        PinboardAnswerModel.prototype.getVizIdToReferencedVizMap = function () {
            var pinboardAnswerSheet = this.getCurrentAnswerSheet();
            var pinboardVisualizations = pinboardAnswerSheet.getVisualizations();
            return _.reduce(
                pinboardVisualizations,
                function (curr, pinboardVizModel, id) {
                    curr[id] = pinboardVizModel.getReferencedVisualization();
                    return curr;
                }, {});
        };

        PinboardAnswerModel.prototype.containsFilter = function () {
            var sheet = this.getCurrentAnswerSheet();
            var filterAnswerModelId = sheet && sheet.getFilterAnswerIds();
            return filterAnswerModelId && filterAnswerModelId.length > 0;
        };

        PinboardAnswerModel.prototype.fromMetadataJson = function (json) {
            var answerJson = angular.copy(this._answerJson);
            answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY] = json;
            var newPinboardModel = new PinboardAnswerModel(answerJson);
            newPinboardModel.inheritNonJsonProperties(this);
            return newPinboardModel;
        };

        PinboardAnswerModel.prototype.replaceVizInObjectResolver = function(oldVizId, newVisualization) {
            this.getCurrentAnswerSheet().replaceVizInObjectResolver(oldVizId, newVisualization);
        };

        PinboardAnswerModel.prototype.clone = function () {
        // TODO(Jasmeet): Implement clones for all the property chain.
            return new PinboardAnswerModel(_.cloneDeep(this._answerJson));
        };

        PinboardAnswerModel.prototype.getInsightsPinboardId = function () {
        /* global flags */
            return flags.getValue('relatedInsightsId');
        };

        PinboardAnswerModel.prototype.getCurrentVisualizations = function () {
            var pinboardAnswerSheet = this.getCurrentAnswerSheet();
            return pinboardAnswerSheet.getVisualizations();
        };

        PinboardAnswerModel.prototype.getA3Request = function () {
            var pinboardAnswerSheet = this.getCurrentAnswerSheet();
            return pinboardAnswerSheet.getA3Request();
        };

        PinboardAnswerModel.prototype.getA3AnalysisFacts = function () {
            var pinboardAnswerSheet = this.getCurrentAnswerSheet();
            return pinboardAnswerSheet.getA3AnalysisFacts();
        };

        PinboardAnswerModel.prototype.getTimeToLive = function () {
            var isAutoDelete = this._header[jsonConstants.IS_AUTO_DELETE_KEY];
            return isAutoDelete
                ? this._header[jsonConstants.CREATED_KEY] + sessionService.getA3PinboardExpiryTime()
                : -1;
        };

        PinboardAnswerModel.prototype.getRegularVisualizationsCount = function () {
            var pinboardVisualizations = this.getCurrentVisualizations();
            var regularVizIds = [];
            _.forEach(pinboardVisualizations, function(pinboardVizModel, id) {
                var referencedViz = pinboardVizModel.getReferencedVisualization();
                var vizType = referencedViz.getVizType();
                var isVizCluster = vizType === jsonConstants.VIZ_TYPE_CLUSTER;
                if (referencedViz.isGenericViz() || isVizCluster) {
                    return;
                }

                regularVizIds.push(id);
            });
            return regularVizIds.length;
        };

        return PinboardAnswerModel;
    }]);
