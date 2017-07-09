/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jordie Hannel (jordie@thoughtspot.com)
 *
 * @fileoverview View for Answer Replay control panel Widget
 */

'use strict';

blink.app.directive('blinkReplayControls', ['Logger',
    'util',
    function (Logger,
    util) {

        var logger = Logger.create('replay-controls');

        function linker(scope, $el, attr) {

            function blockEventsImmediate(e) {
                e.stopImmediatePropagation();
                return false;
            }

            function keydownHandler(evt) {
                if (evt.which === $.ui.keyCode.SPACE) {
                    if (scope.isPaused()) {
                        scope.resume();
                    } else {
                        scope.pause();
                    }
                } else if (evt.which === $.ui.keyCode.ESCAPE) {
                    scope.exit();
                }

                return false;
            }

            function isSyntheticEvent(e) {
                return !((e.originalEvent && e.originalEvent.isTrusted) || e.isTrusted);
            }

            function clickHandler(e) {
                e.stopImmediatePropagation();
                if (blink.app.isIE || isSyntheticEvent(e)) {
                    return false;
                }
                if (scope.isPaused()) {
                    scope.resume();
                } else {
                    scope.pause();
                }
                return false;
            }

            var EVENTS_TO_BLOCK = 'dblclick contextmenu mouseup mousedown mouseover mouseout mousemove keypress keyup';

            function addListeners() {
                util.addEventListenersUseCapture($el[0], EVENTS_TO_BLOCK, blockEventsImmediate);
                document.addEventListener('click', clickHandler, true);
                $(document).on('keydown.replay', keydownHandler);
                window.addEventListener('blur', blockEventsImmediate, true);
            }

            function removeListeners() {
                util.removeEventListenersUseCapture($el[0], EVENTS_TO_BLOCK, blockEventsImmediate);
                document.removeEventListener('click', clickHandler, true);
                $(document).off('keydown.replay');
                window.removeEventListener('blur', blockEventsImmediate, true);
            }

            addListeners();

            scope.$on('$destroy', function() {
                removeListeners();
            });

            $el.on('$destroy', function() {
                removeListeners();
            });

        }

        return {
            restrict: 'A',
            replace: true,
            scope: {
                pause: '=',
                resume: '=',
                exit: '=',
                isPaused: '='
            },
            link: linker,
            templateUrl: 'src/common/widgets/replay-controls/replay-controls.html'
        };
    }]);
