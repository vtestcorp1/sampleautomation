/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Manoj Ghosh (manoj.ghosh@thoughtpsot.com)
 * Provides a editor to create a new or update an existing related link.
 */

import IPromise = angular.IPromise;
import IQService = angular.IQService;

import _ from 'lodash';
import {BaseComponent} from '../../../base/base-types/base-component';
import {Component, ngRequire} from '../../../base/decorators';
import {strings} from '../../../base/strings';
import {VisualizationColumnModel} from '../../callosum/model/visualization-column';
import AnswerSelectorComponent from '../../metadata-item-selector/answer-selector/answer-selector';
import PinboardSelectorComponent
    from '../../metadata-item-selector/pinboard-selector/pinboard-selector';
import {jsonConstants} from '../../viz-layout/answer/json-constants';
import {FilterRowOperators} from '../../viz-layout/viz/filter/filter-types';
import {VisualizationModel} from '../../viz-layout/viz/visualization-model';
import {RelatedLink, SingleColumnRelatedRelationship} from '../related-link-model';
import {RelatedLinkListViewerComponent} from './related-link-list-viewer';

let $q: IQService = ngRequire('$q');
let DocumentLoader = ngRequire('DocumentLoader');
let metadataService = ngRequire('metadataService');

let alertService = ngRequire('alertService');
let UserAction = ngRequire('UserAction');

export enum DestinationBookType {
    Pinboard,
    Answer
}

interface NoneModel {
    getTitle(): string;
    getId(): string;
}

export class VisualizationNone implements NoneModel {
    getTitle(): string {
        return strings.ALL;
    }

    getId(): string {
        return null;
    }
}

/**
 * A related link editor component helps customer create a new or
 * update an existing related link. Whenever we create a related link
 * the source visualization is given.
 *
 * We need to provide customers to select a pinboard or answer and then
 * select a particular visualization.
 *
 * Note: Currently we only support Pinboard.
 */
@Component({
    name: 'bkRelatedLinkEditor',
    templateUrl: 'src/modules/related-link/editor/related-link-editor.html'
})
export class RelatedLinkEditorComponent extends BaseComponent {

    // Related link flag for new or existing one.
    public isExistingRelation: boolean;
    public relatedLink: RelatedLink;

    // From Source.
    public srcVizModel: VisualizationModel;

    // To Destination
    public destinationBookType: DestinationBookType;
    public destinationBookId: string;
    public dstVizModel: VisualizationModel;

    // Select destination
    public readonly destinationBookTypeOptions : Array<DestinationBookType>; // pinboard or answer
    public readonly destinationBookTypeEnum = DestinationBookType;
    public pinboardSelector: PinboardSelectorComponent;
    public answerSelector: AnswerSelectorComponent;

    public pinboardVizModels : VisualizationModel[]  = [];
    public answerVizModels : VisualizationModel[] = [];
    public vizModels : VisualizationModel[] = [];

    // Error message.
    public hasError: boolean = false;
    public errorMessage = '';

    // Select mappings.
    public newSourceColumn: VisualizationColumnModel;
    public newDestinationColumn: VisualizationColumnModel;
    public newOperator: string;

    // OperatorTypes that we support via related links.
    public supportedOperators: string[] = [];

    // This is used to fetch answer or pinboard.
    private documentLoader:any = new DocumentLoader(_.noop, true);

    // parent component
    private viewerComponent: RelatedLinkListViewerComponent;

    // All choice option for destination visualization
    private dstVizNone: any;

    /**
     * Create or update a related link
     * @param viewerComponent parent related link viewer component
     * @param srcVizModel source visualization of the related link.
     * @param relatedLinkId null if we are creating a new one,
     *        else the existing related link to modify.
     */
    public constructor(
        viewerComponent: RelatedLinkListViewerComponent,
        srcVizModel: VisualizationModel,
        relatedLinkId?: string) {
        super();
        this.viewerComponent = viewerComponent;
        // only these destinations are supported to navigate to via a link.
        this.destinationBookTypeOptions = [
            DestinationBookType.Pinboard];

        this.srcVizModel = srcVizModel;
        if(!relatedLinkId) {
            // create a new instance.
            this.isExistingRelation = false;
            this.relatedLink = RelatedLink.newRelatedLink(this.srcVizModel);
        } else {
            this.isExistingRelation = true;
            this.fetchRelatedLink(relatedLinkId);
        }
        this.init();
    }

    public getSourceType() : string {
        return (this.srcVizModel.isPinboardViz()) ? strings.PINBOARD: strings.ANSWER;
    }

    public getSourceVizTitle() : string {
        return this.getVizTitle(this.srcVizModel);
    }

    public getSourceBookName() : string {
        return this.srcVizModel.getContainingAnswerModel().getName();
    }

    public getDstVizId(): string {
        if (this.dstVizModel && this.dstVizModel.getContainingAnswerModel) {
            return this.dstVizModel.getContainingAnswerModel().getId();
        } else {
            return strings.ALL;
        }
    }

    public getDstVizTitle(): string {
        return this.getVizTitle(this.dstVizModel);
    }

    public getVizTitle(viz: VisualizationModel) {
        if (viz && viz.getDisplayedViz) {
            return viz.getDisplayedViz().getTitle();
        } else {
            return strings.ALL;
        }
    }

    public fetchVizIds(book: any): IPromise<any> {
        this.destinationBookId = book.owner;
        this.relatedLink.dstPinboardId = this.destinationBookId;
        if (this.destinationBookType === DestinationBookType.Pinboard) {
            return this.fetchPinboard(this.destinationBookId);
        }
        if(this.destinationBookType === DestinationBookType.Answer) {
            return this.fetchAnswer(book.owner);
        }
    }

    public getDestinationVizChoices() : Array<any> {
        return [this.dstVizNone].concat(this.vizModels);
    }

    /**
     * Get destination visualization columns
     * If the destinaton viz is ALL, then we provide all pinboard / answer columns.
     * Otherwise we display only the visualization specific columns.
     * @returns {any}
     */
    public getDestinationVizColumns(): Array<VisualizationColumnModel> {

        if (!!this.dstVizModel && !!this.dstVizModel.getDisplayedViz) {
            return this.dstVizModel.getDisplayedViz().getVizColumns();
        } else {
            // return all report book visualization.
            if (!!this.vizModels && this.vizModels.length > 0) {
                return this.getAllReportBookVizColumns();
            }
        }
        return [];
    }

    public getAllReportBookVizColumns(): Array<VisualizationColumnModel> {
        let allVizColumns = {};
        this.vizModels.forEach(vizModel => {
            let displayedViz = vizModel.getDisplayedViz();
            if (displayedViz.isGenericViz() || displayedViz.isCorrupted()) {
                return;
            }
            let vizColumns = displayedViz.getVizColumns();

            vizColumns.forEach(vizColumn => {
                let vizId = vizColumn.getId();
                allVizColumns[vizId] = vizColumn;
            });
        });
        return Object.values(allVizColumns);
    }

    public onPinboardSelected(books: Array<any>): void {
        let book = books[0];
        this.fetchVizIds(book);
    }

    public onAnswerSelected(books: Array<any>): void {
        let book = books[0];
        this.fetchVizIds(book);
    }

    public destinationBookTypeSelected(): void {
        this.dstVizModel = null;
        if (this.destinationBookType === DestinationBookType.Pinboard) {
            this.vizModels = this.pinboardVizModels;
        } else {
            this.vizModels = this.answerVizModels;
        }
    }

    public removeRelationColumn(index : number): void {
        this.relatedLink.content.relationships.removeAt(index);
    }

    public isValidRelationship(): boolean {
        if (!!this.newSourceColumn && !!this.newDestinationColumn && !!this.newOperator) {
            return true;
        }
        return false;
    }

    public getDestinationToolTip () {
        return this.strings.relatedLink.destinationToolTip;
    }

    public addRelationship(): void {
        this.addRelationColumn(
            this.newSourceColumn.getUnderlyingColumnName(),
            this.newOperator,
            this.newDestinationColumn.getUnderlyingColumnName());
        // once we add the mapping, reset the selection.
        this.newSourceColumn = null;
        this.newOperator = null;
        this.newDestinationColumn = null;
    }

    public addRelationColumn(source: string, operator: string, destination: string): void {
        let singleRelation = new SingleColumnRelatedRelationship(source, destination, operator);
        this.relatedLink.content.relationships.push(singleRelation);
    }

    public isValidRelatedLink() : boolean {
         return _.get(this.relatedLink, 'content.relationships.length', 0) > 0;
    }

    public cancel() : void {
        this.closeEditor();
    }

    public createRelatedLink() : void {
        let userAction = new UserAction(UserAction.CREATE_RELATED_LINK);
        let dstVizId = null;
        if(!!this.dstVizModel) {
            dstVizId = this.dstVizModel.getId();
        }
        metadataService.addRelatedLink(
            this.relatedLink.name,
            this.relatedLink.description,
            this.relatedLink.srcVizId,
            this.relatedLink.dstPinboardId,
            dstVizId,
            JSON.stringify(this.relatedLink.content)
        ).then((response) => {
            alertService.showUserActionSuccessAlert(userAction, response);
            this.closeEditor();
            return response.data;
        }, (response) => {
            alertService.showUserActionFailureAlert(userAction, response);
            return $q.reject(response.data);
        });
    }

    public updateRelatedLink() : void {
        let userAction = new UserAction(UserAction.UPDATE_RELATED_LINK);
        let dstVizId = null;
        if(!!this.dstVizModel) {
            dstVizId = this.dstVizModel.getId();
        } else {
            dstVizId = this.relatedLink.dstVizId;
        }
        metadataService.updateRelatedLink(
            this.relatedLink.id,
            this.relatedLink.name,
            this.relatedLink.description,
            this.relatedLink.srcVizId,
            this.relatedLink.dstPinboardId,
            dstVizId,
            JSON.stringify(this.relatedLink.content)
        ).then((response) => {
            alertService.showUserActionSuccessAlert(userAction, response);
            this.closeEditor();
            return response.data;
        }, (response) => {
            alertService.showUserActionFailureAlert(userAction, response);
            return $q.reject(response.data);
        });
    }

    private init(): void {
        this.pinboardSelector = new PinboardSelectorComponent( (item) =>
            this.onPinboardSelected(item));
        this.pinboardSelector.allowMultiSelect(false);
        this.answerSelector = new AnswerSelectorComponent( (item) =>
            this.onAnswerSelected(item));
        this.answerSelector.allowMultiSelect(false);
        this.initSupportedOperators();
        this.initDstVizNone();
    }

    private initSupportedOperators() : void {
        const operatorValues = Object.keys(FilterRowOperators).map(k => FilterRowOperators[k]);
        this.supportedOperators = operatorValues.filter(v => typeof v === 'string') as string[];
    }

    private initDstVizNone() : void {
        this.dstVizNone = new VisualizationNone();
    }

    private closeEditor() : void {
        this.viewerComponent.showViewerComponent();
    }

    private fetchPinboard(pinboardId: string): IPromise<any> {
        let userAction = new UserAction(UserAction.FETCH_PINBOARD_DETAILS);
        return this.documentLoader.loadDocument(
            pinboardId,
            jsonConstants.metadataType.PINBOARD_ANSWER_BOOK,
            true
        ).then((fetchedBook) => {
            this.pinboardVizModels = Object.values(fetchedBook.getCurrentVisualizations());
            this.vizModels = this.pinboardVizModels;
            return fetchedBook;
            }, (response) => {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            }
        );
    }

    private fetchAnswer(answerId: string): IPromise<any> {
        let userAction = new UserAction(UserAction.FETCH_ANSWER_DETAILS);
        return this.documentLoader.loadDocument(
            answerId,
            jsonConstants.metadataType.QUESTION_ANSWER_BOOK,
            true
        ).then((fetchedBook) => {
                this.answerVizModels = Object.values(fetchedBook
                    .getCurrentAnswerSheet()
                    .getVisualizations());
                this.vizModels = this.answerVizModels;
            }, (response) => {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            }
        );
    }

    private fetchRelatedLink(relatedLinkId: string): IPromise<any> {
        let userAction = new UserAction(UserAction.FETCH_RELATED_LINK_DETAILS);
        return metadataService.getMetadataObjectDetails(
            jsonConstants.metadataType.RELATED_LINK,
            relatedLinkId
        ).then((fetchedLink) => {
                this.relatedLink = new RelatedLink(fetchedLink.data);
                this.initExistingLinkDestinationOptions();
            }, (response) => {
                alertService.showUserActionFailureAlert(userAction, response);
                this.closeEditor();
                return $q.reject(response.data);
            }
        );
    }

    private initExistingLinkDestinationOptions(): IPromise<any> {
        return this.setRelatedLinkDestinationPinboard(this.relatedLink.dstPinboardId);
    }

    // Set existing pinboard details in UI from related link.
    private setRelatedLinkDestinationPinboard(bookId: string) : IPromise<any> {
        this.destinationBookType = DestinationBookType.Pinboard;
        return this.fetchPinboard(bookId)
            .then((fetchedPinboard) => {
                this.pinboardSelector.setSelectedItem(fetchedPinboard.getHeaderJson());
                this.dstVizModel = this.vizModels.find((viz) => {
                    return viz.getId() === this.relatedLink.dstVizId;
                });
            });
    }
}
