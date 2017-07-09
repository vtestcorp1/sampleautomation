/**
 * Copyright: ThoughtSpot Inc.
 * Author: Manoj Ghosh (manoj.ghosh@thoughtspot.com)
 *
 * Provides Utility classes for related links.
 * A related link object is of the format:
 *
 */
import _ from 'lodash';
import {blinkConstants} from '../../base/blink-constants';
import {Storable} from '../callosum/model/storable';
import {RuntimeFilterUtil} from './filter/runtime-filter-util';

export class SingleColumnRelatedRelationship {
    public sourceColumnName: string;
    public destinationColumnName: string;
    public operator: string;

    constructor(sourceColumnName: string, destinationColumnName: string, operator: string) {
        this.sourceColumnName = sourceColumnName;
        this.destinationColumnName = destinationColumnName;
        this.operator = operator;
    }
}

export class RelatedLinkContent {
    public relationships: Array<SingleColumnRelatedRelationship> = [];
    constructor (relationships?: any) {
        if (!!relationships) {
            this.relationships = relationships.map((relation) =>
                new SingleColumnRelatedRelationship(
                    relation.sourceColumnName,
                    relation.destinationColumnName,
                    relation.operator
                ));
        }
    }
}

export class RelatedLink extends Storable {
    public name: string;
    public description: string;
    public srcVizId: string;
    public id: string;
    public dstPinboardId: string;
    public dstVizId: string;
    public content : RelatedLinkContent;
    public type: string;

    public static newRelatedLink(vizModel : any): RelatedLink {
        let relatedLink : RelatedLink = new RelatedLink();
        relatedLink.name = 'Untitled link';
        relatedLink.srcVizId = vizModel.getReferencingViz().getId();
        let content = new RelatedLinkContent();
        let relationships = [];
        content.relationships = relationships;
        relatedLink.content = content;
        return relatedLink;
    }

    public constructor (relatedLink?: any) {
        super(relatedLink);
        if (relatedLink) {
            this.id = this.getId();
            this.name = this.getName();
            this.description = this.getDescription();
            this.srcVizId = this.getOwner();
            this.dstPinboardId = relatedLink.destinationAnswerBookId;
            this.dstVizId = relatedLink.destinationVisualizationId;
            let relationships = _.get(relatedLink, 'relatedLinkContent.relationships', []);
            this.content = new RelatedLinkContent(relationships);
        }
        this.init();
    }

    /**
     * Create a runtime filter based on the related link configuration.
     *
     * @param contextMenuData contains the context of row selected by the customer.
     * @param filterOnlyRelatedColumns if true then only relatedLink specified source column names
     * are used from the selected set of columns in contextMenuData.
     *
     * @returns runtimeFilter.
     */
    public getFilters(contextMenuData: any, filterOnlyRelatedColumns: boolean ) {
        return RuntimeFilterUtil.getRelatedLinkFilters(
            contextMenuData,
            filterOnlyRelatedColumns,
            this.content);
    }

    private init() {
        //TODO(manoj): Currently we only support pinboard.
        this.type = blinkConstants.PINBOARD_TYPE;
    }
}
