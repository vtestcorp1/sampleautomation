/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This class encapsulates the filter handling on answer page.
 * TODO: When answer is decoupled from sharableItem we can make this a component and
 * follow a clear component heirarchy.
 * This class exposes open on add filter functionality to the parent. Parent can coordinate with
 * other children to invoke this method.
 * This class abstracts the usage of filter-panel component from the page.
 */

import {ngRequire, Provide} from '../../../base/decorators';
import {FilterModel} from '../../../modules/viz-layout/viz/filter/filter-model';
import IPromise = angular.IPromise;
import {RequestTypes} from '../../../base/proto/callosum-types';

let $q = ngRequire('$q');
let alertService = ngRequire('alertService');
let answerService = ngRequire('answerService');
let autoCompleteObjectUtil = ngRequire('autoCompleteObjectUtil');
let autoCompleteService = ngRequire('autoCompleteService');
let FilterPanelController = ngRequire('FilterPanelController');
let filterUtil = ngRequire('filterUtil');
let filterTransformationUtil = ngRequire('filterTransformationUtil');
let jsonConstants = ngRequire('jsonConstants');
let Logger = ngRequire('Logger');
let UserAction = ngRequire('UserAction');

declare var sage: any;

@Provide('AnswerPageFilterPanel')
export class AnswerPageFilterPanel {
    public filterPanelController: any;
    public showPanel: boolean;

    private filterModels: Array<FilterModel>;
    private isMissingUnderlyingAccess: boolean;
    private logger: any;
    private sageClient: any;

    constructor(filterModels: Array<any>,
                sageClient: any,
                isMissingUnderlyingAccess: boolean
    ) {
        this.filterModels = filterModels;
        this.sageClient = sageClient;
        this.isMissingUnderlyingAccess = isMissingUnderlyingAccess;
        this.showPanel = false;
        this.logger = Logger.create('answer-page-filter-panel');
        this.updateFilterPanelController();
    }

    public openOrAddFilter(logicalColumn, aggr) : IPromise<any> {
        // Here we have the following cases:
        // Case 1: We have a matching filter in list of current filters.
        // Case 2: We dont have matching filter, we are able to add filter without MJP.
        // Case 3: We dont have matching filter, but have MJP(we just transform sage base in
        // this case).
        let matchingFilterModel = filterUtil.findMatchingFilterModel(
            logicalColumn,
            aggr,
            this.filterModels
        );
        if (!!matchingFilterModel) {
            this.filterPanelController.showFilter(matchingFilterModel.getId());
            return $q.when();
        }

        let addFilterTransformationHandler = (sageResponse: any) => {
            return this.handleAddFilterTransformation(logicalColumn, aggr, sageResponse);
        };
        return this.transformToAddFilter(logicalColumn, aggr)
            .then(addFilterTransformationHandler);
    }

    private updateFilterPanelController() {
        this.filterPanelController = new FilterPanelController(
            this.filterModels,
            this.isMissingUnderlyingAccess,
            this.onFilterRemovalCallback,
            this.onFilterChangeCallback
        );

        this.showPanel = this.filterModels.length > 0;
    }

    private handleAddFilterTransformation(logicalColumn, aggr, sageResponse) {
        let answerResponse = sageResponse.answerResponse;
        let sageClient = this.sageClient;

        let supportedSageErrorStatesInResponse = [
            sage.ErrorCode.SUCCESS,
            sage.ErrorCode.JOIN_PATH_AMBIGUITY
        ];

        let tableResponse = answerResponse.getTableResponse();
        let table = answerResponse.getContext().getTables()[sageClient.getCurrentIndex()];
        let tableError = table.getTableError();

        // TODO Jasmeet : Currently failures/timeouts from sage will behave as noop,
        // with just starting and ending filter loading indicator.
        // Add messaging to handle different error cases
        // We could use alert service or popover for that.
        if (supportedSageErrorStatesInResponse.none(tableError.getErrorCode())) {
            this.logger.debug('Unsupported sage response error state.');
            return $q.reject();
        }

        let joinPathAmbiguities = tableResponse.getJoinPathAmbiguities();
        if (joinPathAmbiguities && joinPathAmbiguities.length) {
            let tableRequest = autoCompleteObjectUtil.getNewACTableRequest();

            tableRequest.setInputTokens(tableResponse.getNewTokens());
            return sageClient.editTable(tableRequest);
        } else {
            let context = answerResponse.getContext();
            let contextIndex = sageClient.getCurrentIndex();

            return this.addNewFilterToFiltersList(logicalColumn, aggr, context, contextIndex);
        }
    }

    private transformToAddFilter(logicalColumn, aggr) : IPromise<any> {
        let supportedSageErrorStatesFromLastResponse = [
            sage.ErrorCode.SUCCESS,
            sage.ErrorCode.CANCELLED,
            sage.ErrorCode.TIME_OUT_ERROR
        ];

        let sageClient = this.sageClient;
        let sageModel = sageClient.getSageModel();
        let lastError = sage.ErrorCode.SUCCESS;
        if (!!sageModel && !!sageModel.errorInfo) {
            lastError = sageModel.errorInfo.error;
        }

        if (supportedSageErrorStatesFromLastResponse.none(lastError)) {
            return $q.reject();
        }

        let filterOperator;
        if (logicalColumn.isDateColumn()) {
            filterOperator = sage.CompareType.GE;
        }

        let filterTransformations = filterUtil.getFilterTokensByTransform(
            sageModel.tokens,
            logicalColumn,
            null,
            aggr,
            filterOperator,
            false /* addWildcards */
        );

        return autoCompleteService.transformTable(
            sageClient.getContext(),
            sageClient.getCurrentIndex(),
            filterTransformations
        );
    }

    // TODO(Jasmeet): Look into simplifying the chaining here.
    private addNewFilterToFiltersList (logicalColumn, aggr, context, contextIndex) : IPromise<any> {
        let questionParams = {};
        questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = context;
        questionParams[jsonConstants.SAGE_CONTEXT_INDEX_KEY] = contextIndex;

        // Handle the failure of postQuery here.
        let userAction = new UserAction(UserAction.FETCH_ANSWER);
        return answerService.getAnswer(questionParams, {
            includeData: false,
            requestType: RequestTypes.ANSWER_ADD_NEW_FILTER
        }).then((response) => {
            let answerModel = response.data;
            // Find a matching filter in the response.
            // In this case we dont use filter unique id as the response would have
            // join path information where as the filter addition is triggered by
            // clickedColumn which is a LogicalColumn unaware of join path information.
            let filters =
                answerModel.getCurrentAnswerSheet().getVisualizationsOfType('FILTER') || [];
            let filterModelForClickedFilter = Object.values(filters).find(function (filter) {
                var baseColumnGuidsMatch =
                    filter.getColumn().getBaseColumnGuid() === logicalColumn.getBaseColumnGuid();
                var aggregationTypesMatch =
                    sage.AggregationType[filter.getColumn().getEffectiveAggregateType()] === aggr;
                return baseColumnGuidsMatch && aggregationTypesMatch;
            });

            if (!filterModelForClickedFilter) {
                this.logger.error('Failed to find matching filter for the column');
                return;
            }

            // TODO(Jasmeet): Removing placed holder when adding filter as the first thing is
            // broken.
            this.filterModels.push(filterModelForClickedFilter);

            this.updateFilterPanelController();

            this.filterPanelController.showFilter(filterModelForClickedFilter.getId());
        }, function (response) {
            alertService.showUserActionFailureAlert(userAction, response);
            return $q.reject(response.data);
        });
    }

    private onFilterChangeCallback = (queryTransformations, filterModel) : IPromise<any> => {
        let sageClient = this.sageClient;
        let sageContext = filterModel.getContainingAnswerModel().getSageContext();
        let sageContextIndex = filterModel.getContainingAnswerModel().getSageContextIndex();

        let self = this;

        return autoCompleteService.transformTable(
            sageContext,
            sageContextIndex,
            queryTransformations
        )
            .then(function(sageResponse) {
                let answerResponse = sageResponse.answerResponse;
                let table = answerResponse.getContext().getTables()[sageContextIndex];
                let tokens = table.getTokens();

                let tableRequest = autoCompleteObjectUtil.getNewACTableRequest();
                tableRequest.setInputTokens(tokens);

                sageClient.editTable(tableRequest);
            }, function(e) {
                self.logger.error('filter transformation failed', e);
            });
    }

    private onFilterRemovalCallback = (filterModel: FilterModel) : IPromise<any> => {
        // NOTE(Handling of empty filter removal)
        if (filterModel.isEmpty()) {
            this.filterModels.remove(function(fM){
                return fM.getId() === filterModel.getId();
            });
            this.updateFilterPanelController();
            return;
        }

        let queryTransforms = filterTransformationUtil.getFilterRemovalTransformations(filterModel);
        return this.sageClient.transformTable(queryTransforms);
    }
}
