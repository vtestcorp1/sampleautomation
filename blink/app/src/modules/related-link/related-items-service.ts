/**
 * Copyright: ThoughtSpot Inc.
 * Author: Manoj Ghosh (manoj.ghosh@thoughtspot.com)
 *
 * Provides a service that allows blink app to get related items of objects.
 */

import {blinkConstants} from '../../base/blink-constants';
import {ngRequire} from '../../base/decorators';
import IPromise = angular.IPromise;
import _ from 'lodash';
import {RelatedLink} from './related-link-model';

let jsonConstants = ngRequire('jsonConstants');
let dependencyService = ngRequire('dependencyService');

export {
    getRelatedItems,
    getRelatedLinks
};


function getRelatedItems (
    columnGuid: string,
    answerId: string
): IPromise<any> {
    return getColumnDependents(columnGuid, answerId);
}

function getRelatedLinks (
    vizModel : any
): Array<RelatedLink> {
    let relatedLinks : Array<any> = vizModel.getReferencingViz().params.vizJson.relatedLinks;
    return relatedLinks.map((relatedLink) => new RelatedLink(relatedLink));
}

function getColumnDependents (
    id: string,
    answerId: string
): IPromise<Array<string>> {
    // TODO: Avoid two network calls here.
    let colDependents;
    return dependencyService.getColumnDependents([id])
        .then(function (response) {
            colDependents = response.data;
            return getWSDependentsOnColumn(colDependents);
        })
        .then(dependencyService.getTableDependents)
        .then(function (response) {
            return getColumnDependentsBuiltOfWorksheet(colDependents,
                response.data,
                answerId);
        });
}

function getWSDependentsOnColumn(colDependents: any) {
    let tables = colDependents[jsonConstants.metadataType.LOGICAL_TABLE] || [];
    return tables.filter(function (table) {
        return table.type === jsonConstants.metadataType.subType.WORKSHEET;
    }).map(function (table) {
        return table.id;
    });
}

function getColumnDependentsBuiltOfWorksheet(colDependents, wsDependents, answerId) {
    let wsDependentAnswers = wsDependents[jsonConstants.metadataType.QUESTION_ANSWER_BOOK] || [];
    let colDependentAnswers = colDependents[jsonConstants.metadataType.QUESTION_ANSWER_BOOK] || [];

    let wsDependentPinboards = wsDependents[jsonConstants.metadataType.PINBOARD_ANSWER_BOOK] || [];
    let colDependentPinboards = _.keyBy(
        colDependents[jsonConstants.metadataType.PINBOARD_ANSWER_BOOK] || [],
        'id'
    );

    let dependentAnswers = wsDependentAnswers.filter(function (answer) {
        return colDependentAnswers.some(function (colAnswer) {
            return answer.id === colAnswer.id &&
                colAnswer.id !== answerId && !_.has(colDependentPinboards, colAnswer.owner);
        });
    }).map(function (answer) {
        return _.assign(answer, {
            type: blinkConstants.ANSWER_TYPE
        });
    });

    let dependentPinboards = wsDependentPinboards.filter(function (pinboard) {
        return _.has(colDependentPinboards, pinboard.id);
    }).map(function (pinboard) {
        return _.assign(pinboard, {
            type: blinkConstants.PINBOARD_TYPE
        });
    });

    return dependentAnswers.concat(dependentPinboards);
}
