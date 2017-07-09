/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com)
 *         Manoj Ghosh (manoj.ghosh@thoughtspot.com)
 *
 * @fileoverview Component for fetching drill suggestions on a visualization
 * This works by creating a transformed query to sage with appended keyword's like
 * 'by', 'foreach' and then requesting sage to return applicable recognised tokens for the new
 * transformed query. The resulting tokens are displayed to user as drill down choices.
 *
 * Some hints:
 * One way to return all the attributes is to have query like "Q by" where Q is the original query.
 * Similarly you can get all measures by "Q sum"
 * If you simply do Q with max_completions of 100 or so then you can get both
 * (top 100 ones by score)
 * Increase 100 to further large number if you want to get even more.
 */
import {ngRequire, Provide} from '../../../base/decorators';
import IPromise = angular.IPromise;
import {AnswerSageClient} from '../../sage-client/answer-sage-client';

declare var sage: any;
let autoCompleteService = ngRequire('autoCompleteService');
let autoCompleteObjectUtil = ngRequire('autoCompleteObjectUtil');
let CancelablePromise = ngRequire('CancelablePromise');

@Provide('SageTokenOptions')
export class SageTokenOptions {
    private sageClient: AnswerSageClient;
    private sageContext: any;
    private responseSageContextGetter;
    private pendingPromise: any;
    private includeMeasures: boolean = false;

    public constructor(
        sageClient: AnswerSageClient,
        filterTransformations?: any[],
        shouldIncludeMeasures? : boolean) {
        filterTransformations = filterTransformations || [];
        if (!!shouldIncludeMeasures) {
            this.includeMeasures = shouldIncludeMeasures;
        }
        this.sageClient = sageClient;
        this.sageContext = this.sageClient.getContext();
        let queryTransformations = filterTransformations;
        let index = this.sageClient.getCurrentIndex();
        this.responseSageContextGetter = autoCompleteService.transformTable(
            this.sageContext,
            index,
            queryTransformations
        ).then(
            (sageResponse) => {
                this.setSageResponseContext(sageResponse);
            });
    }

    /**
     * Returns all tokens that are applicable recognized tokens for drilling into the visualization
     */
    public getDrillableTokens(): IPromise<Array<any>> {
        return this.getSearchedTokens('');
    }

    /**
     * Search for tokens using the searchText keyword.
     * @param searchText the search text that customers provide to filter down the columns.
     * @return {Promise<Array>} Array of tokens matching the search pattern.
     */
    public getSearchedTokens(searchText: string): IPromise<Array<any>> {
        if (!!this.pendingPromise) {
            this.pendingPromise.cancel();
        }

        this.pendingPromise = new CancelablePromise(this.responseSageContextGetter.then(
            () => {
                let currentTableIndex = this.sageClient.getCurrentIndex();
                let originalTokens = this.getOriginalTokens();
                let tokens = originalTokens.concat(
                    sage.RecognizedToken.createUnrecognizedToken(searchText));

                let tableRequest = autoCompleteObjectUtil.getNewACTableRequest();
                tableRequest.setInputTokens(tokens);

                let dataScopeTables = tableRequest.getDataScopeLogicalTables();
                let tables = this.sageContext.getTables();
                tables.forEach(function (table, index) {
                    if (index < currentTableIndex && dataScopeTables.indexOf(table) < 0) {
                        dataScopeTables.push(table.getId());
                    }
                });

                return autoCompleteService.editTable(
                    this.sageContext, currentTableIndex, tableRequest)
                    .then((sageResponse) => {
                        let answerResponse = sageResponse.answerResponse;
                        let tableResponse = answerResponse.getTableResponse();
                        return this.getRecognizedDrillableTokens(tableResponse, originalTokens);
                    });
            }
        ));

        return this.pendingPromise;
    }

    /**
     * Returns all the original tokens.
     * @return {any}
     */
    public getOriginalTokens(): Array<any> {
        let currentTableIndex = this.sageClient.getCurrentIndex();
        let allTokens = this.sageContext.getTables()[currentTableIndex].getTokens();
        return allTokens;
    }

    private setSageResponseContext(sageResponse: any): void {
        let answerResponse = sageResponse.answerResponse;
        this.sageContext = answerResponse.getContext();
    }

    /**
     * Returns the recognized tokens from the table response's data completions.
     * @param {sage.ACTableResponse} tableResponse
     * @param {Array.<sage.RecognizedToken>} originalTokens
     */
    private getRecognizedDrillableTokens(tableResponse, originalTokens: Array<any>): Array<any> {
        let items = [];
        let newTokens = tableResponse.getNewTokens();

        // It might happen that the user has searched for 'customer region' in the search bar.
        // In this case, sage recognizes the token and does not send this in data completions.
        // So we take the token out from new tokens.
        if (newTokens.length === originalTokens.length + 1 && !newTokens.last().isUnrecognized()) {
            if (newTokens.last().isAttributeToken()) {
                items = [newTokens.last()];
            }
        } else {
            let completions = tableResponse.getDataCompletions();

            // Only keep attribute tokens from the completions returned by Sage and also filter out
            // the attribute on which the drill is being performed.

            // NOTE(vibhor): Ideally, we would skip all the attribute tokens that are already in
            // the query and are being drill down into. However, a simple attribute token
            // already in query check is insufficient since an attribute token with an aggregate
            // keyword will act as the measure for that query. For instance 'count color by
            // customer region', user may wish to drill a customer region of WEST // by color
            // (making the resulting query), 'count color for customer region = WEST by color'.
            // Since, sage currently doesn't give us token boundaries, we can't distinguish a
            // 'GROUP BY' attribute token from a METRIC attribute token.

            items = completions.filter((completion) => {
                let rt = completion.getRecognizedToken();
                // do not include measures if asked to do so.

                if (rt.isMeasureToken()) {
                    return this.includeMeasures;
                }
                if (!rt.isAttributeToken()) {
                    return false;
                }
                return true;
            }).map(function (c) {
                return c.getRecognizedToken();
            });
        }
        return items;
    }
}
