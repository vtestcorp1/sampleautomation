/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Service to allow preventing user navigating away from unsaved changes
 */

'use strict';

blink.app.factory('navAlertService', [
    '$q',
    '$rootScope',
    'Logger',
    '$window',
    'dialog',
    '$location',
    'env',
    'strings',
    'util',
    function ($q,
              $rootScope,
              Logger,
              $window,
              dialog,
              $location,
              env,
              strings,
              util) {

        var _logger = Logger.create('nav-alert-service');

        var ServiceState = {
            IDLE: 1,
            ROUTE_CHANGE_RECEIVED: 2,
            AWAITING_USER_RESPONSE: 3,
            USER_CONFIRMED_NAVIGATION: 4
        };

        var me = {},
            _state = ServiceState.IDLE,
            _currentNavigationURLPair = null,
            _callbacks = [],
            confirmationDialogConfig = {
                title: strings.documentUnsavedChangesAlert.UNSAVED_CHANGES,
                message: strings.documentUnsavedChangesAlert.GENERIC_MESSAGE,
                cancelBtnLabel: strings.documentUnsavedChangesAlert.STAY_HERE,
                confirmBtnLabel: strings.documentUnsavedChangesAlert.DISCARD,
                cancelCbOnClose: true,
                doNotCloseOnNavigation: true,
                onConfirm: function () {
                    return true;
                }
            };

        function getAlertMessage(newPath, oldPath) {
            for (var i=_callbacks.length - 1; i >=0; i--) {
                try {
                    var alertMessage = _callbacks[i](newPath, oldPath);
                    if (alertMessage) {
                        return alertMessage;
                    }
                }
                catch (e) {
                    _logger.warn('error in navAlertService listener callback', e);
                }
            }

            return null;
        }

        function onBeforeWindowUnload(event) {
            if (env.e2eTest) {
                return;
            }

            var alertMessage = getAlertMessage();
            if (alertMessage && typeof alertMessage !== 'string') {
                alertMessage = alertMessage.message;
            }
            if (alertMessage) {
                return alertMessage;
            }
            return;
        }

        function resetStateMachine () {
            _state = ServiceState.IDLE;
            _currentNavigationURLPair = null;
        }

    //the intended navigation can have further automatic redirects which can trigger even
    //before the registerer had a chance to de-register ((SCAL-4352). We don't want to end up
    //throwing popups for each redirect. waiting for an event loop to finish allows us to avoid
    //reacting to such redirects
        function resetStateMachineInNextEventLoop() {
            util.executeInNextEventLoop(function(){
                resetStateMachine();
            });
        }

        //TODO(sunny): when nth client threw an alert and the user chose to ignore the alert we should
        //ask n-1th client if she wants to show an alert (principle: the user should see warning about all
        //unsaved changes)

        //there are four cases in which this function is called
        //1. first time a navigation is triggered: event should be cancelled, alert, if any, should be shown
        //2. if the first navigation was because of back/forward button, since we called preventDefault, angular will
        //   call the inverse of the first trigger to simulate preventDefault causing route to change again: event should
        //   not be cancelled, no alert should be shown
        //3. if the user confirms the navigation we explicitly navigate to the original destination she was trying to
        //   navigate to causing a route change: event should not be cancelled, no alert should be shown
        //4. while the alert popup was showing the user explicitly triggered another route change (button click,
        //   back/forward button): event should be cancelled, no alert should be shown
        function onBeforeRouteChange ($evt, newPath, oldPath) {
            //fail-safe to avoid the state machine from getting stuck in an intermediate state. the invariant during
            //all the transitions in the state machine is unordered pair of paths between which the navigation is happening
            //if the pair changes we can reset the machine
            if (_state !== ServiceState.IDLE && _currentNavigationURLPair && !util.areArraysSameSet([newPath, oldPath], _currentNavigationURLPair)) {
                resetStateMachineInNextEventLoop();
                return true;
            }

            _currentNavigationURLPair = [newPath, oldPath];

            if (_state === ServiceState.AWAITING_USER_RESPONSE) {
            //the alert dialog has been shown, navigating away is not allowed until the alert has been answered
                $evt.preventDefault();
                return false;
            }
            if (_state === ServiceState.ROUTE_CHANGE_RECEIVED) {
            //the first route change received in IDLE state is still being processed (but alert not shown yet)
            //any navigation attempt in this time window will come from angular's hack to simulate back/forward
            //button click event cancellation. we have let them happen without reacting to them
                return true;
            }
            if (_state === ServiceState.USER_CONFIRMED_NAVIGATION) {
            //user confirmed navigation and the we are explicitly navigating the user to the initially intended
            //we have to let our own navigation happen
                resetStateMachineInNextEventLoop();
                return true;
            }

            var alertMessage = getAlertMessage(newPath, oldPath);
            if (!alertMessage) {
                return true;
            }

            _state = ServiceState.ROUTE_CHANGE_RECEIVED;

            $evt.preventDefault();

            var config = {};
            if (typeof alertMessage !== 'object') {
                config.message = alertMessage;
            } else {
                config = angular.extend(config, alertMessage);
            }

            var onConfirmAsync = alertMessage.onConfirmAsync;
            if (onConfirmAsync) {
                config.onConfirmAsync = function () {
                    var defer = $q.defer();
                    onConfirmAsync().then(function(data){
                        _state = ServiceState.USER_CONFIRMED_NAVIGATION;
                        $location.path(newPath.substring(newPath.indexOf('#') + 1));
                        defer.resolve(data);
                    }, function(error){
                        defer.reject(error);
                    });
                    return defer.promise;
                };
            }

            var onConfirm = alertMessage.onConfirm;
            config.onConfirm = function () {
                if (onConfirm) {
                    try {
                        onConfirm();
                    } catch (e) {
                        _logger.warn("Error in onConfirm", e);
                    }
                }

                _state = ServiceState.USER_CONFIRMED_NAVIGATION;
                $location.path(newPath.substring(newPath.indexOf('#') + 1));

                return true;
            };

            var onCancel = alertMessage.onCancel;
            config.onCancel = function () {
                if (onCancel) {
                    try {
                        onCancel();
                    } catch (e) {
                        _logger.warn("Error in onCancel", e);
                    }
                }
                resetStateMachine();
            };

            config = angular.extend(confirmationDialogConfig, config);

        // Note (sunny): we used to wait for another event loop before
        // changing the current state of the state machine because of
        // of some extraneous events that were being fired in the older
        // version of angular. That seems to have been fixed.
        // Also waiting for another event loop would mean that in case
        // of multiple $locationChangeStart getting fired in the same
        // event loop we would allow the second or further $locationChangeStart
        // to take effect (SCAL-13070)
            _state = ServiceState.AWAITING_USER_RESPONSE;
            dialog.show(config);

            return false;
        }

        me.registerListener = function(callback) {
            _callbacks.push(callback);
            return function () {
                var callbackIndex = _callbacks.indexOf(callback);
                if (callbackIndex < 0) {
                    _logger.warn("callback to be removed has already been removed");
                    return;
                }
                _callbacks.removeAt(callbackIndex, callbackIndex);
            };
        };

        var removeRouteChangeFn;

        me.registerWindowUnloadAndRouteChangeListeners = function() {
        //deregistering first to make sure to avoid double addition
            $($window).off('beforeunload.nav-alert-service', onBeforeWindowUnload);
            if (removeRouteChangeFn) {
                removeRouteChangeFn();
            }

            $($window).on('beforeunload.nav-alert-service', onBeforeWindowUnload);
            removeRouteChangeFn = $rootScope.$on('$locationChangeStart', onBeforeRouteChange);
        };

        me.deRegisterWindowUnloadAndRouteChangeListeners = function() {
            $($window).off('beforeunload.nav-alert-service', onBeforeWindowUnload);
            if (removeRouteChangeFn) {
                removeRouteChangeFn();
                removeRouteChangeFn = null;
            }
        };

        return me;

    }]);
