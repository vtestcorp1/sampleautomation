/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Ashish Shubham (ashish@thoughtspot.com)
 *
 * @fileoverview
 */
'use strict';

describe('User Preference', function () {
    var basePath = getBasePath(document.currentScript.src);
    var UserPreferenceComponent,
        userAdminService,
        mockSessionService = {
            setPreferredLocale: jasmine.createSpy(),
            getExposedUserPreferences: jasmine.createSpy().and.returnValue({
                locale: 'locale'
            })
        },
        mockChangeLocale = jasmine.createSpy().and.returnValue(Promise.resolve());

    beforeEach(function (done) {
        module('blink.app');
        mock(basePath, '../../../base/strings', {
            changeLocale: mockChangeLocale
        });
        mock(basePath, '../../callosum/service/session-service', mockSessionService);
        freshImport(basePath, './user-preference', '').
            then((module) => {
                inject(function(_userAdminService_) {
                    userAdminService = _userAdminService_;
                });
                UserPreferenceComponent = module.UserPreferenceComponent;
                done();
            });
    });

    it('should save preference on locale change', function () {
        let userPreference = new UserPreferenceComponent();
        userAdminService.updateExposedUserPreferences = jasmine.createSpy()
            .and.returnValue(Promise.resolve());
        userPreference.onLocaleChanged('ja');
        expect(mockChangeLocale).toHaveBeenCalled();
        expect(mockSessionService.setPreferredLocale).toHaveBeenCalledWith('ja');
        expect(userAdminService.updateExposedUserPreferences).toHaveBeenCalledWith(
            {
                locale: 'locale'
            }
        );
    });
});
