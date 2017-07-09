/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Vijay Ganesan (vijay@thoughtspot.com)
 *
 * @fileoverview Unit test for LoginController
 */

'use strict';

describe('LoginController Unit tests', function () {
    var autoRedirectToSaml = false;
    var navService;
    var manuallyLoggedOut = false;

    var basePath = getBasePath(document.currentScript.src);
    var LoginComponent;

    beforeEach(function(done) {
        module('blink.app');
        mock(basePath, '../callosum/service/system-config-service', {
            isSamlEnabled: function () {
                return true;
            },
            autoRedirectToSamlLogin: function () {
                return autoRedirectToSaml;
            }
        });
        mock(basePath, '../../base/user/session', {
            wasManuallyLoggedOut: function () {
                return manuallyLoggedOut;
            }
        });
        module(function ($provide) {
            navService = jasmine.createSpyObj('navService', ['goToSamlLogin']);
            $provide.value('navService', navService);
        });
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

    it('should set userNameIsValid to false when the username is not defined', function () {
        var loginComponent = new LoginComponent();
        expect(loginComponent.userNameIsValid).toBe(false);
    });

    it('should set userNameIsValid to false when the username is empty', function () {
        var loginComponent = new LoginComponent();
        loginComponent.user = '   ';
        loginComponent.onUserNameChange();
        expect(loginComponent.userNameIsValid).toBe(false);
    });

    it('should set userNameIsValid to true when the username is valid', function () {
        var loginComponent = new LoginComponent();
        loginComponent.user = ' admin ';
        loginComponent.onUserNameChange();
        expect(loginComponent.userNameIsValid).toBe(true);
    });

    it('should auto redirect to saml login for the first time', function () {
        autoRedirectToSaml = true;
        var loginComponent = new LoginComponent();
        expect(navService.goToSamlLogin).toHaveBeenCalled();
    });

    it('should not auto redirect to saml login after logout', function () {
        autoRedirectToSaml = true;
        manuallyLoggedOut = true;
        var loginComponent = new LoginComponent();
        expect(navService.goToSamlLogin).not.toHaveBeenCalled();
    });
});

