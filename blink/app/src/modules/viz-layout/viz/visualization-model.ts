/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com),
 *         Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Data model for visualization.
 */

/**
 * VisualizationModel encapsulates the details of visualization.
 */
import _ from 'lodash';
import {ngRequire, Provide} from 'src/base/decorators';
import {blinkConstants} from '../../../base/blink-constants';
import {QuestionModel} from '../../callosum/model/question-model';
import {VisualizationColumnModel} from '../../callosum/model/visualization-column';

let vizContextMenuUtil = ngRequire('vizContextMenuUtil');
let Logger = ngRequire('Logger');
let jsonConstants = ngRequire('jsonConstants');
let util = ngRequire('util');

declare var Error: any;

declare let addNumberFlag: any;
declare let flags: any;

addNumberFlag(
    'dataBatchSize',
    'Max number of data points to fetch in callosum data api call',
    0
);

@Provide('VisualizationModel')
export class VisualizationModel {
    protected _logger: any = Logger.create(
        'visualization-model'
    );
    protected _vizData;
    protected _dataBatchSize : number =
        flags.getValue('dataBatchSize') || blinkConstants.DEFAULT_DATA_BATCH_SIZE;
    protected _isRenderReady: boolean = false;
    protected _isSecondaryRenderReady: boolean = false;

    private _referencingVizModel;
    private _answerModel;
    private _vizColumns;
    private _dataLoadFailed;
    private _vizJson;
    // This is used in case of headline models to ignore rendering when query is sampled.
    // In such cases the viz is not rendered as we know that the result is going to be
    // inaccurate.
    private ignoreRendering: boolean = false;

    public static createEmptyVisualizationDefinition (answerSheet, vizType, vizGuid) {
        return {
            vizContent: {
                vizType: vizType
            },
            header: {
                id: vizGuid,
                name: 'User created visualization',
                owner: answerSheet.getId()
            }
        };
    }

    public static areDefinitionsEqual (a, b) : boolean {
        return a.getId() === b.getId() &&
            JSON.stringify(a.getJson()) === JSON.stringify(b.getJson());
    }

    public static areDataEqual(a, b) : boolean {
        return JSON.stringify(a.getVizData()) === JSON.stringify(b.getVizData());
    }

    /**
     * Whether two viz models are equal
     *
     * @param {Object}  a   First viz model
     * @param {Object}  b   Second viz model
     * @return {boolean}
     */
    public static areModelsEqual(a, b) : boolean {
        return  VisualizationModel.areDefinitionsEqual(a, b)
            && VisualizationModel.areDataEqual(a, b);
    }

    /**
     * @param {Object} params Contains following properties:
     *    - vizJson Json backing the visualization definition.
     *    - vizData The visualization data for this viz.
     *    - referencingVizModel Optional argument, when provided means this VisualizationModel
     *      object is actually a reference copy of visualization from another book.
     *      The referencingVizModel is the object in current book holding the
     *      reference. See PinboardVizModel::getReferencedVisualization() for
     *      more details.
     *
     * @constructor
     */
    constructor(public params: any) {
        var vizJson = params.vizJson,
            vizData = params.vizData,
            referencingVizModel = params.referencingVizModel;

        this._vizJson = vizJson;

        this._vizData = vizData || {};

        this._referencingVizModel = referencingVizModel || null;

        this._answerModel = params.answerModel || null;

        this._vizColumns = null;

        this._dataLoadFailed = false;

        if (vizData && _.has(vizData, 'currentOffset')) {
            this.setSavedDataOffset(this._vizData.currentOffset);
        }

        var header = vizJson[jsonConstants.HEADER_KEY] || null;
        if (!header) {
            throw new Error('Invalid visualization specification (no header found)', vizJson);
        }
    }

    /**
     * @return {string} Id of the visualization this model represents.
     */
    public getId () : string {
        return this._vizJson[jsonConstants.HEADER_KEY][jsonConstants.ID_KEY];
    }

    public isCorrupted () : boolean {
        return !this._vizJson[jsonConstants.VIZ_COMPLETE_KEY];
    }

    // TODO (Ashish/Rahul): We should ideally combine primary
    // and secondary render into a render state enum.
    public isRenderReady () : boolean {
        return this._isRenderReady;
    }

    public setRenderReady (state: boolean) {
        this._isRenderReady = state;
    }

    public isSecondaryRenderReady () : boolean {
        return this._isSecondaryRenderReady;
    }

    public setSecondaryRenderReady (state: boolean) {
        this._isSecondaryRenderReady = state;
    }

    /**
     * @return {string} Type of the visualization this model represents.
     */
    public getVizType () {
        return util.prop(this._vizJson,
                [jsonConstants.VIZ_CONTENT_KEY, jsonConstants.VIZ_TYPE_KEY]) || '';
    }

    /**
     * @return {string} Subtype of the visualization this model represents.
     */
    public getVizSubtype () {
        return util.prop(this._vizJson,
                [jsonConstants.VIZ_CONTENT_KEY, jsonConstants.VIZ_SUBTYPE_KEY]) || '';
    }

    /**
     * @return {string} The name of the viz
     */
    public getName () {
        return this._vizJson[jsonConstants.HEADER_KEY][jsonConstants.VIZ_NAME_KEY];
    }

    public setName(name) {
        util.setProp(this._vizJson,
            [jsonConstants.VIZ_HEADER_KEY, jsonConstants.VIZ_NAME_KEY], name);
    }

    public getDescription () {
        if (!this._vizJson) {
            return '';
        }

        return this._vizJson[jsonConstants.VIZ_HEADER_KEY][jsonConstants.DESCRIPTION_KEY] || '';
    }

    public setDescription(description) {
        util.setProp(this._vizJson,
            [jsonConstants.VIZ_HEADER_KEY, jsonConstants.DESCRIPTION_KEY], description);
    }

    /**
     * Get the viz title
     * @return {string} The title of the viz
     */
    public getTitle () {
        var vizContent = this._vizJson[jsonConstants.VIZ_CONTENT_KEY];
        if (!vizContent) {
            return '';
        }

        var vizTitleObj = vizContent[jsonConstants.VIZ_TITLE_KEY];
        if (!vizTitleObj) {
            return '';
        }

        return vizTitleObj[jsonConstants.VALUE_KEY][jsonConstants.TEXT_KEY];
    }

    public getDisplayedViz() : VisualizationModel {
        return this;
    }

    /**
     * Set the viz title
     * @param {string} title      The value we want to set as title
     */
    public setTitle (title) {
        var titlePath = [
            jsonConstants.VIZ_CONTENT_KEY,
            jsonConstants.VIZ_TITLE_KEY,
            jsonConstants.VALUE_KEY,
            jsonConstants.TEXT_KEY
        ];
        util.setProp(this._vizJson, titlePath, title);
        var customTitlePath = [jsonConstants.VIZ_CONTENT_KEY, jsonConstants.VIZ_CUSTOM_TITLE];
        util.setProp(this._vizJson, customTitlePath, true);
    }

    public isTitleUserDefined () {
        return util.prop(this._vizJson,
            [jsonConstants.VIZ_CONTENT_KEY, jsonConstants.VIZ_CUSTOM_TITLE]);
    }

    public setAutoTitle (prefixString) {
        prefixString = prefixString.trim();
        if (!prefixString) {
            return;
        }
        var vizType = this.getVizType().toLowerCase();
        this.setTitle(prefixString + ' ' + vizType);
    }

    /**
     * Returns the visualization's content definition object.
     */
     public getJson () : any {
        return this._vizJson[jsonConstants.VIZ_CONTENT_KEY];
    }

    /**
     * This visualization's data object.
     *
     * @return {Object}
     */
    public getVizData () {
        return this._vizData;
    }

    /**
     * Size of the visualization's data
     *
     * @returns {number}
     */
    public getVizDataSize () {
        let vizData = this._vizData && this._vizData[0];
        return (vizData)
            ? this._vizData.length * this._vizData[0].lengthAdjust
            : 0;
    }

    public updateData (vizData) {
        this._vizData = vizData;
        if (!!this._referencingVizModel) {
            this._referencingVizModel.updateData(vizData);
        }
    }

    public clearData() {
        delete this._vizData;
        if (!!this._referencingVizModel) {
            this._referencingVizModel.clearData();
        }
    }

    /**
     * This visualization's ref to answer model that contains it.
     *
     * @return {AnswerModel}
     */
    public getContainingAnswerModel () {
        return this._answerModel;
    }

    /**
     * This visualization's ref to answer model that contains it.
     *
     * @return {AnswerModel}
     */
    public setContainingAnswerModel (answerModel) {
        this._answerModel = answerModel;
    }

    /**
     * Returns the visualization's referencing viz
     *
     * @return {Object}
     */
    public getReferencingViz () {
        return this._referencingVizModel;
    }

    /**
     * Returns the visualization's referencing viz
     *
     * @return {Object}
     */
    public setReferencingViz (referencingVizModel) {
        this._referencingVizModel = referencingVizModel;
    }

    /**
     * Returns the refAnswerSheetQuestion node in the viz's metadata json.
     * @returns {Object}
     */
    public getRefAnswerSheetInfo () {
        var vizJson = this.getJson();
        if (!vizJson || !_.has(vizJson, jsonConstants.REF_ANSWER_SHEET_KEY)) {
            return null;
        }
        return vizJson[jsonConstants.REF_ANSWER_SHEET_KEY];
    }

    /**
     * Returns the parent answer book id if this is a referenced viz.
     * Works by getting the referencing viz model, and calling the
     * getReferencedAnswerBookId method on it.
     *
     * @return {string}
     */
    public getAnswerBookIdThroughReferencingViz () {
        var referencingViz = this.getReferencingViz();
        if (!referencingViz) {
            return this.getReferencedAnswerBookId();
        }
        return referencingViz.getReferencedAnswerBookId();
    }

    /**
     * Returns the question text of the answer sheet that contains the referenced viz
     * @return {QuestionModel} The question
     */
    public getReferencedQuestion () {
        var refAnswerSheetInfo = this.getRefAnswerSheetInfo();
        if (!refAnswerSheetInfo) {
            return null;
        }
        if (!_.has(refAnswerSheetInfo, jsonConstants.REF_ANSWER_SHEET_QUESTION_KEY)) {
            return null;
        }

        var questionJson = refAnswerSheetInfo[jsonConstants.REF_ANSWER_SHEET_QUESTION_KEY];
        var questionModel = new QuestionModel(questionJson);

        return questionModel;
    }

    /**
     * Returns the question text of the answer sheet that contains the referenced viz
     * @return {string} The question text
     */
    public getReferencedQuestionText () {
        var sheetQuestion = this.getReferencedQuestion();
        if (!sheetQuestion) {
            return '';
        }
        if (!_.has(sheetQuestion, jsonConstants.TEXT_KEY)) {
            return '';
        }
        return sheetQuestion[jsonConstants.TEXT_KEY];
    }

    /**
     * Returns the parent answer sheet's question text if this is a referenced viz.
     * Works by getting the referencing viz model, and calling the
     * getReferencedQuestionText method on it.
     *
     * @return {string}
     */
    public getQuestionText () : string {
        return this.getQuestion().getText();
    }

    /**
     * Returns the underlying Question model
     * @return {null|any}
     */
    public getQuestion() : QuestionModel {
        var referencingViz = this.getReferencingViz();
        if (!referencingViz) {
            let parentAnswerModel = this.getContainingAnswerModel();
            let parentAnswerSheet = parentAnswerModel.getCurrentAnswerSheet();
            return parentAnswerSheet.getQuestionInfo();
        }
        return referencingViz.getReferencedQuestion();
    }

    /**
     * Returns the id of the answer book that contains the referenced viz, meaning the id of the
     * copy of the answer book the user dragged the viz from when they added it to the pinboard
     * @return {string} The answer book id
     */
    public getReferencedAnswerBookId () {
        var refAnswerSheetInfo = this.getRefAnswerSheetInfo();
        if (!refAnswerSheetInfo || !refAnswerSheetInfo[jsonConstants.OWNER_KEY]) {
            return '';
        }
        return refAnswerSheetInfo[jsonConstants.OWNER_KEY];
    }

    /**
     * @return {Array}
     *
     * Get the table columns
     */
    public getColumns () {
        return this.getJson().columns;
    }

    /**
     * A hook to allow subclasses to use custom Viz Col subclasses.
     * Used by headline column model.
     * @returns {Array}
     */
    public createVizColumns () {
        var vizModel = this;
        return this.getColumns().map(function (c, idx) {
            var colData = vizModel.getColumnData(idx);
            return new VisualizationColumnModel(c, idx, colData);
        });
    }

    /**
     * @return {Array.<VisualizationColumnModel>}
     */
    public getVizColumns () : Array<VisualizationColumnModel> {
        if (this._vizColumns === null) {
            this._vizColumns = this.createVizColumns();
        }
        return this._vizColumns;
    }

    public getVisualizedColumns () : Array<VisualizationColumnModel> {
        return this.getVizColumns();
    }

    /**
     * Returns the number of columns for which data is available
     *
     * @return {number}
     */
    public getColumnCount () {
        var vizJson = this.getJson();
        if (vizJson.columns) {
            return vizJson.columns.length;
        }
        return 0;
    }

    /**
     * Returns the data for the column with the given dataRowIndex
     * @param {Number} columnDataRowIndex
     * @returns {Array.<*>}
     */
    public getColumnData (columnDataRowIndex) {
        var vizData = this.getVizData().data;
        if (!vizData || !vizData.length) {
            return [];
        }
        if (vizData[0].length <= columnDataRowIndex) {
            this._logger.warn('no column data found for col at dataRowIndex', columnDataRowIndex);
            return [];
        }
        return vizData.map(function(row){
            return row[columnDataRowIndex];
        });
    }

    /**
     * @return {boolean}
     */
    public hasMoreData () {
        return !this.getVizData().isLastBatch;
    }

    /**
     * Returns true if this viz model is same as that.
     * The meaning of equals() is very strict.
     * Both the content definition and viz data have to match.
     *
     * @param {VisualizationModel} that
     */
    public equals (that) {
        if (!that) {
            return false;
        }
        return VisualizationModel.areModelsEqual(this, that);
    }

    /**
     * Returns true if this viz is configured to load data lazily.
     *
     * @return {boolean}
     */
    public isDataOnDemand () {
        return !!this.getJson().dataOnDemand;
    }

    /**
     * Reconfigure viz to load data synchronously.
     *
     * @param {boolean} dataOnDemand
     */
    public setDataOnDemand (dataOnDemand) {
        this.getJson().dataOnDemand = dataOnDemand;
    }

    public setUserData (key, value) {
        var clientState = this.getClientState();
        util.setProp(clientState, key, value);
    }

    public getUserData (key) {
        var clientState = this.getClientState();
        return clientState && util.prop(clientState, key);
    }

    public clearUserData (key) {
        var clientState = this.getClientState();
        if (clientState) {
            util.deleteProp(clientState, key);
        }
    }
    public hasUserData (key) {
        var clientState = this.getClientState();
        return clientState && _.has(clientState, key);
    }

    public getSavedDataOffset () {
        return this.getUserData('dataOffset') || 0;
    }

    public setSavedDataOffset (offset) {
        return this.setUserData('dataOffset', offset);
    }

    public isConfigurationLocked () {
        return !!this.getJson().locked;
    }

    public setIsConfigurationLocked (locked) {
        this.getJson().locked = locked;
    }

    public toggleConfigurationLock () {
        var json = this.getJson();
        json.locked = !json.locked;
    }

    public isPendingDataLoad () {
        if (this._dataLoadFailed) {
            return false;
        }

        if (this.isCorrupted()) {
            return false;
        }

        if (this._vizData && this._vizData.length > 0) {
            return false;
        }

        var answerSheet = this._answerModel.getCurrentAnswerSheet(),
            vizId = this._referencingVizModel ? this._referencingVizModel.getId() : this.getId();
        return !answerSheet.hasDataForViz(vizId);
    }

    public didDataLoadFail () {
        return this._dataLoadFailed;
    }

    public setDataLoadFailed (dataLoadFailed) {
        this._dataLoadFailed = !!dataLoadFailed;
    }

    public isMissingUnderlyingDataAccess() {
        var permission = this.getContainingAnswerModel().getPermission();
        if (this.isPinboardViz()) {
            // Get the permission obect of the answer model corresponding to the current viz.
            permission = permission.getAnswerDocumentPermission(
                this.getAnswerBookIdThroughReferencingViz()
            );
        }
        return !permission ||
            permission.isMissingUnderlyingAccess() ||
            !vizContextMenuUtil.isVizContextMenuAllowedOnData(this.getVizColumns());
    }

    public getMatchingFilterModel (column) {
        if (!this._answerModel || !column) {
            return null;
        }

        var answerSheet = this._answerModel.getCurrentAnswerSheet();
        return answerSheet.getFilterModelByColumn(column);
    }

    public setMatchingFilterModel (column, newFilterModel) {
        if (!this._answerModel || !column) {
            return;
        }

        var answerSheet = this._answerModel.getCurrentAnswerSheet();
        answerSheet.setFilterModelByColumn(column, newFilterModel);

    }

    public getModifiedTimestamp () {
        return this._vizJson && this._vizJson.header.modified;
    }

    public isOlderComparedTo (otherVizModel) {
        if (!otherVizModel) {
            return false;
        }
        return this.getModifiedTimestamp() < otherVizModel.getModifiedTimestamp();
    }

    /**
     * Returns if the viz belongs to a pinboard.
     * @return {Boolean}
     */
    public isPinboardViz() {
        return !!this._referencingVizModel;
    }

    public getTotalRowCount () {
        if(!this._vizData) {
            return 0;
        }

        return this._vizData.totalRowCount;
    }

    public hasNoData() : boolean {
        return this.getTotalRowCount() === 0;
    }

    public getSamplingRatio () {
        if(!this._vizData) {
            return null;
        }

        return this._vizData.samplingRatio;
    }

    public getCompletionRatio () {
        if(!this._vizData) {
            return null;
        }

        return this._vizData.completionRatio;
    }

    public allowsFormulaAddition () {
        return false;
    }

    public getMetricsForSampledData () : any {
        var totalRowsDisplayed = '1000', totalRowCount = '1000+', showSampledMesg = false;
        if (this.getTotalRowCount() > 1000) {
            showSampledMesg = true;
        } else {
            totalRowCount = totalRowsDisplayed = this.getTotalRowCount().toString();
        }

        if(this.getSamplingRatio() < 1 || this.getCompletionRatio() < 1) {
            totalRowCount = 'many';
            showSampledMesg = true;
        }
        if(showSampledMesg) {
            return {
                totalRowCount: totalRowCount,
                totalRowsDisplayed: totalRowsDisplayed
            };
        } else {
            return {};
        }
    }

    public isGenericViz() {
        return false;
    }

    public getBatchSize(): number {
        return this._dataBatchSize;
    }

    public setBatchSize(value: number) {
        this._dataBatchSize = value;
    }

    public getSchemaVersion() {
        var vizContent = this._vizJson[jsonConstants.VIZ_CONTENT_KEY];
        return !!vizContent ? vizContent[jsonConstants.SCHEMA_VERSION] : '0.0';
    }

    public getRelatedLinksCount(): number {
        if (!this.isPinboardViz()) {
            return 0;
        }
        let ref = this.getReferencingViz();
        if (!ref) {
            return 0;
        }
        let relatedLinks = ref._vizJson[jsonConstants.relatedLink.RELATED_LINKS];
        return relatedLinks.length;
    }

    public shouldIgnoreRendering() : boolean {
        return this.ignoreRendering;
    }

    public setIgnoreRendering() {
        this.ignoreRendering = true;
    }

    public getReferencedVizIds() : string[] {
        return [];
    }

    public allowAnalysis() : boolean {
        return !!this.getQuestion();
    }

    private getClientState() {
        if (!this || !this._vizJson) {
            return null;
        }
        var clientState = this._vizJson.header.clientState;
        if (!clientState) {
            clientState = this._vizJson.header.clientState = {};
        }
        return clientState;
    }
}
