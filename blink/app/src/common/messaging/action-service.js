/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Service to deal with action handling
 *
 **/

'use strict';

blink.app.factory('actionService', ['alertConstants',
    'jsonConstants',
    'navService',
    'strings',
    'UserAction',
    function(alertConstants,
        jsonConstants,
        navService,
        strings,
        UserAction) {

        var userActionsToActionsMap = {};

        userActionsToActionsMap[UserAction.FETCH_WORKSHEET_DATA] = {
            10005: function (name, id, type) {
                var handlers = {};
                handlers[jsonConstants.metadataType.subType.WORKSHEET] = navService.goToWorksheet;
                handlers[jsonConstants.metadataType.subType.AGGR_WORKSHEET] = navService.goToAggregatedWS;
                handlers[jsonConstants.metadataType.subType.SYSTEM_TABLE] = navService.goToRLS;
                return {
                    message: strings.alert.recoveryMessages.RECOVER_OBJECT.assign(name),
                    handler: function() {
                        handlers[type](id);
                    }
                };
            }
        };

        userActionsToActionsMap[UserAction.ADD_VIZ_TO_PINBOARD] = {
            SUCCESS: function (name, id) {
                return  {
                    message: name,
                    link: navService.getPathToPinboard(id),
                    handler: function() {
                        navService.goToPinboard(id);
                    }
                };
            }
        };

        function getFailureAction(userActionType, errorCode) {
            errorCode = errorCode || 'FAILURE';
            if(!!userActionsToActionsMap[userActionType] &&
            userActionsToActionsMap[userActionType][errorCode]) {
                return userActionsToActionsMap[userActionType][errorCode];
            }
        }

        function getSuccessAction(userActionType) {
            if(!!userActionsToActionsMap[userActionType] &&
            userActionsToActionsMap[userActionType].SUCCESS) {
                return userActionsToActionsMap[userActionType].SUCCESS;
            }
        }

        return {
            getFailureAction: getFailureAction,
            getSuccessAction: getSuccessAction
        };
    }]);
