/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This is a sample unit test spec for sample component.
 */

'use strict';

describe('Sample Component unit tests', function () {
    var basePath = getBasePath(document.currentScript.src);
    var LoginComponent;
    var navService;

    beforeEach(function(done) {
        // Loads the blink app module.
        module('blink.app');
        // Allows mocking of typescript service.
        mock(basePath, '../callosum/service/system-config-service', {
            isSamlEnabled: function () {
                return true;
            },
            autoRedirectToSamlLogin: function () {
            }
        });
        // Mock other non ts angular services.
        module(function ($provide) {
            navService = jasmine.createSpyObj('navService', ['goToSamlLogin']);
            $provide.value('navService', navService);
        });
        // Load modules written in ts.
        Promise.all([
            freshImport(basePath, './login-component')
        ]).then(function(modules) {
            inject();
            LoginComponent = modules[0].LoginComponent;
            done();
        }).catch(function(error) {
            done.fail(error);
        });
    });

    it('sample test case', function () {
        var loginComponent = new LoginComponent();
        expect(loginComponent.userNameIsValid).toBe(false);
    });
});
