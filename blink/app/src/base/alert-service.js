/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * This service providers alerting capability to the app.
 */

'use strict';

blink.app.factory('alertService', ['$rootScope',
    '$q',
    'actionService',
    'adminService',
    'alertConstants',
    'blinkConstants',
    'clientState',
    'events',
    'FormDownloader',
    'FullEmbedConfig',
    'Logger',
    'messageService',
    'strings',
    'sessionService',
    'UserAction',
    'util',
    'workflowManagementService',
    function($rootScope,
             $q,
             actionService,
             adminService,
             alertConstants,
             blinkConstants,
             clientState,
             events,
             FormDownloader,
             FullEmbedConfig,
             Logger,
             messageService,
             strings,
             sessionService,
             UserAction,
             util,
             workflowManagementService) {
        var _logger = Logger.create('alert-service');
        var messageCodeStrings = strings.msg_code;

        function getMessageSummary(protoMessage) {
            var msgCode = protoMessage.getCode();
            return messageCodeStrings[msgCode].summary;
        }

        function getMessageDetail(protoMessage) {
            var msgCode = protoMessage.getCode();
            return messageCodeStrings[msgCode].detail;
        }

        function getMessageAction(protoMessage) {
            var msgCode = protoMessage.getCode();
            return messageCodeStrings[msgCode].action;
        }

        function isAlertBarHidden() {
            var isEmbedAppEnabled = clientState.isAppEmbedded();
            var isAlertBarHidden = FullEmbedConfig.isAlertBarHidden();

            return isEmbedAppEnabled && isAlertBarHidden;
        }

        function parseAlertsForFullEmbed(params) {
            var alertParams = {
                messages: params.message,
                type: params.type
            };

            if (params.customData) {
                alertParams.traceId = params.customData.traceId;
                alertParams.code = params.customData.leftColumnPairs[0].value;
                alertParams.incidentId = params.customData.rightColumnPairs[0].value;
            }

            return alertParams;
        }

        /**
         *
         * @param params
         * @param params.message {String}
         * @param params.type {AlertConstants.type}
         * @param params.details {String}
         * @param params.action.message {String}
         * @param params.action.link {String}
         * @param params.action.function {String}
         */
        function showAlert(params){
            if(isAlertBarHidden()){
                var alertMessage = parseAlertsForFullEmbed(params);
                if (window.parent) {
                    window.parent.postMessage(alertMessage, "*");
                }
                return;
            }

            $rootScope.$broadcast(events.SHOW_ALERT_D, params);
        }

        function hideAlert() {
            if(isAlertBarHidden()){
                return;
            }

            $rootScope.$broadcast(events.HIDE_ALERT_D);
        }

        function _getFailureAlertContent(protoMessage, response, params) {
            response = response || {};
            params = params || {};

            var type = alertConstants.messageCodeToType[protoMessage.getSeverity()];
            var summaryMessage = getMessageSummary(protoMessage);
            var detailMessage = getMessageDetail(protoMessage);
            if (params && params.substitutions) {
                if (summaryMessage) {
                    summaryMessage = summaryMessage.assign(params.substitutions);
                }
                if (detailMessage) {
                    detailMessage = detailMessage.assign(params.substitutions);
                }
            }
            var blinkCodeNumber = protoMessage.getCode();
            var incidentId = response.incidentId;
            var traceId = response.traceId;
            var customUrl = (params && params.customUrl)
                || 'src/common/alert/templates/api-alert-template.html';
            var customData = (params && params.customData) || {};

            if (!!response.status) {
                if (response.status === blinkConstants.HTTP_STATUS_NOT_AUTHORIZED) {
                    summaryMessage = strings.alert.httpStatus.NOT_AUTHORIZED;
                }
            } else if (response.timedout) {
                summaryMessage = strings.alert.httpStatus.TIMED_OUT;
            }

            var blinkErrorCode = 'TS-{codeNumber}'.assign({
                codeNumber: util.zeroFill(blinkCodeNumber, 5)
            });

            summaryMessage = assignAdminEmail(summaryMessage);
            detailMessage = assignAdminEmail(detailMessage);
            if (!!detailMessage) {
                customData.detailMessage = detailMessage;
            }

            var nameValuePairs = [];

            nameValuePairs.push(
                {
                    name: strings.apiErrorMessage.errorCode,
                    value: blinkErrorCode
                }
        );
            if (!!incidentId) {
                nameValuePairs.push(
                    {
                        name: strings.apiErrorMessage.incidentId,
                        value: incidentId
                    }
            );
            }
            customData.leftColumnPairs = [];
            customData.rightColumnPairs = [];
            for (var i = 0; i < nameValuePairs.length; i++) {
                if (i % 2) {
                    customData.rightColumnPairs.push(nameValuePairs[i]);
                } else {
                    customData.leftColumnPairs.push(nameValuePairs[i]);
                }
            }

            if (!!traceId && !params.hideReportProblemLink) {
                customData.traceId = traceId;
                var currentWorkflowId = workflowManagementService.getCurrentWorkflowId();
                var flushClientDebugTracePromise = !!currentWorkflowId
                    ? workflowManagementService.flushCurrentTraceToServer()
                    : $q.when();
                var id = currentWorkflowId || traceId;
                customData.downloadTrace = function () {
                    flushClientDebugTracePromise.then(function() {
                        new FormDownloader().downloadForm(
                            "callosum/v1/admin/debug/gettraceevent",
                            {id: id}
                        );
                    });
                };
                customData.emailTrace = function () {
                    var userAction = new UserAction(UserAction.REPORT_PROBLEM);
                    flushClientDebugTracePromise
                        .then(
                            function(){
                                return adminService.reportTraceEvent(id);
                            })
                        .then(
                            function (response) {
                                showUserActionSuccessAlert(userAction, response);
                            },
                            function(response) {
                                showUserActionFailureAlert(userAction, response);
                            });
                };
                customData.downloadTraceText = strings.apiErrorMessage.downloadTrace;
                customData.reportProblemText = strings.apiErrorMessage.reportProblem;
            }

            return {
                message: summaryMessage,
                type: type,
                customData: customData,
                customUrl: customUrl,
                allowClose: true,
                action: params && params.action
            };
        }

        function _showFailureAlert(protoMessage, response, params) {
            var alertContent = _getFailureAlertContent(protoMessage, response, params);
            showAlert(alertContent);
        }

    /**
     * @param blinkGeneratedErrorCode   {Number}
     * @param params                    {Object}    Optional Parameters
     * @param params.substitutions      {Array}     Array of substitutions to be done on the message
     */
        function showFailureAlert(blinkGeneratedErrorCode, params) {
            var protoMessage = messageService.getFailureMessage(null, blinkGeneratedErrorCode);
            _showFailureAlert(protoMessage, {}, params);
        }

        /**
         * @param userAction    The userAction for which the alert is to be shown
         * @param response      The callosum response object
         * @param params
         */
        function showUserActionSuccessAlert(userAction, response, params) {
            var type = alertConstants.type.SUCCESS;
            params = params || {};
            var message = getMessageSummary(messageService.getSuccessMessage(userAction.type));
            if (params.substitutions) {
                message = message.assign(params.substitutions);
            }
            message = assignAdminEmail(message);

            var action = actionService.getSuccessAction(userAction.type);
            params.action = getActionForAlert(params, action);

            showAlert({
                message: message,
                type: type,
                action: (params && params.action)
            });
        }

    /**
     *
     * @param userAction
     * @param response
     * @param params
     * @returns {{message, type, customData, customUrl, allowClose, action}|*}
     */
        function getUserActionFailureAlertContent(userAction, response, params) {
            if (response.isIgnored) {
                return;
            }
            params = params || {};
        // If reporting problem itself fails, don't show link to report that.
            if (userAction.type === UserAction.REPORT_PROBLEM) {
                params.hideReportProblemLink = true;
            }
            var callosumErrorCodeNumber = params.code || (response.data && response.data.code);
            var protoMessage = messageService.getFailureMessage(userAction.type, callosumErrorCodeNumber);
            var action = actionService.getFailureAction(userAction.type, callosumErrorCodeNumber);
            params.action = getActionForAlert(params, action);

            return _getFailureAlertContent(protoMessage, response, params);
        }

    /**
     * @param userAction    The userAction for which the alert is to be shown
     * @param response      The callosum response object
     * @param params        Optional Params. These contain override values for
     *                      for various values.
     */
        function showUserActionFailureAlert(userAction, response, params) {
            if (response.isIgnored) {
                return;
            }

            var userActionFailureAlertContent = getUserActionFailureAlertContent(userAction, response, params);
            showAlert(userActionFailureAlertContent);
        }

        function getActionForAlert(params, action) {
            if(!!action) {
                return params.action || action.apply(null, params.actionParams);
            }
            return params.action;
        }

        function assignAdminEmail(message) {
            var emailAddress = sessionService.getCustomerAdminEmail()
            || blinkConstants.defaultAdminEmail;
            return message && message.assign({adminEmail: emailAddress});
        }

        return {
            showAlert: showAlert,
            hideAlert: hideAlert,
            showFailureAlert: showFailureAlert,
            showUserActionSuccessAlert: showUserActionSuccessAlert,
            showUserActionFailureAlert: showUserActionFailureAlert,
            getUserActionFailureAlertContent: getUserActionFailureAlertContent,
            alertConstants: alertConstants
        };
    }]);
