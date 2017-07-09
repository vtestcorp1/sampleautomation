/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Stephane Kiss (stephane@thoughtspot.com), Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Data model for answer (report book)
 */

'use strict';

/**
 * AnswerSheetModel encapsulates the details of an answer sheet data returned from Callosum and exposes model methods to
 * access Visualization models.
 */
blink.app.factory('AnswerSheetModel', ['appClientStateService',
    'autoCompleteObjectUtil',
    'blinkConstants',
    'ChartModel',
    'FilterModelFactory',
    'genericVizModelFactory',
    'HeadlineModel',
    'jsonConstants',
    'Logger',
    'pinboardAnswerSheetUtil',
    'PinboardVizModel',
    'QuestionModel',
    'TableModel',
    'util',
    'VisualizationColumnModel',
    'VisualizationModel',
    'VizClusterModel',
    function (appClientStateService,
              autoCompleteObjectUtil,
              blinkConstants,
              ChartModel,
              FilterModelFactory,
              genericVizModelFactory,
              HeadlineModel,
              jsonConstants,
              Logger,
              pinboardAnswerSheetUtil,
              PinboardVizModel,
              QuestionModel,
              TableModel,
              util,
              VisualizationColumnModel,
              VisualizationModel,
              VizClusterModel) {

        var _logger = Logger.create('answer-sheet-model');

        var referencableVizTypes = [
            'CHART',
            'TABLE'
        ];
        function stabilizeReferencableVizIds(sheetJson, sheetData) {
            if (!sheetJson || !sheetJson.header || !sheetJson.header.id) {
                _logger.info('No viz id stabilization can be performed without answer sheet clientState');
                return;
            }

            var trackedVizIds =  appClientStateService.getClientState(sheetJson.header.id).trackedVizIds;
            if (!trackedVizIds || Object.size(trackedVizIds) <= 0) {
                return;
            }

            var stableIds = util.mapArrayToBooleanHash(Object.values(trackedVizIds));
            // Walk through the json and look for the vizs that are candidates for stabilization fix.
            var vizsToFix = [];

            var visualizations = sheetJson[jsonConstants.SHEETCONTENT_KEY][jsonConstants.VISUALIZATIONS_KEY];
            if (!visualizations) {
                return;
            }

            if (!sheetData || !sheetData[jsonConstants.VIZ_DATA_KEY]) {
                return;
            }

            for (var i = 0; i < visualizations.length; ++i) {
                var vizJson = visualizations[i];
                // If we already found a viz id that matches, do nothing and return.
                if (stableIds.hasOwnProperty(vizJson.header.id)) {
                    continue;
                } else if (trackedVizIds.hasOwnProperty(vizJson.vizContent.vizType)) {
                    vizsToFix.push(vizJson);
                }
            }

            if (!vizsToFix.length) {
                _logger.info('Found no candidate vizs to fix up.');
                return;
            }

            var vizDataContainer = sheetData[jsonConstants.VIZ_DATA_KEY];
            vizsToFix.each(function (vizToFix) {
                var candidateId = vizToFix.header.id;
                if (!vizDataContainer.hasOwnProperty(candidateId)) {
                    _logger.debug('Found no data node for viz %s in sheet data %o', candidateId, vizDataContainer);
                    return;
                }

                vizToFix.header.id = trackedVizIds[vizToFix.vizContent.vizType];
                vizDataContainer[vizToFix.header.id] = vizDataContainer[candidateId];
                delete vizDataContainer[candidateId];
            });
        }

        /**
         * @constructor
         * @param {Object} params See the comment for the VisualizationModel constructor.
         */
        var AnswerSheetModel = function (params) {
            var sheetJson = params.sheetJson,
                sheetData = params.sheetData,
                objectResolver = params.objectResolver,
                answerModel = params.answerModel;

            if (!sheetJson) {
                throw new Error('Answer sheet Json expected in AnswerSheetModel constructor');
            }

            stabilizeReferencableVizIds(sheetJson, sheetData);

            /**
             * @type {Object}
             * @private
             */
            this._sheetJson = sheetJson;

            /**
             * @type {Object}
             * @private
             */
            this._sheetData = sheetData;

            /**
             * @type {Object}
             * @private
             */
            this._objectResolver = objectResolver;

            /**
             *
             * @type {AnswerModel}
             * @private
             */
            this._answerModel = answerModel;

            /**
             * @type {string}
             * @private
             */
            this._sheetGuid = _getSheetGuid(sheetJson);

            this._errorPreamble = 'Answer sheet ' + this._sheetGuid;

            if (!sheetJson[jsonConstants.SHEETCONTENT_KEY]) {
                throw new Error(this._errorPreamble + ' is missing sheet content');
            }

            /**
             * An object hash storing vizContent+header json by their guids.
             * @type {Object}
             * @private
             */
            this._visualizationsMap = {};

            this._visualizationsArray = [];
            /**
             * A map from filter column effective id -> corresponding filter model.
             * Only to be used within context of a single answer and not cross the callosum boundary i.e. do not use
             * a sage token id to lookup the filter.
             *
             * @type {Map.<string, Object>}
             * @private
             */
            this._colEffectiveIdToFilterModels = {};

            this._parseVisualizations();
        };

        function _getSheetGuid(sheetJson) {
            var sheetHeader = sheetJson[jsonConstants.HEADER_KEY];
            if (!sheetHeader || !sheetHeader[jsonConstants.ID_KEY]) {
                throw new Error('Can not find guid for the answersheet');
            }

            return sheetHeader[jsonConstants.ID_KEY];
        }

        /**
         * @return {string} GUID referring to this answer sheet.
         */
        AnswerSheetModel.prototype.getId = function () {
            return this._sheetGuid;
        };

        /**
         * @param GUID to be set. Note that this method is only used by test and should not
         * be used otherwise.
         */
        AnswerSheetModel.prototype.setId = function (id) {
            this._sheetGuid = id;
        };

        /**
         * @return {string}setD
         * Returns the type of answer sheet (one of QUESTION_ANSWER or PINBOARD). On error it returns ''.
         */
        AnswerSheetModel.prototype.getSheetType = function () {
            if (!this._sheetJson || !this._sheetJson[jsonConstants.SHEETCONTENT_KEY] ||
                !this._sheetJson[jsonConstants.SHEETCONTENT_KEY][jsonConstants.SHEET_CONTENT_TYPE_KEY]) {
                return '';
            }

            return this._sheetJson[jsonConstants.SHEETCONTENT_KEY][jsonConstants.SHEET_CONTENT_TYPE_KEY];
        };

        AnswerSheetModel.prototype.hasDataForViz = function (vizId) {
            return this._sheetData
                && this._sheetData[jsonConstants.VIZ_DATA_KEY]
                && this._sheetData[jsonConstants.VIZ_DATA_KEY].hasOwnProperty(vizId);
        };

        AnswerSheetModel.prototype.setDataForViz = function (vizId, vizType, vizData) {
            if (!this._sheetData) {
                this._sheetData = {};
            }
            if (!this._sheetData[jsonConstants.VIZ_DATA_KEY]) {
                this._sheetData[jsonConstants.VIZ_DATA_KEY] = {};
            }
            var vizDataNode = this._sheetData[jsonConstants.VIZ_DATA_KEY][vizId]= {};

            if (vizType.toLowerCase() === jsonConstants.VIZ_TYPE_CHART) {
                vizDataNode[jsonConstants.CHART_DATA_KEY] = vizData;
            } else {
                vizDataNode[jsonConstants.DATA_SETS_KEY] = {};
                vizDataNode[jsonConstants.DATA_SETS_KEY][vizType] = vizData;
            }
        };

        AnswerSheetModel.prototype.clearDataForViz = function (vizId) {
            if (!this._sheetData || !this._sheetData[jsonConstants.VIZ_DATA_KEY]) {
                return;
            }

            delete this._sheetData[jsonConstants.VIZ_DATA_KEY][vizId];
        };

        AnswerSheetModel.prototype.getSheetData = function () {
            return this._sheetData;
        };

        AnswerSheetModel.prototype.updateVizData = function (sheetData) {
            this._sheetData = this._sheetData || {};
            this._sheetData[jsonConstants.VIZ_DATA_KEY] = sheetData[jsonConstants.VIZ_DATA_KEY];
            this._parseVisualizations();
        };

        /**
         * Gets the question object from the json
         */
        AnswerSheetModel.prototype.getQuestionInfo = function () {
            var questionJson = this._sheetJson[jsonConstants.SHEETCONTENT_KEY]
                [jsonConstants.QUESTION_KEY];

            return new QuestionModel(questionJson);
        };

        /**
         * @return {string}
         * Returns the answer sheet name
         */
        AnswerSheetModel.prototype.getName = function () {
            return this._sheetJson[jsonConstants.HEADER_KEY][jsonConstants.NAME_KEY];
        };

        AnswerSheetModel.prototype._needsVizIdStabilization = function () {
            return this.getSheetType() === 'QUESTION';
        };

        AnswerSheetModel.prototype._trackVizId = function (vizType, vizId) {
            if (!referencableVizTypes.any(vizType) || !this._needsVizIdStabilization()) {
                return;
            }

            var clientState = appClientStateService.getClientState(this.getId()),
                trackedVizIds;

            if (!clientState.trackedVizIds) {
                clientState.trackedVizIds = {};
            }
            trackedVizIds = clientState.trackedVizIds;

            // If there are more than one viz of same type, we use the last one. This is okay because we only do this in
            // answer and only for chart and table viz types.
            trackedVizIds[vizType] = vizId;
        };

        AnswerSheetModel.prototype._addVisualization = function(visualizationModel) {
            this._visualizationsArray.push(visualizationModel);
            this._visualizationsMap[visualizationModel.getId()] = visualizationModel;
        };

        /**
         * Parses the visualizations list in the sheet json into VisualizationModel object and populates the guid based hash
         * of visualization objects.
         * @private
         */
        AnswerSheetModel.prototype._parseVisualizations = function () {
            // TODO(Jasmeet): Move the logic of object creation to a VisualizationModelFactory.
            var visualizations = this._sheetJson[jsonConstants.SHEETCONTENT_KEY][jsonConstants.VISUALIZATIONS_KEY];
            if (!visualizations) {
                _logger.warn(this._errorPreamble + ' is missing visualizations spec');
                return;
            }

            if (!this._sheetData || !this._sheetData[jsonConstants.VIZ_DATA_KEY]) {
                _logger.warn(this._errorPreamble + ' is missing sheet vizData spec');
                return;
            }

            var answerModel = this._answerModel,
                vizs = visualizations.map(function(vizJson){
                    return new VisualizationModel({
                        vizJson: vizJson,
                        answerModel: answerModel
                    });
                }),
                vizDataContainer = this._sheetData[jsonConstants.VIZ_DATA_KEY],
                vizDataSets = vizs.map(function(viz){
                    if (viz.isCorrupted()) {
                        return null;
                    }

                    // If the viz is configured to load data lazily, allow the answer sheet to build the visualization model
                    // to include some partial info (like filter title).
                    if (viz.isDataOnDemand()) {
                        return null;
                    }

                    if (!vizDataContainer.hasOwnProperty(viz.getId())) {
                        return null;
                    }

                    var  vizType = viz.getVizType();

                    if (vizType.toLowerCase() === jsonConstants.VIZ_TYPE_CHART) {
                        return vizDataContainer[viz.getId()][jsonConstants.CHART_DATA_KEY] || null;
                    }

                    var dataSets = vizDataContainer[viz.getId()][jsonConstants.DATA_SETS_KEY] || null;
                    if (!dataSets) {
                        return null;
                    }
                    return dataSets[viz.getVizType()];
                });


            // make one pass over all the visualization data, creating Visualizations and collating columns information
            // from all the visualizations. we need to do this as at this moment no single visualization has info about
            // all the columns. For example, table does not have the filter columns but only table has cardinality
            // information
            var allColumnsByEffectiveId = {},
                vizTypesForColumnId = {};
            vizs.each(function(viz, vizIndex){
                if (viz.isCorrupted()) {
                    return;
                }

                var cols = viz.getColumns();
                //viz does not have columns info
                if (!cols) {
                    return;
                }

                var vizData = vizDataSets && vizDataSets[vizIndex],
                    vizType = viz.getVizType();
                cols.each(function(colJson, colIndex){
                    if (!colJson) {
                        return;
                    }

                    //the structure of colJson is different for headline compared to table
                    // We ignore columns from headlines as they are supposed to be copies of table columns.
                    if (vizType === 'HEADLINE') {
                        return;
                    }

                    var vizCol = new VisualizationColumnModel(colJson, -1),
                        effectiveId = vizCol.getSageOutputColumnId();

                    if (!Object.has(vizTypesForColumnId, effectiveId)) {
                        vizTypesForColumnId[effectiveId] = [];
                    }
                    vizTypesForColumnId[effectiveId].push(vizType);

                    if (!Object.has(allColumnsByEffectiveId, effectiveId)) {
                        allColumnsByEffectiveId[effectiveId] = vizCol;
                    }
                });
            });
            var allColumns = Object.values(allColumnsByEffectiveId);
            Object.keys(allColumnsByEffectiveId).each(function(colId){
                var sourceVizTypes =  vizTypesForColumnId[colId];
                //a column is a "filter column" iff its only source is a filter viz
                if (sourceVizTypes.length === 1 && sourceVizTypes[0] === 'FILTER') {
                    var col = allColumnsByEffectiveId[colId];
                    col.setIsFilterColumn(true);
                }
            });

            var resolvedObjects = pinboardAnswerSheetUtil.getPinboardVisualizationModels(
                this._objectResolver,
                this._answerModel
            );

            var colorIndex = 0;
            var clusterVizs = [];
            for (var i = 0; i < vizs.length; ++i) {
                var viz = vizs[i],
                    vizJson = visualizations[i];

                var data = vizDataSets && vizDataSets[i];

                switch (viz.getVizType()) {
                    case 'CHART':
                        try {
                            var chartModel = new ChartModel({
                                vizJson: vizJson,
                                answerModel: this._answerModel,
                                allColumns: allColumns
                            });
                            chartModel.updateData(data);
                            this._addVisualization(chartModel);
                            this._trackVizId('CHART', viz.getId());
                        } catch(e) {
                            _logger.error('error in creating a chart model', e);
                        }
                        break;
                    case 'TABLE':
                        try {
                            var tableModel = new TableModel({
                                vizJson: vizJson,
                                vizData: data,
                                answerModel: this._answerModel
                            });
                            this._addVisualization(tableModel);
                            this._trackVizId('TABLE', viz.getId());
                        } catch (e) {
                            _logger.error('error in creating a table model', e);
                        }
                        break;
                    case 'HEADLINE':
                        try {
                            var hModel = new HeadlineModel({
                                vizJson: vizJson,
                                vizData: data,
                                answerModel: this._answerModel
                            });
                            this._trackVizId('HEADLINE', viz.getId());
                            this._addVisualization(hModel);
                        } catch (e) {
                            _logger.error('error in creating a headline model', e);
                        }
                        break;
                    case 'FILTER':
                        try {
                            var filterModel = FilterModelFactory.getFilterModel({
                                vizJson: vizJson,
                                vizData: data,
                                answerSheetJson: this._sheetJson,
                                answerModel: this._answerModel
                            });
                            this._addVisualization(filterModel);
                            this._colEffectiveIdToFilterModels[filterModel.getColumn().getSageOutputColumnId()] = filterModel;
                        } catch (e) {
                            _logger.error('error in creating a filter model', e);
                        }
                        break;
                    case 'PINBOARD_VIZ':
                        try {
                            var referencedViz = resolvedObjects[vizJson.vizContent.refVizId];
                            var pinboardViz = new PinboardVizModel(
                                {
                                    vizJson: vizJson,
                                    answerModel: this._answerModel
                                },
                                referencedViz
                            );

                            var referencedViz = pinboardViz.getReferencedVisualization();
                            if (!referencedViz) {
                                _logger.error('Referenced viz not found in pinboard viz', pinboardViz);
                                break;
                            }

                            // NOTE: In case of referenced filter models we display them using their
                            // containing answers.
                            if (referencedViz.getVizType() == 'FILTER') {
                                break;
                            }

                            if (referencedViz.getVizType() == 'CHART') {
                                referencedViz.setContextOptions({
                                    colorIndex: colorIndex++
                                });
                            }

                            this._addVisualization(pinboardViz);
                        } catch (e) {
                            _logger.error('error in creating a pinboard viz model', e);
                        }
                        break;
                    case 'GENERIC_VIZ':
                        try {
                            var referencedViz = pinboardAnswerSheetUtil
                                .resolveReferencedGenericVisualization(
                                    viz.getVizSubtype(),
                                    vizJson,
                                    this._answerModel
                                );
                            var pinboardVizGeneric = new PinboardVizModel(
                                {
                                    vizJson: vizJson,
                                    answerModel: this._answerModel
                                },
                                referencedViz
                            );

                            if (!!pinboardVizGeneric) {
                                var referencedVizGeneric = pinboardVizGeneric.getReferencedVisualization();
                                if (!referencedVizGeneric) {
                                    if (!viz.isCorrupted()) {
                                        _logger.error(
                                            'A valid pinboard visualization found without a referenced visualization',
                                            vizJson
                                        );
                                        return;
                                    }
                                }
                                this._addVisualization(pinboardVizGeneric);
                            }
                        } catch (e) {
                            _logger.error('error in creating a pinboard viz model', e);
                        }
                        break;
                    case jsonConstants.VIZ_TYPE_CLUSTER:
                        var clusterViz = new VizClusterModel({
                            vizJson: vizJson,
                            vizMap: this._visualizationsMap,
                            answerModel: this._answerModel
                        });
                        var pbViz = new PinboardVizModel(
                            {
                                vizJson: vizJson,
                                answerModel: this._answerModel
                            },
                            clusterViz
                        );
                        this._addVisualization(pbViz);
                        clusterVizs.push(clusterViz);

                    default:
                        break;
                }
            }
            // As part of the viz model parsing, we may have combined 2 into one and marked the other to be removed.
            this._sheetJson[jsonConstants.SHEETCONTENT_KEY][jsonConstants.VISUALIZATIONS_KEY] =
                visualizations.filter(function (v) {
                    return v !== null;
                });

            // Allow cluster visualizations to resolve the referenced vizs.
            var vizMap = this._visualizationsMap;
            clusterVizs.forEach(function(clusterViz) {
                clusterViz.resolveMembers(vizMap);
            });
        };

        /**
         *
         * @param {Object} vizJson
         */
        AnswerSheetModel.prototype.addVisualization = function (vizJson) {
            this._sheetJson[jsonConstants.SHEETCONTENT_KEY][jsonConstants.VISUALIZATIONS_KEY].push(vizJson);
        };

        AnswerSheetModel.prototype.removeVisualization = function (vizModel) {
            var vizIdToRemove = vizModel.getId();
            this._sheetJson[jsonConstants.SHEETCONTENT_KEY][jsonConstants.VISUALIZATIONS_KEY] =
                this._sheetJson[jsonConstants.SHEETCONTENT_KEY][jsonConstants.VISUALIZATIONS_KEY].filter(function (viz) {
                    return viz.header.id !== vizIdToRemove;
                });
        };

        AnswerSheetModel.prototype.hasFilter = function () {
            return this._sheetJson[jsonConstants.SHEETCONTENT_KEY] &&
                this._sheetJson[jsonConstants.SHEETCONTENT_KEY].filter &&
                this._sheetJson[jsonConstants.SHEETCONTENT_KEY].filter.header;
        };

        /**
         *
         * @param {Visualization.Column} column
         * @param {Object=} newFilterGuid
         * @return {number} Total number of filter rows after this addition. -1 in case of errors.
         *
         */
        AnswerSheetModel.prototype.addFilter = function (column, newFilterGuid) {
            var sheetContent = this._sheetJson[jsonConstants.SHEETCONTENT_KEY];
            if (!sheetContent) {
                _logger.error('Can not add filter to empty answer sheet', this._sheetJson);
                return -1;
            }

            if (!sheetContent.filter) {
                if (newFilterGuid === null) {
                    _logger.error('Can not add a new filter without a valid guid');
                    return -1;
                }
                sheetContent.filter = {
                    filterContent: {
                        type: 'SIMPLE',
                        rows: []
                    },
                    header: {
                        id: newFilterGuid,
                        name: 'User added filter',
                        owner: this.getId()
                    }
                };
            }

            if (!sheetContent.filter.filterContent || !sheetContent.filter.filterContent.rows) {
                _logger.error('Invalid filter spec in the answer sheet', this._sheetJson);
                return -1;
            }

            var oper = 'IN';
            if (column.isMeasure() || column.isDateColumn()) {
                oper = 'GE';
            }
            sheetContent.filter.filterContent.rows.push({
                column: column.getJson(),
                oper: oper
            });

            return sheetContent.filter.filterContent.rows.length;
        };
        /**
         *
         * @param {number} filterRow
         * @return {Object} removed filter definition
         *
         */
        AnswerSheetModel.prototype.removeFilter = function (filterRow) {
            var sheetContent = this._sheetJson[jsonConstants.SHEETCONTENT_KEY];
            if (!sheetContent || !sheetContent.filter || !sheetContent.filter.filterContent ||
                !sheetContent.filter.filterContent.rows || sheetContent.filter.filterContent.rows.length <= filterRow) {
                _logger.error('Answer sheet is empty or does not contain the specified filter row',
                    this._sheetJson, filterRow);
                return null;
            }

            var removedFilter = sheetContent.filter.filterContent.rows.splice(filterRow, 1);
            if (sheetContent.filter.filterContent.rows.length <= 0) {
                delete sheetContent.filter;
            }

            this._visualizationsArray.forEach(function (viz) {
                if (viz.getVizType() != 'FILTER' || viz.getJson().rowIndex === filterRow) {
                    return;
                }

                viz.updateRowIndexAfterRemoving(filterRow);
            });

            return removedFilter;
        };

        /**
         * @return {Object} An object containing the visualizations for the answer sheet
         * TODO(mahesh) Rename getVisualizations() to getVisualizationsMap() in next commit
         * for clarity and consistency also just use getVisualizationsArray() at places
         * where we are just using the first element using vizMap[Obejct.keys[0]].
         */
        AnswerSheetModel.prototype.getVisualizations = function () {
            return this._visualizationsMap;
        };

        AnswerSheetModel.prototype.getVisualizationsArray = function () {
            return this._visualizationsArray;
        };

        /**
         * @param {string} type - if null or empty, then return all visualizations
         * @returns {Array} An array containing the visualizations for the given type for the answer sheet
         */
        AnswerSheetModel.prototype.getVisualizationsArrayOfType = function (type) {
            return this._visualizationsArray.filter(function(viz) {
                return viz.getVizType() === type;
            });
        };

        /**
         * @param {string} type - if null or empty, then return all visualizations
         * @returns {Array} An array containing the pinboard visualizations for the given type for the answer sheet
         */
        AnswerSheetModel.prototype.getPinboardVisualizationsArrayOfType = function (type) {
            return this._visualizationsArray.filter(function(viz) {
                return viz.getReferencedVisualization().getVizType() === type;
            });
        };


        /**
         * @param {string} type - if null or empty, then return all visualizations
         * @returns {Object} An object containing the visualizations for the given type for the answer sheet
         * TODO (mahesh) rename this function to getVisualizationsMapOfType in next commit for clarity.
         */
        AnswerSheetModel.prototype.getVisualizationsOfType = function (type) {
            var vizsOfType = this.getVisualizationsArrayOfType(type);
            var map = vizsOfType.reduce(function(map, viz){
                map[viz.getId()] = viz;
                return map;
            }, {});
            return map;
        };

        /**
         * @returns {Array.<TableModel>}
         * TODO (mahesh) rename this to getTableVisualizationsArray() in next commit.
         */
        AnswerSheetModel.prototype.getTableVisualizations = function () {
            return this.getVisualizationsArrayOfType(jsonConstants.vizType.TABLE);
        };

        /**
         * @returns {Array.<FilterModel>}
         * TODO (mahesh) rename this to getFilterVisualizationsArray() in next commit.
         */
        AnswerSheetModel.prototype.getFilterVisualizations = function () {
            return this.getVisualizationsArrayOfType(jsonConstants.vizType.FILTER);
        };

        /**
         * @returns {Array.<ChartModel>}
         * TODO (mahesh) rename this to getChartVisualizationsArray() in next commit.
         */
        AnswerSheetModel.prototype.getChartVisualizations = function () {
            return this.getVisualizationsArrayOfType(jsonConstants.vizType.CHART);
        };

        AnswerSheetModel.prototype.getHeadlineVisualizations = function () {
            return this.getVisualizationsArrayOfType(jsonConstants.vizType.HEADLINE);
        };

        AnswerSheetModel.prototype.getReferencedVisualizationsArrayOfType = function (type) {
            return this._visualizationsArray.filter(function(viz) {
                var vizType = viz.getVizType();
                if (vizType === jsonConstants.vizType.PINBOARD_VIZ) {
                    vizType = viz.getReferencedVisualization().getVizType();
                }
                return vizType === type;
            });
        };

        AnswerSheetModel.prototype.getReferencedTableVisualizationsArray = function () {
            return this.getReferencedVisualizationsArrayOfType(jsonConstants.vizType.TABLE);
        };

        /**
         * Returns whether the answer sheet is empty
         *
         * @return {boolean}  True if the answer sheet contains no visualizations
         */
        AnswerSheetModel.prototype.isEmpty = function () {
            return this._visualizationsArray.length === 0;
        };

        /**
         * @return {Array} An array of objects containing for each viz its id, and optionnaly
         * position and size information
         */
        AnswerSheetModel.prototype.getLayoutTiles = function (flattenClusters, applyInsightsStyle) {
            if (this._sheetJson.sheetContent && !this._sheetJson.sheetContent.layout) {
                this._sheetJson.sheetContent.layout = {};
            }

            if (!this._sheetJson.sheetContent.layout.tiles) {
                this._sheetJson.sheetContent.layout.tiles = [];
            }

            this._sheetJson.sheetContent.layout.tiles = pinboardAnswerSheetUtil.getPinboardLayout(
                this._sheetJson.sheetContent.layout.tiles,
                this._visualizationsMap,
                this._visualizationsArray,
                flattenClusters,
                applyInsightsStyle
            );

            return this._sheetJson.sheetContent.layout.tiles;
        };

        AnswerSheetModel.prototype.getLayoutTemplate = function () {
            if (this._sheetJson.sheetContent && this._sheetJson.sheetContent.layout &&
                this._sheetJson.sheetContent.layout.layoutTemplate) {
                return this._sheetJson.sheetContent.layout.layoutTemplate;
            }

            return '';
        };

        AnswerSheetModel.prototype.setLayoutTemplate = function (layoutTemplate) {
            if (!this._sheetJson.sheetContent.layout) {
                this._sheetJson.sheetContent.layout = {};
            }

            this._sheetJson.sheetContent.layout.layoutTemplate = layoutTemplate;
        };

        AnswerSheetModel.prototype.getLayoutMode = function () {
            if (this._sheetJson.sheetContent && this._sheetJson.sheetContent.layout &&
                this._sheetJson.sheetContent.layout.layoutMode) {
                return this._sheetJson.sheetContent.layout.layoutMode;
            }
            return '';
        };

        AnswerSheetModel.prototype.setLayoutMode = function (layoutMode) {
            if (!this._sheetJson.sheetContent.layout) {
                this._sheetJson.sheetContent.layout = {};
            }

            this._sheetJson.sheetContent.layout.layoutMode = layoutMode;
        };

        /**
         * @param {string} id The guid of the visualization for which model is requested.
         * @return {Object} The vizContent+header json for a given guid.
         */
        AnswerSheetModel.prototype.getVisualization = function (id) {
            return this._visualizationsMap[id] || null;
        };

        AnswerSheetModel.prototype.getJson = function () {
            return this._sheetJson;
        };

        /**
         * Returns the name of this answersheet.
         * @return {string}
         */
        AnswerSheetModel.prototype.getName = function () {
            return this._sheetJson[jsonConstants.HEADER_KEY][jsonConstants.NAME_KEY];

        };

        /**
         * Returns the description of this answersheet.
         * @return {string}
         */
        AnswerSheetModel.prototype.getDescription = function () {
            return this._sheetJson[jsonConstants.HEADER_KEY][jsonConstants.DESCRIPTION_KEY];
        };

        /**
         * Sets the name of this answersheet to name.
         * @param {string} name
         */
        AnswerSheetModel.prototype.setName = function (name) {
            this._sheetJson[jsonConstants.HEADER_KEY][jsonConstants.NAME_KEY] = name;

        };

        /**
         * Sets the description of this answersheet to desc.
         * @param {string} desc
         */
        AnswerSheetModel.prototype.setDescription = function (desc) {
            this._sheetJson[jsonConstants.HEADER_KEY][jsonConstants.DESCRIPTION_KEY] = desc;
        };

        /**
         * @returns {sage.ACContext}
         */
        AnswerSheetModel.prototype.getSageContext = function() {
            try {
                var questionInfo = this.getQuestionInfo();
                if (!questionInfo) {
                    return null;
                }
                return questionInfo[jsonConstants.SAGE_CONTEXT_PROTO_KEY];
            } catch(error) {
                _logger.warn('error in deserializing context', error);
                return null;
            }
        };

        /**
         * @returns {int}
         */
        AnswerSheetModel.prototype.getSageContextIndex = function() {
            var questionInfo = this.getQuestionInfo();
            if (!questionInfo) {
                return null;
            }
            return questionInfo[jsonConstants.SAGE_CONTEXT_INDEX_KEY];
        };

        /**
         * @param {sage.ACContext} context
         * @param {index} index
         */
        AnswerSheetModel.prototype.setSageContext = function(context, index) {
            var questionJson = this._sheetJson[jsonConstants.SHEETCONTENT_KEY]
                [jsonConstants.QUESTION_KEY];

            questionJson[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = sage.serialize(context);
            questionJson[jsonConstants.SAGE_CONTEXT_INDEX_KEY] = index;
        };

        /**
         * Parses the json string form of list of recognized tokens stored in the answer-sheet
         * and converts each json object into a first class RecognizedToken.
         *
         * @return {Array.<sage.RecognizedToken>}
         */
        AnswerSheetModel.prototype.getRecognizedTokens = function () {
            var sageContext = this.getSageContext();
            var index = this.getSageContextIndex();
            if (!sageContext) {
                _logger.error('Undefined sage context');
                return void 0;
            }
            if (index < 0) {
                // NOTE: The getters should have already addressed backward compatibility.
                _logger.error('Index cannot be less that 0', index);
                return void 0;
            }

            var table = sageContext.getTables()[index];
            return table.getTokens();
        };

        /**
         * Returns the mode chart, table that this answer model was saved in.
         * @return {string}
         */
        AnswerSheetModel.prototype.getVizSelectionAnswerMode = function () {
            var clientState = this._sheetJson[jsonConstants.HEADER_KEY][jsonConstants.CLIENT_STATE_KEY];
            if (!clientState) {
                return null;
            }
            return clientState[jsonConstants.CLIENT_STATE_VIZ_SELECTION_ANSWER_MODE_KEY];
        };

        AnswerSheetModel.prototype.getPrimaryDisplayedViz = function () {
            var answerVizType = this.getVizSelectionAnswerMode();
            var vizModel;
            if (answerVizType === util.answerDisplayModes.TABLE) {
                vizModel = this.getTableVisualizations()[0];
            } else {
                vizModel = this.getChartVisualizations()[0];
            }

            return vizModel;
        };

        /**
         * Sets the mode chart, table that this answer model is in.
         * @param {string} mode
         */
        AnswerSheetModel.prototype.setVizSelectionAnswerMode = function (mode) {
            var clientState = this._sheetJson[jsonConstants.HEADER_KEY][jsonConstants.CLIENT_STATE_KEY];
            if (!clientState) {
                // client state may not exist; create new
                clientState = {};
                this._sheetJson[jsonConstants.HEADER_KEY][jsonConstants.CLIENT_STATE_KEY] = clientState;
            }
            clientState[jsonConstants.CLIENT_STATE_VIZ_SELECTION_ANSWER_MODE_KEY] = mode;
        };

        /**
         * Returns if leaf data is allowed on the answer.
         * @returns {boolean}
         */
        AnswerSheetModel.prototype.canGenerateLeafData = function () {
            return !!this._sheetJson.sheetContent.canGenerateLeafData;
        };

        /**
         *
         * @param {VisualizationColumnModel} column
         * @return {FilterModel|null}
         */
        AnswerSheetModel.prototype.getFilterModelByColumn = function (column) {
            return this._colEffectiveIdToFilterModels[column.getSageOutputColumnId()] || null;
        };

        AnswerSheetModel.prototype.setFilterModelByColumn = function (column, newFilterModel) {
            this._colEffectiveIdToFilterModels[column.getSageOutputColumnId()] = newFilterModel;
        };

        AnswerSheetModel.prototype.hasFilterForColumn = function (column) {
            return !!this._colEffectiveIdToFilterModels[column.getSageOutputColumnId()];
        };

        AnswerSheetModel.prototype.getTableColumns = function() {
            var tableModels = this.getTableVisualizations();
            if (tableModels.length != 1) {
                _logger.error('answer sheet model should be having one and onle one table visualization');
            }
            var tableModel = tableModels[0];
            return tableModel.getVizColumns();
        };

        AnswerSheetModel.prototype.getFilterAnswerIds = function() {
            var content = this._sheetJson && this._sheetJson[jsonConstants.SHEETCONTENT_KEY];
            var ids = util.prop(content, 'pinboardFilterDetails.pinboardFiltersAnswerIds');
            return ids || [];
        };

        AnswerSheetModel.prototype.getFilterDataSources = function () {
            var content = this._sheetJson && this._sheetJson[jsonConstants.SHEETCONTENT_KEY];
            var ids = util.prop(content, 'pinboardFilterDetails.filterLogicalTableIds');
            return ids || [];
        };

        AnswerSheetModel.prototype.replaceVizInObjectResolver = function(oldVizId, newVisualization) {
            delete this._objectResolver[oldVizId];
            var newVizId = newVisualization.getId();
            this._objectResolver[newVizId] = newVisualization._vizJson;
            this._parseVisualizations();
        };

        AnswerSheetModel.prototype.containsVisualization = function(vizId) {
            return this._visualizationsMap[vizId] !== void 0;
        };

        AnswerSheetModel.prototype.getA3Request = function () {
            var serializedA3Requst = _.get(
                this._sheetJson,
                [
                    jsonConstants.SHEETCONTENT_KEY,
                    jsonConstants.PINBOARD_A3_DETAILS_KEY,
                    jsonConstants.A3_REQUEST_PROTO_KEY
                ]
            );
            return !!serializedA3Requst
                ? sage.deserialize(serializedA3Requst, tsProto.sage.A3Request)
                : null;
        };

        AnswerSheetModel.prototype.getA3AnalysisFacts = function () {
            var serializedAnalysisFacts = _.get(
                this._sheetJson,
                [
                    jsonConstants.SHEETCONTENT_KEY,
                    jsonConstants.PINBOARD_A3_DETAILS_KEY,
                    jsonConstants.A3_ANALYSIS_FACTS_PROTO_KEY
                ]
            );
            return !!serializedAnalysisFacts
                ? sage.deserialize(serializedAnalysisFacts, tsProto.sage.AnalysisFacts)
                : null;
        };

        return AnswerSheetModel;
    }]);
