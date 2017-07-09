/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Service used to poll heartbeat and session
 *
 * TODO(Shikhar): Do Unit Tests
 */

'use strict';

blink.app.factory('appDoctorService', ['$rootScope',
    '$q',
    '$timeout',
    'alertService',
    'Command',
    'events',
    'alertConstants',
    'autoCompleteService',
    'sessionService',
    'session',
    'strings',
    'blinkConstants',
    'UserAction',
    function ($rootScope,
          $q,
          $timeout,
          alertService,
          Command,
          events,
          alertConstants,
          autoCompleteService,
          sessionService,
          session,
          strings,
          blinkConstants,
          UserAction) {

        var me = {},
            HEARTBEAT_POLL_INTERVAL = 30000, // 30 sec
            HEARTBEAT_EXP_BACKOFF_INTERVAL_START = 5000, // 5 sec
            HEARTBEAT_TIMEOUT = 5000, // 5 sec
            MAX_NUM_RETRY = 5,
            numRetry = 0,
            heartbeatPollTimer = null,
            heartbeatPollBackoffInterval = HEARTBEAT_EXP_BACKOFF_INTERVAL_START,
            lastCheckHadHeartbeatFailures = false,

            SESSION_POLL_INTERVAL = 300000, // 5 minutes
            sessionPollTimer = null;

        var _sageHeartbeatFailing = false;
        var _callosumHeartBeatFailing = false;

    /**
     * @return {Object} Promise
     */
        me.checkCallosumHeartbeat = function (timeout) {
            var deferred = $q.defer();
            var command = new Command()
            .setPath('/admin/healthcheck')
            .setTimeout(timeout);

            command.execute({ disableErrorNotification: true })
            .then(function (data) {
                deferred.resolve(data);
            }, function (e) {
                deferred.reject(e);
            });

            return deferred.promise;
        };

        function checkAndReportCallosumHeartbeat() {
            var deferred = $q.defer();
            me.checkCallosumHeartbeat(HEARTBEAT_TIMEOUT).then(
            function () {
                deferred.resolve();
            },
            function () {
                deferred.reject();
            }
        );
            return deferred.promise;
        }

        function checkAndReportSageHeartbeat() {
            var deferred = $q.defer();
            autoCompleteService.ping()
            .then(function(){
                deferred.resolve();
                if (!$rootScope.$$phase) {
                    $rootScope.$digest();
                }
            }, function(){
                deferred.reject();
                if (!$rootScope.$$phase) {
                    $rootScope.$digest();
                }
            }
        );

            return deferred.promise;
        }

        function refreshHeartbeatMessage() {
            if (!_callosumHeartBeatFailing && !_sageHeartbeatFailing) {
            // normal poll
                me.pollHeartbeat();
                if (lastCheckHadHeartbeatFailures) {
                    $rootScope.$broadcast(events.SHOW_ALERT_D, { message: strings.alert.WE_ARE_BACK, type: alertConstants.type.SUCCESS });
                }
                heartbeatPollBackoffInterval = HEARTBEAT_EXP_BACKOFF_INTERVAL_START;
                lastCheckHadHeartbeatFailures = false;
                numRetry = 0;
            } else {
                lastCheckHadHeartbeatFailures = true;

                var retryMessage = {
                // in case numRetry >= MAX_NUM_RETRY: We stop polling and let user manually click 'Try Now'.
                    message: strings.alert.SERVER_UNREACHABLE_RETRY_TIMEOUT,
                    action: {
                        message: strings.alert.TRY_NOW,
                        handler: angular.bind(null, me.pollHeartbeat, {interval: 100, showMessageWhenConnecting: true, pollSession: true})
                    },
                    type: alertConstants.type.PROBLEM
                };

                if (numRetry < MAX_NUM_RETRY) {
                // exponential backoff poll
                    me.pollHeartbeat({interval: heartbeatPollBackoffInterval, showMessageWhenConnecting: true});

                    angular.extend(retryMessage, {
                        message: strings.alert.SERVER_UNREACHABLE_COUNTDOWN,
                        messageType: alertConstants.messageType.COUNTDOWN,
                        countdownSeconds: (heartbeatPollBackoffInterval/1000)
                    });
                    heartbeatPollBackoffInterval += heartbeatPollBackoffInterval;
                    numRetry++;
                }

                $rootScope.$broadcast(events.SHOW_ALERT_D, retryMessage);
            }
        }

    /**
     * Chain sage and callosum checks for efficiency.
     */
        function checkAllHeartbeats() {
            checkAndReportCallosumHeartbeat().then(
            function () {
                _callosumHeartBeatFailing = false;
                refreshHeartbeatMessage();
            },
            function () {
                _callosumHeartBeatFailing = true;
                refreshHeartbeatMessage();
            }
        );

            checkAndReportSageHeartbeat().then(
            function () {
                _sageHeartbeatFailing = false;
                refreshHeartbeatMessage();
            },
            function () {
                _sageHeartbeatFailing = true;
                refreshHeartbeatMessage();
            }
        );
        }

    /**
     * Logic: poll for heartbeat every 30 seconds. If heartbeat is not heard within a timeout (3 seconds) then poll
     * next using exponential backoff interval starting at 5 seconds. Back to normal 30 second poll after heartbeat is
     * heard.
     *
     * @param {Object?} params having following optional properties:
     *                      interval: number for poll interval in msecs
     *                      showMessageWhenConnecting: boolean
     */
        me.pollHeartbeat = function (params) {
            params = params || {};
            var interval = params.interval || HEARTBEAT_POLL_INTERVAL,
                showMessageWhenConnecting = !!params.showMessageWhenConnecting;

            if (heartbeatPollTimer) {
                $timeout.cancel(heartbeatPollTimer);
            }

            heartbeatPollTimer = $timeout(function () {
                checkAllHeartbeats();
            }, interval, false);

            if (!!params.pollSession) {
                me.pollSessionOnce(100);
            }

            if (showMessageWhenConnecting) {
                $rootScope.$broadcast(events.SHOW_ALERT_D, {
                    message: strings.alert.SERVER_UNREACHABLE_CONNECTING,
                    type: alertConstants.type.PROBLEM
                });
            }
        };

    /**
     * poll the /session/info endpoint every 5 minutes - so that if user is logged out we will get 401 which will auto redirect the
     * app to login screen.
     */
        me.pollSession = function () {
            if (sessionPollTimer) {
                $timeout.cancel(sessionPollTimer);
            }

            sessionPollTimer = $timeout(function () {
                var userAction = new UserAction(UserAction.GET_SESSION_INFO);
                sessionService.getSessionInfo().then(
                angular.noop,
                function (response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                    session.markAutomaticallyLoggedOut();
                    return $q.reject(response.data);
                }
            );
                me.pollSession();
            }, SESSION_POLL_INTERVAL, false);
        };

    /**
     * This is used to poll session once
     * @param interval
     */
        me.pollSessionOnce = function (interval) {
            interval = interval || SESSION_POLL_INTERVAL;

            $timeout(function () {
                sessionService.getSessionInfo();
            }, interval, false);
        };

        return me;

    }]);
