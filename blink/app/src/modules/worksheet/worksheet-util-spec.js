/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Unit tests for worksheet util service
 */

'use strict';
/* eslint camelcase: 1 */
describe('Worksheet list', function () {
    var mockMetadataService = {},
        jsonConstants,
        q,
        scope,
        worksheetUtil;

    var system_table_type,
        user_defined_type;

    beforeEach(function () {
        module('blink.app');
        module(function ($provide) {
            $provide.value('metadataService', mockMetadataService);
        });
        inject(function (_$q_,
                         _$rootScope_,
                         _worksheetUtil_,
                         _jsonConstants_) {
            jsonConstants = _jsonConstants_;
            q = _$q_;
            scope = _$rootScope_;
            mockMetadataService.getMetadataDetails = function () {
                return q.when(blink.app.fakeData['/callosum/v1/metadata/details/threeTable']);
            };
            worksheetUtil = _worksheetUtil_;
            system_table_type = jsonConstants.metadataType.subType.SYSTEM_TABLE;
            user_defined_type = jsonConstants.metadataType.subType.IMPORTED_DATA;
        });
    });

    it("should return system and user tables", function(){
        worksheetUtil.getLogicalTableModels([], {}).then(function(response) {
            expect(response.data.length).toBe(3);
            expect(response.data[0].getMetadataSubType()).toBe(system_table_type);
            expect(response.data[1].getMetadataSubType()).toBe(system_table_type);
            expect(response.data[2].getMetadataSubType()).toBe(user_defined_type);
        });
        scope.$digest();
    });
});
