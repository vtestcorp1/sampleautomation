/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jordie Hannel (jordie@thoughtspot.com)
 *
 * @fileoverview Service to set up pause/play functionality and run replays.
 */

'use strict';

/* eslint camelcase: 1 */
blink.app.factory('replayRunner', ['$q',
    '$timeout',
    '$rootScope',
    'blinkConstants',
    'strings',
    'Logger',
    'navAlertService',
    'safeApply',
    'uiControls',
    'angularUtil',
    function($q,
             $timeout,
             $rootScope,
             blinkConstants,
             strings,
             Logger,
             navAlertService,
             safeApply,
             uiControls,
             angularUtil) {

        var _paused,
            _killed,
            _pastURLs,
            _pauseDeferred,
            _onEnd,
            _pausable,
            _$replayCtrls,
            _$replayCtrlsScope,
            _navAlertDeregisterer,
            START_REPLAY_BTN = '.bk-btn:contains(Start Replay)',
            FINAL_PAUSE_LENGTH = 2000;

        var _logger = Logger.create('replay-service');

        var dummyDeferred = $q.defer();

        function pause() {
            _paused = true;
            safeApply(_$replayCtrls.scope());
        }

        function isPaused() {
            return _paused;
        }

        function resume() {
            if (_paused) {
                _paused = false;
                _pauseDeferred.resolve();
                _pauseDeferred = $q.defer();
                safeApply(_$replayCtrls.scope());
            }
        }

        function kill() {
            _killed = true;
        }

        function checkIfPaused() {
            if (_killed) {
            // dummy promise; never resolved or rejected
            // better way to do this?
                return dummyDeferred.promise;
            }

            if (_paused) {
                return _pauseDeferred.promise;
            }

            return $q.when();
        }

        function hideReplayControls() {
            _$replayCtrls.remove();
        }

        function getReplayControlsDiv(contents) {
            return '<div blink-replay-controls ' + contents + '></div>';
        }

        function showReplayControls(pausable) {
            if (!angular.isDefined(pausable)) {
                pausable = _pausable;
            }

            var _$replayCtrlsScope = $rootScope.$new();
            if (pausable) {
                _$replayCtrlsScope.pause = pause;
                _$replayCtrlsScope.resume = resume;
            }
            _$replayCtrlsScope.exit = _onEnd;
            _$replayCtrlsScope.isPaused = isPaused;

            _$replayCtrls = $(getReplayControlsDiv('pause="pause" resume="resume" '
            + 'exit="exit" is-paused="isPaused"'));

            var $body = $('body');
            $body.append(_$replayCtrls);
            angularUtil.getCompiledElement(_$replayCtrls, _$replayCtrlsScope);

            safeApply(_$replayCtrlsScope);
        }

        function navListener(newPath, oldPath) {
        // I (Jordie) have observed newPath="<domain>/#/answer/" oldPath="<domain>/#/answer"
        // should navAlertService refrain from notifying on these route changes?
            if (_pastURLs.any(newPath)) {
                pause();
                hideReplayControls();
                return {
                    title: strings.replayAnswer.EXIT_WARNING_TITLE,
                    message: strings.replayAnswer.EXIT_WARNING_MESSAGE,
                    blockEvents: true,
                    cancelCbOnClose: true,
                    confirmBtnLabel: strings.replayAnswer.EXIT_WARNING_CONFIRM,
                    cancelBtnLabel: strings.replayAnswer.EXIT_WARNING_CANCEL,
                    onCancel: function() {
                        showReplayControls();
                        resume();
                    },
                    onConfirm: function() {
                        _onEnd();
                        return true;
                    }
                };
            } else {
                _pastURLs.push(oldPath);
            }
        }

        function start(onEnd, pausable) {
            _pausable = true;
            if (angular.isDefined(pausable)) {
                _pausable = pausable;
            }
            _killed = false;
            _paused = false;
            _pauseDeferred = $q.defer();
            _pastURLs = [];
            _navAlertDeregisterer = navAlertService.registerListener(navListener);

            _onEnd = function() {
                _navAlertDeregisterer();
                kill();
                hideReplayControls();
                if (onEnd) {
                    onEnd();
                }
            };
            uiControls.onFail(_onEnd);
            showReplayControls();
        }

        function stop() {
            _onEnd();
        }

        function doReplay(replayFn, onEnd, pausable, delay) {
            var deferred = $q.defer();

            start(onEnd, pausable);

            $timeout(function() {
                try {
                    replayFn()
                    .then(
                    function() {
                        $timeout(function() {
                            stop();
                            deferred.resolve();
                        }, FINAL_PAUSE_LENGTH);
                    },
                    function() {
                        stop();
                        deferred.reject();
                    }
                );
                } catch (err) {
                    stop();
                    throw err;
                }
            }, delay || 0);

            return deferred.promise;
        }

        return {
        // Functions
            doReplay: doReplay,
            checkIfPaused: checkIfPaused,
            showReplayControls: showReplayControls,
            hideReplayControls: hideReplayControls
        };

    }]);
