/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Unit tests for document utils.
 */

'use strict';

describe('documentUtilSpec', function() {
    var documentUtil;

    beforeEach(function () {
        module('blink.app');

        inject(function ($injector) {
            documentUtil = $injector.get('documentUtil');
        });
    });

    it('should return the document id from json', function () {
        var id = 'id';
        var json = {
            header: {
                id: id
            }
        };

        expect(documentUtil.getDocumentIdFromJson(json)).toBe(id);
    });
});
