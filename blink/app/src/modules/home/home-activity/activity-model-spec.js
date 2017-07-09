/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Unit test for ActivityModel
 */

'use strict';

describe('Activity Model', function () {

    var _ActivityModel,

        metadataListItems  = [
            {
                id: 1,
                owner: 1,
                type: 'saved-answer',
                created: 100,
                modified: 100
            },
            {
                id: 2,
                owner: 2,
                type: 'saved-answer',
                created: 100,
                modified: 500
            },
            {
                id: 3,
                owner: 3,
                type: 'pinboard',
                created: 200,
                modified: 200
            },
            {
                id: 4,
                owner: 4,
                type: 'pinboard',
                created: 200,
                modified: 700
            },
            {
                id: 5,
                owner: 5,
                type: 'worksheet',
                created: 300,
                modified: 300
            },
            {
                id: 6,
                owner: 6,
                type: 'worksheet',
                created: 500,
                modified: 800
            },
            {
                id: 7,
                owner: 7,
                type: 'imported-data',
                created: 300,
                modified: 600
            },
            {
                id: 8,
                owner: 8,
                type: 'imported-data',
                created: 400,
                modified: 400
            }
        ],

        expectedActivityItems = [
            {
                id: 6,
                owner: 6,
                type: 'worksheet',
                created: 500,
                modified: 800,
                message: 'edited a worksheet',
                href : '#/worksheet/6'
            },
            {
                id: 4,
                owner: 4,
                type: 'pinboard',
                created: 200,
                modified: 700,
                message: 'edited a pinboard',
                href : '#/pinboard/4'
            },
            {
                id: 7,
                owner: 7,
                type: 'imported-data',
                created: 300,
                modified: 600,
                message: 'edited imported data',
                href : '#/data/importeddata'
            },
            {
                id: 2,
                owner: 2,
                type: 'saved-answer',
                created: 100,
                modified: 500,
                message: 'edited a question',
                href : '#/saved-answer/2'
            },
            {
                id: 8,
                owner: 8,
                type: 'imported-data',
                created: 400,
                modified: 400,
                message: 'imported some data',
                href : '#/data/importeddata'
            },
            {
                id: 5,
                owner: 5,
                type: 'worksheet',
                created: 300,
                modified: 300,
                message: 'created a worksheet',
                href : '#/worksheet/5'
            },
            {
                id: 3,
                owner: 3,
                type: 'pinboard',
                created: 200,
                modified: 200,
                message: 'created a pinboard',
                href : '#/pinboard/3'
            },
            {
                id: 1,
                owner: 1,
                type: 'saved-answer',
                created: 100,
                modified: 100,
                message: 'asked a question',
                href : '#/saved-answer/1'
            }
        ];

    beforeEach(function () {
        module('blink.app');

        inject(function ($q, ActivityModel) {
            _ActivityModel = ActivityModel;
        });
    });

    it('should sort the items by descending modified timestamp, add the correct created / edited message, and add a timeAgo property', function () {
        var activityModel = new _ActivityModel(metadataListItems, 10);
        expect(activityModel.getItems()).toEqual(expectedActivityItems);
    });

    it('should limit the number of items to the provided limit', function () {
        var activityModel = new _ActivityModel(metadataListItems, 4);
        expect(activityModel.getItems()).toEqual(expectedActivityItems.first(4));
    });

});
