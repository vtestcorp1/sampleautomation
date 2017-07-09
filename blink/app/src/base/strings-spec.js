/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview  strings unit tests
 *
 */

'use strict';
describe('strings', function () {
    var basePath = getBasePath(document.currentScript.src);
    var isLocalizationEnabled = true;
    var strings,
        mockSessionService = {
            isStringLocalizationEnabled: function() {
                return isLocalizationEnabled;
            }
        };
    beforeEach(module('blink.app'));

    /* eslint camelcase: 1 */
    beforeEach(function(done) {
        mock(basePath, '../modules/callosum/service/system-config-service', mockSessionService);
        freshImport(basePath, './strings').then((module) => {
            inject();
            strings = module;
            done();
        });
    });

    it('checking letter casing for ThoughtSpot ', function () {
        var allStrings = JSON.parse(JSON.stringify(strings.strings));

        expect(allStrings).not.toContain('Thoughtspot');
        expect(allStrings).not.toContain('thoughtspot');
        expect(allStrings).not.toContain('thoughtSpot');
    });

    it('should change locale appropriately', function(done) {
        var originalSystem = System;
        System = {
            'import': function() {
                return Promise.resolve({
                    translations: {
                        'Test_Translation': 'Test_Translation'
                    }
                });
            },
            config: jasmine.createSpy(),
            registry: {
                'delete': jasmine.createSpy()
            },
            resolveSync: function() {
                return '';
            }
        };
        strings.changeLocale('ja')
            .then(() => {
                expect(strings.getCurrentLocale()).toEqual('ja');
                expect(strings.strings.Test_Translation).toEqual('Test_Translation');
            })
            .then(() => isLocalizationEnabled = false)
            .then(strings.changeLocale.bind(null, 'de-DE'))
            .then(() => {
                expect(strings.getCurrentLocale()).toEqual('en-US');
                System = originalSystem;
                done();
            });
    });
});
