/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Vishwas Sharma (vishwas.sharma@thoughtspot.com)
 *
 * @fileoverview Testing for import dialog
 */

'use strict';

/* eslint camelcase: 1 */

describe('import-dialog-spec', function () {

    var $q,
        importDialog,
        dialog,
        constants,
        scope;

    beforeEach(function () {
        module('blink.app');

        inject(function (_$q_,
                         _dialog_,
                         _importDialog_,
                         _$rootScope_) {
            $q = _$q_;
            dialog = _dialog_;
            importDialog = _importDialog_;
            scope = _$rootScope_.$new();
            constants = _$rootScope_.blinkConstants;
        });
    });

    it("should disable confirm button for empty file path", function () {
        expect(importDialog.disableConfirmButton({filePath: ''})).toBe(true);
    });

    it("should enable confirm button for non empty file path", function () {
        expect(importDialog.disableConfirmButton({filePath: 'someFileName'})).toBe(false);
    });
});
