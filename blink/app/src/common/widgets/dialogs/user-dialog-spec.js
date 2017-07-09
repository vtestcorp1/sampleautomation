/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Testing for user dialog
 */

'use strict';

/* eslint camelcase: 1 */

describe('user-dialog-spec', function () {

    var $timeout,
        $q,
        userDialogs,
        dialog,
        constants,
        importDataMsg,
        scope,
        schemaText,
        data;

    beforeEach(function () {
        module('blink.app');

        inject(function (_$q_,
                         _blinkConstants_,
                         _strings_,
                         _dialog_,
                         _userDialogs_,
                         _$rootScope_,
                         _$timeout_) {
            $q = _$q_;
            dialog = _dialog_;
            userDialogs = _userDialogs_;
            scope = _$rootScope_.$new();
            constants = _blinkConstants_;
            importDataMsg = _strings_;
            $timeout = _$timeout_;
        });

        dialog.show = function(_data) {
            data = _data;
        };

        schemaText = 'CREATE TABLE "ImportedDatabase1"."ImportedSchema"."PR_SRC_ALL_DT_AO_SQL2008"' +
            ' ( "ID" VARCHAR(0), "F1_TESTCASE" VARCHAR(0), "F2_INT_DEF" BIGINT, "F3_SMALLINT_DEF" INTEGER, ' +
            '"F4_TINYINT_DEF" INTEGER, "F5_BIGINT_DEF" BIGINT, "F6_BIT_DEF" BIGINT, "F7_DECIMAL_18_0" DOUBLE, ' +
            '"F8_DECIMAL_1_27" DOUBLE, "F9_DECIMAL_15_3" DOUBLE, "F10_DECIMAL_27_1" DOUBLE, "F11_NUMERIC_18_0" DOUBLE,' +
            ' "F12_NUMERIC_1_27" DOUBLE, "F13_NUMERIC_15_3" DOUBLE, "F14_NUMERIC_27_1" DOUBLE, "F15_NUMERIC_12_3" DOUBLE, ' +
            '"F16_FLOAT_DEF" FLOAT, "F17_DATETIME_DEF" DATETIME, "F18_SMALLDATETIME_DEF" DATETIME, ' +
            '"F19_CHAR_20" VARCHAR(0), "F20_VARCHAR_255" VARCHAR(0), "F21_NVARCHAR_60" VARCHAR(0), ' +
            '"F22_TEXT_DEF" VARCHAR(0), "F23_REAL_DEF" DOUBLE, "F24_MONEY_DEF" DOUBLE, "F25_SMALLMONEY_DEF" DOUBLE, ' +
            '"F26_DATE_DEF" DATETIME, "F27_TIME_DEF" DATETIME, "F28_DATETIMEOFFSET_DEF" DATETIME, ' +
            '"F29_DATETIME2_DEF" DATETIME, PRIMARY KEY ("ID") ); ';
    });

    it("should resolve promise on confirm ", function() {

        var filterFunction = angular.noop;
        var promise = userDialogs.showEditSchemaDialog(schemaText, filterFunction);
        data.onConfirmAsync({customData:{schemaText:schemaText, strings: importDataMsg.importData}});
        promise.then(function() {
            expect(true).toBe(true);
        });
    });

    it("showEditConnectionDialog should resolve promise on callback success ", function() {
        var filterFunction = function(data) {
            return $q.resolve();
        };
        var promise = userDialogs.showEditConnectionDialog({}, filterFunction);
        data.onConfirmAsync({customData:{}});
        promise.then(function() {
            expect(true).toBe(true);
        });
    });

    it("showEditConnectionDialog should reject promise on callback error", function() {
        var filterFunction = function(data) {
            return $q.reject();
        };
        var promise = userDialogs.showEditConnectionDialog({}, filterFunction);
        data.onConfirmAsync({customData:{}});
        promise.then(function(){
            expect(true).toBe(false);
        }, function() {
            expect(true).toBe(true);
        });
    });

    it("should resolve promise on confirm ", function() {
        var filterFunction = angular.noop;
        var datasourceId = 'mock-id';
        var promise = userDialogs.showSchedulerDialog(schemaText, datasourceId, filterFunction);
        data.onConfirmAsync({customData:{}});
        promise.then(function() {
            expect(true).toBe(true);
        });
    });

    it("promise should be rejected when data management service API fails", function() {
        var filterFunction = function(data) {
            $q.reject();
        };
        var datasourceId = 'mock-id';
        var promise = userDialogs.showSchedulerDialog(schemaText, datasourceId, filterFunction);
        data.onConfirmAsync({customData:{}});
        promise.then(function(){
            expect(true).toBe(false);
        }, function() {
            expect(true).toBe(true);
        });
    });

    it("should resolve promise on showMetadataListDeleteDialog confirm", function() {
        var defer = $q.defer();
        var message = 'mock-msg';
        var checkBoxController = null;
        // confirm button
        var promise = userDialogs.showMetadataListDeleteDialog(defer, message, checkBoxController);
        var retVal = data.onConfirm({customData:{}});
        promise.then(function(){
            expect(true).toBe(true);
        }, function() {
            expect(true).toBe(false);
        });
        expect(retVal).toBe(true);
    });

    it("should resolve promise on showMetadataListDeleteDialog cancel", function() {
        var defer = $q.defer();
        var message = 'mock-msg';
        var checkBoxController = null;
        // cancel button
        var promise = userDialogs.showMetadataListDeleteDialog(defer, message, checkBoxController);
        var retVal = data.onCancel({customData:{}});
        promise.then(function(){
            expect(true).toBe(false);
        }, function() {
            expect(true).toBe(true);
        });
        expect(retVal).toBe(true);
    });


    it("showCreateConnectionDialog should resolve promise on callback success even after " +
        "connection creation failures previously", function() {
        // First the callback rejects the promise indicating a failure.
        var filterFunction = function(data) {
            return $q.reject();
        };
        var promise = userDialogs.showCreateConnectionDialog({}, filterFunction);
        data.onConfirmAsync({customData:{}});
        // Now the callback resolves the promise indicating a successful connection creation.
        filterFunction = function(data) {
            return $q.resolve();
        };
        promise.then(function(){
            expect(true).toBe(true);
        }, function() {
            expect(true).toBe(false);
        });
    });
});
