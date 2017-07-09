/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Francois Chabbey(francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Unit tests for answer page actions util.
 */

'use strict';

describe('answer page actions util spec', function () {
    // Service to Test
    var answerPageActionsUtil;

    var $q;
    var answerModel;
    var AnswerPageComponent;
    var hasAdminPrivileges;
    var hasDataManagementPrivileges;
    var hasDataDownloadPrivileges;
    var mockSessionService = {
        hasDataDownloadPrivileges: function () {
            return hasDataDownloadPrivileges;
        },
        hasAdminPrivileges: function () {
            return hasAdminPrivileges;
        },
        hasDataManagementPrivileges: function () {
            return hasDataManagementPrivileges;
        }
    };

    beforeEach(function () {
        module('blink.app');

        inject(function ($injector) {
            var sessionService = $injector.get('sessionService');
            sessionService.hasAdminPrivileges =
                mockSessionService.hasAdminPrivileges;
            sessionService.hasDataManagementPrivileges =
                mockSessionService.hasDataManagementPrivileges;
            sessionService.hasDataDownloadPrivileges =
                mockSessionService.hasDataDownloadPrivileges;
            answerPageActionsUtil = $injector.get('answerPageActionsUtil');
            AnswerPageComponent = $injector.get('AnswerPageComponent');
            var AnswerModel = $injector.get('AnswerModel');
            var answerModelJson = blink.app.fakeData['/callosum/v1/answer'];
            answerModelJson = angular.copy(answerModelJson);
            answerModelJson.reportBookMetadata.complete = true;
            answerModelJson.reportBookMetadata.incompleteDetail = [{}];

            answerModel = new AnswerModel(answerModelJson);
            answerModel.getCurrentAnswerSheet().getPrimaryDisplayedViz = function () {
                return {
                    getVizType: function () {
                        return 'TABLE';
                    }
                };
            };
        });
    });

    it('should have save as worksheet button enabled for system user', function () {
        hasAdminPrivileges = false;
        hasDataManagementPrivileges = true;
        var answerPageComponent = new AnswerPageComponent(
            answerModel,
            null,
            _.noop,
            true,
            true,
            {
                containerActions: [],
                actionsOrder: []
            }
        );
        var permission = {
            isMissingUnderlyingAccess: function () {
                return false;
            }
        };
        var actions = answerPageActionsUtil.getAnswerPageActions(answerPageComponent, permission);
        expect(actions[0].showWhen()).toBe(true);
    });

    it('should have save as worksheet button enabled for admin user', function () {
        hasAdminPrivileges = true;
        hasDataManagementPrivileges = true;
        var answerPageComponent = new AnswerPageComponent(
            answerModel,
            null,
            _.noop,
            true,
            true,
            {
                containerActions: [],
                actionsOrder: []
            }
        );
        var permission = {
            isMissingUnderlyingAccess: function () {
                return false;
            }
        };
        var actions = answerPageActionsUtil.getAnswerPageActions(answerPageComponent, permission);
        expect(actions[0].showWhen()).toBe(true);
    });

    it('should not show save as worksheet button disabled for others user', function () {
        hasDataManagementPrivileges = false;
        hasAdminPrivileges = false;
        var answerPageComponent = new AnswerPageComponent(
            answerModel,
            null,
            _.noop,
            true,
            true,
            {
                containerActions: [],
                actionsOrder: []
            }
        );
        var permission = {
            isMissingUnderlyingAccess: function () {
                return false;
            }
        };
        var actions = answerPageActionsUtil.getAnswerPageActions(answerPageComponent, permission);
        expect(actions[0].showWhen()).toBe(false);
    });

    it('should have download button disabled if permission insufficient', function(){
        hasDataDownloadPrivileges = false;
        var answerPageComponent = new AnswerPageComponent(
            answerModel,
            null,
            _.noop,
            true,
            true,
            {
                containerActions: [],
                actionsOrder: []
            }
        );
        var permission = {
            isMissingUnderlyingAccess: function () {
                return false;
            }
        };
        var actions = answerPageActionsUtil.getAnswerPageActions(answerPageComponent, permission);
        expect(actions[3].showWhen()).toBe(false);
        expect(actions[4].showWhen()).toBe(false);
        expect(actions[5].showWhen()).toBe(false);
    });

    it('should have download button enabled if permission sufficient', function() {
        hasDataDownloadPrivileges = true;
        var answerPageComponent = new AnswerPageComponent(
            answerModel,
            null,
            _.noop,
            true,
            true,
            {
                containerActions: [],
                actionsOrder: []
            }
        );
        var permission = {
            isMissingUnderlyingAccess: function () {
                return false;
            }
        };
        var actions = answerPageActionsUtil.getAnswerPageActions(answerPageComponent, permission);
        expect(actions[3].showWhen()).toBe(true);
        expect(actions[4].showWhen()).toBe(true);
        expect(actions[5].showWhen()).toBe(true);
    });

    it('SCAL-20210 should disable certain action on missing underlying access', function () {
        hasAdminPrivileges = false;
        hasDataManagementPrivileges = true;
        var answerPageComponent = new AnswerPageComponent(
            answerModel,
            null,
            _.noop,
            true,
            true,
            {
                containerActions: [],
                actionsOrder: []
            }
        );
        var permission = {
            isMissingUnderlyingAccess: function () {
                return true;
            }
        };
        var actions = answerPageActionsUtil.getAnswerPageActions(answerPageComponent, permission);
        var actionsToBeDisabled = {
            addFormula: true,
            showUnderlyingData: true,
            triggerA3: true,
            triggerA2: true
        };
        var tooltipText = 'To perform this action please request access to ' +
            'data sources used to build this answer.';
        actions.forEach(function (action) {
            if (actionsToBeDisabled[action.id]) {
                expect(action.dropdownItemDisabled).toBe(true);
                expect(action.dropdownItemTooltip).toBe(tooltipText);
            }
        });
    });
});
