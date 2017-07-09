/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Vishwas Sharma (vishwas.sharma@thoughtspot.com)
 *
 * @fileoverview Testing for export dialog
 */

'use strict';

/* eslint camelcase: 1 */

describe('export-dialog-spec', function () {

    var $q,
        exportDialog,
        dialog,
        constants,
        scope;

    beforeEach(function () {
        module('blink.app');

        inject(function (_$q_,
                         _dialog_,
                         _exportDialog_,
                         _$rootScope_) {
            $q = _$q_;
            dialog = _dialog_;
            exportDialog = _exportDialog_;
            scope = _$rootScope_.$new();
            constants = _$rootScope_.blinkConstants;
        });
    });

    it("should disable confirm button for empty URLs ", function () {
        expect(exportDialog.disableConfirmButton({exportURL: ''})).toBe(true);
    });

    it("should enable confirm button for non empty URLs ", function () {
        expect(exportDialog.disableConfirmButton({exportURL: 'http://localhost'})).toBe(false);
        expect(exportDialog.disableConfirmButton({exportURL: 'https://localhost'})).toBe(false);
    });
});
