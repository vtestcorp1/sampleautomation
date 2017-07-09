/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com), Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview A wrapper over the AutoComplete Types and Service
 */

'use strict';
/* eslint camelcase: 1, no-undef: 0 */

(function() {

    sage.ValidateContextRequest.create = function(requestInfo, context) {
        return new sage.ValidateContextRequest({
            info: requestInfo,
            context: context
        });
    };

    sage.CleanupContextRequest.create = function(requestInfo, context) {
        return new sage.CleanupContextRequest({
            info: requestInfo,
            context: context
        });
    };

    sage.AddTableRequest.create = function(requestInfo, context, tableRequest) {
        return new sage.AddTableRequest({
            info: requestInfo,
            context: context,
            table: tableRequest
        });
    };

    sage.DeleteTableRequest.create = function(requestInfo, context, index) {
        return new sage.DeleteTableRequest({
            info: requestInfo,
            context: context,
            idx: index
        });
    };

    sage.EditTableRequest.create = function(requestInfo, context, index, tableRequest) {
        return new sage.EditTableRequest({
            info: requestInfo,
            context: context,
            idx: index,
            table: tableRequest
        });
    };

    sage.TransformTableRequest.create = function(requestInfo, context, index, transformations) {
        return new sage.TransformTableRequest({
            info: requestInfo,
            context: context,
            idx: index,
            transform: transformations
        });
    };

    sage.GetAccessibleTablesRequest.create = function (requestInfo, context, index) {
        return new sage.GetAccessibleTablesRequest({
            info: requestInfo,
            context: context,
            idx: index
        });
    };

    sage.SaveFormulaRequest.create = function(requestInfo, context, formula) {
        return new sage.SaveFormulaRequest({
            info: requestInfo,
            context: context,
            formula: formula
        });
    };

    sage.RemoveFormulaRequest.create = function(requestInfo, context, formula) {
        return new sage.RemoveFormulaRequest({
            info: requestInfo,
            context: context,
            formula: formula
        });
    };

    sage.UpdateFormulaRequest.create = function(requestInfo, context, tableRequest, formulaId) {
        return new sage.UpdateFormulaRequest({
            info: requestInfo,
            context: context,
            table: tableRequest,
            formula_id: formulaId
        });
    };

    sage.AddTableFilterRequest.create = function(requestInfo, filter, tableGuid) {
        return new sage.AddTableFilterRequest({
            info: requestInfo,
            filter_defn: filter,
            table_guid: tableGuid
        });
    };

    sage.UpdateTableFilterRequest.create = function(requestInfo, filter, token, tableGuid) {
        return new sage.UpdateTableFilterRequest({
            info: requestInfo,
            filter_defn: filter,
            table_filter: token,
            table_guid: tableGuid
        });
    };

    sage.AddJoinRequest.create = function(requestInfo, context, joinRequest) {
        return new sage.AddJoinRequest({
            info: requestInfo,
            context: context,
            join: joinRequest
        });
    };

    sage.EditJoinRequest.create = function(requestInfo, context, idx, joinRequest) {
        return new sage.EditJoinRequest({
            info: requestInfo,
            context: context,
            idx: idx,
            join: joinRequest
        });
    };

    sage.DeleteJoinRequest.create = function(requestInfo, context, idx) {
        return new sage.DeleteJoinRequest({
            info: requestInfo,
            context: context,
            idx: idx
        });
    };

    sage.UpdateWorksheetRequest.create = function(requestInfo, context, tableRequest) {
        return new sage.UpdateWorksheetRequest({
            info: requestInfo,
            worksheet: tableRequest,
            context: context
        });
    };

    sage.TransformWorksheetRequest.create = function(requestInfo, context, transformations) {
        return new sage.TransformWorksheetRequest({
            info: requestInfo,
            context: context,
            transform: transformations
        });
    };

    sage.RefreshGuidsRequest.create = function(requestInfo, context) {
        return new sage.RefreshGuidsRequest({
            info: requestInfo,
            context: context
        });
    };

    sage.Request.createTransformRequest = function(transformRequest) {
        return new sage.Request({
            type: sage.Request.Type.TRANSFORM_TABLE,
            transform_table: transformRequest
        });
    };

    sage.Request.createGetAccessibleTablesRequest = function(request) {
        return new sage.Request({
            type: sage.Request.Type.GET_ACCESSIBLE_TABLES,
            get_accessible_tables: request
        });
    };

    sage.Request.createUpdateFormulaRequest = function(request) {
        return new sage.Request({
            type: sage.Request.Type.UPDATE_FORMULA,
            update_formula: request
        });
    };

    sage.BatchRequest.create = function(requests) {
        return new sage.BatchRequest({
            request: requests
        });
    };
})();
