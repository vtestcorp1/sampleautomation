/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Ashish Shubham (ashish@thoughtspot.com)
 *
 * @fileoverview Unit tests for slack-register component
 */
'use strict';

describe('Slack Register', function() {
    var basePath = getBasePath(document.currentScript.src);
    var SlackRegisterComponent, userAdminService,
        mockDialog = {
            show: jasmine.createSpy()
        };

    beforeEach(function(done) {
        module('blink.app');
        mock(basePath, '../callosum/service/session-service', {
            getUserSlackId: function() {
                return 'foo';
            }
        });
        mock(basePath, '../../common/widgets/dialog/dialog-service', mockDialog);

        Promise.all([
            freshImport(basePath, './slack-register')
        ]).
            then(function(modules) {
                inject(function(_userAdminService_, _$q_) {
                    userAdminService = _userAdminService_;
                });
                SlackRegisterComponent = modules[0].SlackRegisterComponent;
                done();
            });
    });

    it('should show confirmation dialog with callback if slackId already registered', () => {
        userAdminService.updateCurrentUserSlackId = jasmine.createSpy()
            .and.returnValue(Promise.resolve());
        let slackRegister = new SlackRegisterComponent();
        expect(mockDialog.show).toHaveBeenCalled();
        let config = mockDialog.show.calls.argsFor(0)[0];
        config.onConfirm();
        expect(userAdminService.updateCurrentUserSlackId).toHaveBeenCalled();
    });
});
