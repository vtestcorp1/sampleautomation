/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Misc common directives.
 */

'use strict';

/**
 * Directive that allows dynamically applying attributes.
 * For example the following:
 *      <div blink-attr="attributeName:attributeValue">
 * will be converted into:
 *      <div attributeName="attributeValue">
 * This directive supports dynamically changing attributes and values. It is similar to the
 * ng-attr- feature that will be available in the next versions of angular.
 */
blink.app.directive('blinkAttr', function () {
    function getKeyVal(scope, attrs) {
        var keyVal = attrs.blinkAttr ? attrs.blinkAttr.split(':') : [];
        if (keyVal.length != 2) {
            return [];
        }
        return [keyVal[0], scope.$eval(keyVal[1])];
    }

    function updateAttr($el, keyVal) {
        if (keyVal.length === 0) {
            return;
        }
        $el.attr(keyVal[0], keyVal[1]);
    }

    function linker(scope, $el, attrs) {
        scope.$watch(function(){
            return getKeyVal(scope, attrs);
        }, function(keyVal){
            updateAttr($el, keyVal);
        }, true);
    }


    return {
        restrict: 'A',
        link: linker
    };
});

blink.app.directive('blinkPopover', ['util', function (util) {

    function linker(scope, $el, attrs) {
        if (!angular.isDefined(attrs.role)) {
            $el.attr('role', 'button');
        }

        if (!angular.isDefined(attrs.toggle)) {
            $el.attr('data-toggle', 'popover');
        }

        util.executeInNextEventLoop(function () {
            $el.popover();
        });
    }

    return {
        restrict: 'A',
        link: linker
    };
}]);

blink.app.directive('popoverCloseCallbackName', [function() {
    function linker(scope, $el, attrs) {
        var popoverSelector = '.popover.' + attrs.popoverClass;
        scope[attrs.popoverCloseCallbackName] = function () {
            $(popoverSelector).remove();
        };
    }

    return {
        restrict: 'A',
        link: linker
    };
}]);

/**
 * Show a bootstrap tooltip. Supports angular evaluation of tooltip string and dynamic update.
 * Usage example: <div class="bk-viz-btn-icon" blink-tooltip="{{ maximizeBtnLabel }}"></div>
 */
blink.app.directive('blinkTooltip', ['angularUtil', 'env', 'util', 'Logger',
    function (angularUtil, env, util, Logger) {

        var logger = Logger.create('blink-tooltip');

        function alignTooltipPlacement($el, $tooltip) {
        // For now, we only support aligned placement for placement type 'bottom'.
            if ($el.attr('data-placement') !== 'bottom') {
                return;
            }
        // Run this in the next loop so that bootstrap placement can happen.
            setTimeout(function () {
            // Align the tooltip body left with the target element's left.
                $tooltip.css({left: $el.offset().left });
            // Keep the arrow of tooltip to the center of the target element.
                $tooltip.find('.tooltip-arrow').css({left: $el.width()/2});
            }, 0);
        }

        function linker(scope, $el, attrs) {
            attrs.$observe('blinkTooltip', function (tooltip) {
                if (tooltip) {
                    $el.attr('data-original-title', tooltip);
                } else if (!!attrs.blinkTooltipModel) {
                    attrs.$observe('blinkTooltipModel', function(newValue, oldValue){
                        var model = scope.$eval(newValue);
                        if (!Object.isObject(model)) {
                            logger.warn('blink tooltip model must be an object, provided', model);
                            return;
                        }

                        if (!attrs.blinkTooltipTemplateUrl) {
                            logger.warn('blink tooltip model must be accompanied by a template', model);
                            return;
                        }

                        var template = '<div><div ng-include="{1}"></div></div>'.assign(attrs.blinkTooltipTemplateUrl);

                        var tooltipScope = scope.$new();
                        angular.extend(tooltipScope, model);

                        var $tooltip = angularUtil.getCompiledElement(template, tooltipScope);

                        util.executeInNextEventLoop(function(){
                            $el.attr('data-original-title', $tooltip[0].outerHTML);
                        });
                    });
                } else {
                    $el.attr('data-original-title', '');
                }

                if(attrs.blinkChangeableTooltip) {
                    if($el.is(":hover")) {
                        $el.tooltip('fixTitle').tooltip('show');
                    }
                }
            });
            if (!$el.attr('data-placement')) {
                $el.attr('data-placement', 'bottom');
            }

            var hideDelay = env.e2eTest ? '0' : '300';
            var showDelay = '500';
            var dataDelay = '{"show":{1}, "hide":{2}'.assign(showDelay, hideDelay);
            $el.attr('data-delay', dataDelay);

            var additionalClasses = $el.data('additional-classes');
            if (!!additionalClasses) {
                var template = '<div class="tooltip {1}" role="tooltip">' +
                               '<div class="tooltip-arrow"></div>' +
                               '<div class="tooltip-inner"></div>' +
                           '</div>'.assign(additionalClasses);
                $el.data('template', template);
            }

            $el
            .attr('data-container', 'body')
            .tooltip({
                animation: !!$el.data('tip-animate'),   // fixes the hover effect bug (the tooltip disappeared when hovering the button quickly.
                placement: function (tooltip) {
                    if ($el.attr('data-aligned-placement')) {
                        alignTooltipPlacement($el, $(tooltip));
                    }
                    return $el.attr('data-placement');
                }
            });
            $el.on('click.hideJsTooltip remove', function () {
            // We want to remove the tooltip when we click the element where tooltip was being shown
            // 'destroy', 'hide', etc do not remove the dom tooltip element, So we remove this manually
                $('body > .tooltip').remove();
            });

            scope.$on('$destroy', function () {
                $el.tooltip('destroy');
            })
        }

        return {
            restrict: 'A',
            link: linker
        };
    }]);

/**
 * Directive that mirrors the behavior of ng-bind-html-unsafe, but with an added compilation step
 */
blink.app.directive('blinkBindAndCompile', ['angularUtil', function (angularUtil) {
    function linker(scope, $el, attrs) {
        scope.$watch(function() {
            return scope.$eval(attrs.blinkBindAndCompile);
        },
            function(newValue) {
                var $html = $(newValue);
                angularUtil.getCompiledElement($html, scope);
                $el.html($html);
            });
    }

    return {
        restrict: 'A',
        link: linker
    };
}]);

blink.app.directive('blinkManualCompile', [function() {
    function linker (scope, $el) {
        scope.onLinked = scope.onLinked || _.noop;
        scope.onLinked($el);
    }

    return {
        restrict: 'A',
        priority: 1000,
        link: linker
    };
}]);

/**
 * Add the disabled attribute and the bk-disabled class to an element
 *
 * The bk-disabled  calss add some blink-specific styling for
 * a disabled element
 *
 */
blink.app.directive('blinkDisabled',function() {
    function linker(scope, $el, attrs) {
        scope.$watch(attrs.blinkDisabled, function(value) {
            attrs.$set('disabled', value);
            if (!!value) {
                $el.addClass('bk-disabled');
            } else {
                $el.removeClass('bk-disabled');
            }
        });
    }

    return {
        restrict: 'A',
        link: linker
    };
});


/**
 * Execute a scope method when escape key is pressed.
 * The name of the scope method to execute is passed in in the "blink-on-escape" attribute.
 */
blink.app.directive('blinkOnEscape', ['$parse',
    'safeApply',
    function ($parse, safeApply) {
        function linker(scope, $el, attrs) {
            function escapeKeyHandler(evt) {
                if ($el.css('display') == 'none') {
                // If the element is not in the view, we ignore the click
                    return;
                }
                if (evt.which == 27) { // ESC Key
                    safeApply(scope, function () {
                        $parse(attrs.blinkOnEscape)(scope);
                    });
                }
            }
            $(window).on('keyup.escapeHandler', escapeKeyHandler);

            $el.on('$destroy', function () {
                $(window).off('keyup.escapeHandler', escapeKeyHandler);
            });
        }

        return {
            restrict: 'A',
            link: linker
        };
    }]);

/**
 * Execute a scope method when enter key is pressed in an input element.
 * The name of the scope method to execute is passed in in the "blink-on-enter" attribute.
 */
blink.app.directive('blinkOnEnter', ['$parse',
    'safeApply',
    function ($parse, safeApply) {
        function linker(scope, $el, attrs) {
            if (!attrs.blinkOnEnter) {
                return;
            }

            var blinkOnEnter = $parse(attrs.blinkOnEnter);
            function enterKeyHandler(evt) {
                if (evt.which == $.ui.keyCode.ENTER) { // ENTER Key
                    safeApply(scope, function () {
                        blinkOnEnter(scope);
                    });
                }
            }
            $el.on('keyup.enterHandler', enterKeyHandler);

            scope.$on('$destroy', function () {
                $el.off('keyup.enterHandler', enterKeyHandler);
            });
        }

        return {
            restrict: 'A',
            link: linker
        };
    }]);

/**
 * Execute a scope method when tab key is pressed in an input element.
 * The name of the scope method to execute is passed in in the "blink-on-tab" attribute.
 */
blink.app.directive('blinkOnTab', ['$parse',
    'safeApply',
    function ($parse,
          safeApply) {
        function linker(scope, $el, attrs) {
            if (!attrs.blinkOnTab) {
                return;
            }
            var blinkOnTab = $parse(attrs.blinkOnTab);
            $el.on('keydown.tabHandler', function (evt) {
                if (evt.which == $.ui.keyCode.TAB) { // TAB Key
                    evt.preventDefault();
                    safeApply(scope, function () {
                        blinkOnTab(scope);
                    });
                }
            });

            scope.$on('$destroy', function () {
                $el.off('keydown.tabHandler');
            });
        }

        return {
            restrict: 'A',
            link: linker
        };
    }]);

/**
 * Directive that evaluates the expression given when user presses the enter key
 * Usage: ng-enter="runScopeMethod()"
 */
blink.app.directive('ngEnter', ['safeApply',
    function (safeApply) {
        return function (scope, element, attrs) {
            element.bind('keydown', function (event) {
                if (event.which === 13) {
                    safeApply(scope, function () {
                        scope.$eval(attrs.ngEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    }]);

blink.app.directive('blinkOnBlur', ['$parse', 'safeApply', function ($parse, safeApply) {
    function linker(scope, $input, attrs) {
        var callback = $parse(attrs.blinkOnBlur);

        $input.bind('blur', function () {
            safeApply(scope, function () {
                callback(scope);
            });
        });
    }

    return {
        restrict: 'A',
        link: linker
    };
}]);

/**
 * Directive to automatically select the text when the element loads.
 * This should only be used with 'input' element.
 */
blink.app.directive('blinkAutoSelect', ['$timeout', function ($timeout) {
    function linker(scope, $el, attrs) {
        $timeout(function () {
            $el.select();
        }, 0);
    }

    return {
        restrict: 'A',
        link: linker
    };
}]);

/**
 * Directive that can be used to call a callback function when the animation on the element ends.
 */
blink.app.directive('blinkOnAnimationEnd', ['$parse',
    'safeApply',
    function ($parse,
          safeApply) {

        function linker(scope, $el, attrs) {
            if (!attrs.blinkOnAnimationEnd) {
                return;
            }
            var callback = $parse(attrs.blinkOnAnimationEnd);
            $el.data('isAnimating', true);

            $el.on('animationend webkitAnimationEnd oanimationend MSAnimationEnd', function () {
                $el.data('isAnimating', false);
                callback(scope, {$targetElement: $el});
                safeApply(scope);
            });
        }

        return {
            restrict: 'A',
            replace: true,
            link: linker
        };
    }]);

blink.app.directive('onGlobalClick', ['safeApply',
    function (safeApply) {
        function linker(scope, $el, attrs) {
            $(window).on('click.globalDirective', function (evt) {
                safeApply(scope, function () {
                    scope.$eval(attrs.onGlobalClick);
                });
            });

            scope.$on('$destroy', function () {
                $(window).off('click.globalDirective');
            });
        }

        return {
            restrict: 'A',
            link: linker
        };
    }]);

/**
 * Overlay for an element $el. If there is click inside $el, does nothing. If click happens outside $el, calls registered
 * scope method.
 * The name of the scope method to execute is passed in in the "blink-overlay" attribute.
 */
blink.app.directive('blinkOverlay', ['safeApply',
    function (safeApply) {
        function linker(scope, $el, attrs) {
            var ignoredSelectors = [].concat(scope.$eval(attrs.ignoreClickSelector));

            function overlayHandler(evt) {
                if (!$el.is(':visible')) {
                // If the element is not in the view, we ignore the click
                    return;
                }
                var $target = $(evt.target);
                if ($target[0] == $el[0] || $el.has($target).length) {
                // Click is inside $el
                    return;
                }

                if (ignoredSelectors.length) {
                    var isTargetMatchingAnyIgnoredElement = ignoredSelectors.any(function (ignoredSelector) {
                        var $ignoreDoms = $(ignoredSelector);
                    // Return true if the click came from within any of the ignored doms.
                        return Array.prototype.any.call($ignoreDoms, function (ignoreDom) {
                            return $target[0] == ignoreDom || $(ignoreDom).has($target).length;
                        });
                    });

                    if (isTargetMatchingAnyIgnoredElement) {
                        return;
                    }
                }

                safeApply(scope, function () {
                    scope.$eval(attrs.blinkOverlay, { $overlayEvt: evt });
                });
            }

            $(window).on('mousedown.overlayClear', overlayHandler);
            if(!!attrs.blinkOverlayOnResize) {
                $(window).on('resize.overlayClear', overlayHandler);
            }

            scope.$on('$destroy', function () {
                $(window).off('mousedown.overlayClear', overlayHandler);
                $(window).off('resize.overlayClear');
            });

            $el.on('$destroy', function () {
                $(window).off('mousedown.overlayClear', overlayHandler);
                $(window).off('resize.overlayClear');
            });
        }

        return {
            restrict: 'A',
            link: linker
        };
    }]);

blink.app.directive('blinkSelectable', ['$parse', '$timeout', 'Logger', 'safeApply',
    function ($parse, $timeout, Logger, safeApply) {
        var _logger = Logger.create('blink-selectable');

        function linker(scope, $listEl, attrs) {
            var itemDescriptor = scope.$eval(attrs.blinkSelectable),
                onSelectionChange = $parse(attrs.onSelectionChange),
                onCustomDblClick = $parse(attrs.onCustomDblClick);

            function areListsSame(list1, list2) {
                if (list1.length != list2.length) {
                    return false;
                }

                for (var i = 0; i < list1.length; ++i) {
                    if (list1[i] !== list2[i]) {
                        return false;
                    }
                }

                return true;
            }

            var preStopSelectedList, noSelectionChangeCallback = false;

            var doubleClickHelper = {
                firstStartEventTimestamp: 0,
                firstStartEventTarget: null,
                dblClickInProgress: false,

                resetState: function () {
                    this.firstStartEventTimestamp = 0;
                    this.firstStartEventTarget = null;
                    this.dblClickInProgress = false;
                },

                MAX_CONSECUTIVE_MOUSEDOWN_DELAY: 400,

                activeTimer: null,

                addStartEvent: function (startEvent) {
                    var srcElement = startEvent.srcElement ||
                        (startEvent.originalEvent && startEvent.originalEvent.target) ||
                        null,
                        eventTimestamp = (new Date()).getTime();
                    if (!this.isActive() || srcElement !== this.firstStartEventTarget) {
                        _logger.log('Activating double click helper');
                        this.firstStartEventTimestamp = eventTimestamp;
                        this.firstStartEventTarget = srcElement;
                        if (this.activeTimer) {
                        // In case the helper is active and we detected that timer should be reactivated, cancel the
                        // previous timer and start another.
                            $timeout.cancel(this.activeTimer);
                        }
                    // Schedule a timer to reset the helper after certain delay. If user is able to double click
                    // within that window, the target element can be used to notify double click listener.
                    // After that delay, the helper should be reset anyways.
                        this.activeTimer = $timeout(
                        angular.bind(this, this.resetState), this.MAX_CONSECUTIVE_MOUSEDOWN_DELAY, false);
                        return;
                    }

                // If we reach here, this must be a second start event within MAX_CONSECUTIVE_MOUSEDOWN_DELAY interval
                // originating at same source element, we can say that double click is in progress.
                // The next stop event should verify that this bit is still active before notifying listeners about
                // the custom double click event.
                    this.dblClickInProgress = true;
                },

                isActive: function () {
                    return this.firstStartEventTimestamp > 0 && !!this.firstStartEventTarget;
                }
            };

            $listEl.selectable({
                filter: 'li',
                start: function (event, ui) {
                    preStopSelectedList = $('.ui-selected', $listEl);
                    noSelectionChangeCallback = false;

                    doubleClickHelper.addStartEvent(event);
                },
                stop: function (event, ui) {

                // First check if this stop event should contribute to a double click.
                    if (doubleClickHelper.dblClickInProgress && itemDescriptor && itemDescriptor.modelGetter) {
                        _logger.log('double click detected');
                        var $item = $(doubleClickHelper.firstStartEventTarget);
                        doubleClickHelper.resetState();

                        onCustomDblClick(scope, {
                            $model: $item.scope()[itemDescriptor.modelGetter]
                        });
                        return;
                    }

                    var selectedElList = $('.ui-selected', $listEl);

                    if (noSelectionChangeCallback || areListsSame(selectedElList, preStopSelectedList)) {
                        noSelectionChangeCallback = false;
                        return;
                    }

                    var model = $.map(selectedElList, function (selectedEl) {
                        if (!itemDescriptor || !itemDescriptor.modelGetter) {
                            return selectedEl;
                        }

                        return $(selectedEl).scope()[itemDescriptor.modelGetter];
                    });

                    if (onSelectionChange) {
                        onSelectionChange(scope, {
                            $model: model
                        });
                        safeApply(scope);
                    }
                }
            });

            function refreshSelectableWidget() {
                $listEl.selectable('refresh');
            }
            $listEl.bind('blinkSelectable.selectAll', function () {
                refreshSelectableWidget();
                preStopSelectedList = $('.ui-selected', $listEl);
                noSelectionChangeCallback = false;
                $listEl.find('.ui-selectee').addClass('ui-selecting');
                $listEl.selectable('instance')._mouseStop();
            });

            $listEl.bind('blinkSelectable.clearAll', function () {
                refreshSelectableWidget();
                preStopSelectedList = $('.ui-selected', $listEl);
                noSelectionChangeCallback = true;
                $(".ui-selected", $listEl).removeClass('ui-selected').addClass('ui-unselecting');
                $listEl.selectable('instance')._mouseStop();
            });
        }

        return {
            restrict: 'A',
            link: linker
        };
    }]);

blink.app.directive('blinkDraggable', [function () {
    function linker(scope, $el, attrs) {
        var handle = attrs.blinkDraggableHandle;

        var options = {
            containment: 'body',
            scroll: false
        };
        if (!!handle) {
            options.handle = handle;
        }
        $el.draggable(options);
    }

    return {
        restrict: 'A',
        link: linker
    };
}]);

/**
 * Directive to ensure that a given descendant of a scrollable element (the directive
 * host) is always in viewport by scrolling if necessary. The descendant to keep in
 * view is specified as a selector using the value of the directive (can be a dynamic
 * angular expression).
 */
blink.app.directive('scrollIntoView', ['Logger', function (Logger) {
    var DEFAULT_SCROLL_DURATION = 100;

    var _logger = Logger.create('scroll-into-view'),
        $animation = null;

    function linker(scope, $el, attrs) {
        attrs.$observe('scrollIntoView', function(value){
            var $scrollTo = $el.find(value);
            if ($scrollTo.length === 0) {
                _logger.debug("couldn't find any scroll target at selector", value);
                return;
            }

            var top = $scrollTo.position().top,
                scrollTop = $el.scrollTop(),
                scrollToHeight = $scrollTo.outerHeight(),
                elHeight = $el.innerHeight();
            // if the bottom of the target element is already visible inside the viewport of the scrollable
            // there is no need to scroll
            if (top > 0 && top < elHeight) {
                return;
            }

            var pos = top > 0 ? scrollTop + top - elHeight + scrollToHeight : scrollTop + top - 5,
                scrollDuration = parseInt(attrs.scrollDuration, 10);

            if (isNaN(scrollDuration)) {
                scrollDuration = DEFAULT_SCROLL_DURATION;
            }

            if (!!$animation) {
                $animation.stop();
            }

            $animation = $el.animate({
                scrollTop : pos
            }, scrollDuration, function(){
                $animation = null;
            });
        });
    }

    return {
        restrict: 'A',
        link: linker
    };
}]);

/**
 * Directive to ensure that a given element gets the focus when its added to
 * to the DOM
 *
 * We do not use the autofocus attribute as it gives focus only on page load
 *
 */
blink.app.directive('blinkAutoFocus', ['$timeout', function ($timeout) {

    function linker(scope, $el, attrs) {
        if (scope.blinkAutoFocus === false) {
            return;
        }
        $timeout(function(){
            $el.focus();
        }, 0);
    }

    return {
        scope: {
            blinkAutoFocus: '='
        },
        restrict: 'A',
        link: linker
    };
}]);

blink.app.directive('blinkAutoHideView', ['$timeout', function ($timeout) {
    var DEFAULT_AUTO_HIDE_INTERVAL = 2000;

    var timer = null,
        flippingFlag = false;

    function linker(scope, $el, attrs) {
        function show() {
            $el.show();
            $el.css({opacity: 1});
        }

        function hide() {
            // (SCAL-7952): we want to use css animations for hiding but we also
            // want the dom node to be removed from the DOM tree.
            var currentOpacity = $el.css('opacity');
            if (currentOpacity == '0') {
                // 'transitionend' events won't fire if the opacity is already 0
                // we have to explicitly hide in this case
                $el.hide();
            } else {
                $el.css({opacity: 0});
            }
        }

        $el.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend', function () {
            var opacity = $el.css('opacity');
            if (opacity === 0) {
                $el.hide();
            }
        });

        scope.$watch('show', function(newValue, oldValue){
            if (flippingFlag) {
                flippingFlag = false;
                return;
            }

            if (scope.show) {
                show();
                if (timer) {
                    $timeout.cancel(timer);
                }
                var interval = isNaN(scope.autoHideAfter) ? DEFAULT_AUTO_HIDE_INTERVAL : scope.autoHideAfter;
                timer = $timeout(function(){
                    timer = null;
                    hide();
                }, interval);

                flippingFlag = true;
                scope.show = false;
            } else {
                hide();
            }
        });
    }

    return {
        restrict: 'A',
        scope: {
            show: '=',
            autoHideAfter:'='
        },
        link: linker
    };
}]);

/**
 * A directive that automatically inserts line breaks between series of inline elements when
 * it detects a wrapping element.
 *
 * It is assumed that the container is styled such that the elements will wrap around when
 * overflowing horizontally. It is expected that all children of this container are inline
 * and all have 'auto-break-on-wrap' html attribute. It is also assumed that there are no
 * existing <br> element in the series of inline elements.
 *
 * The wrapping of elements is detected as follows:
 * - Force wrapping using 'break-word' word-wrapping.
 * - Any inline element that has height > expected height. Expected height is computed using
 *   height of 'W' text using style derived from auto-break-on-wrap element.
 */
blink.app.directive('autoBreakOnWrap', ['util', function (util) {
    function linker(scope, $el, attrs) {

        function insertBreakLineIfNeeded() {
            if (!$el.is(':visible')) {
                return;
            }

            // First element or an element that already has a line break before it, should be skipped.
            if (!angular.isDefined($el.prev().attr('auto-break-on-wrap')) ||
                $el.prev('br[data-auto-inserted]').length) {
                return;
            }

            var expectedLineHeight = $el.parent().data('expectedLineHeight');
            if (!angular.isDefined(expectedLineHeight)) {
                var $clone = $el.clone();
                $clone.text('W');
                $clone.css('visibility', 'hidden');
                $el.parent().append($clone);
                expectedLineHeight = $clone.height();
                $clone.remove();
                $el.parent().data('expectedLineHeight', expectedLineHeight);
            }

            // If single word, then normal word wrap will actually cause a hidden overflow and fail the height
            // check we do. To work around we force the word-wrapping to break word.
            $el.css('word-wrap', 'break-word');
            var elHeight = $el.height();

            // If the height of the element is as expected, then either:
            // - The element is not wrapping and is in the same line as the rest of the content before it.
            // - Or the element wrapped completely and went into next line.
            if (elHeight === expectedLineHeight) {
                return;
            }

            // Now that we are going to force a line break, we can reset the element's word wrapping.
            $el.css('word-wrap', 'normal');
            $el.before('<br data-auto-inserted/>');
        }

        scope.$watch(function () {
            return scope.$eval(attrs.autoBreakOnWrap);
        }, function (value) {
            if (!value) {
                return;
            }

            insertBreakLineIfNeeded();
        });

        function onWindowResize() {
            $el.prev('br[data-auto-inserted]').remove();
            insertBreakLineIfNeeded();
        }

        $(window).resize(onWindowResize);

        $el.on('$destroy', function () {
            $(window).off('resize', onWindowResize);
            $el.prev('br[data-auto-inserted]').remove();
        });
    }

    return {
        restrict: 'A',
        link: linker
    };
}]);


/**
 * Lazy Hide show for efficient rendering of large DOM subtrees.
 * Behaves like ng-if until first interaction and then becomes ng-show thereafter.
 *
 * shamelessly lifted from:
 * http://developers.lendio.com/blog/combining-ng-if-and-ng-show-for-better-angularjs-performance/
 */
blink.app.directive('ngLazyShow', ['$animate', function ($animate) {

    return {
        multiElement: true,
        transclude: 'element',
        priority: 600,
        terminal: true,
        restrict: 'A',
        link: function ($scope, $element, $attr, $ctrl, $transclude) {
            var loaded;
            $scope.$watch($attr.ngLazyShow, function ngLazyShowWatchAction(value) {
                if (loaded) {
                    $animate[value ? 'removeClass' : 'addClass']($element, 'ng-hide');
                }
                else if (value) {
                    loaded = true;
                    $transclude(function (clone) {
                        clone[clone.length++] = document.createComment(' end ngLazyShow: ' + $attr.ngLazyShow + ' ');
                        $animate.enter(clone, $element.parent(), $element);
                        $element = clone;
                    });
                }
            });
        }
    };
}]);

/**
 * A click handler that handles click events in capture phase. One use of this is
 * for the parent to stop all events from propagating to its descendants.
 */
blink.app.directive('captureClick', ['$parse', 'safeApply', function($parse, safeApply) {
    function clickHandler(scope, callback, $event) {
        safeApply(scope, function() {
            callback(scope, {
                $event: $event
            });
        });
    }

    return {
        restrict: 'A',
        link: function (scope, $el, attrs) {
            var callback = $parse(attrs.captureClick);
            var onClick = angular.bind(null, clickHandler, scope, callback);

            $el.on('$destroy', function(){
                $el[0].removeEventListener('click', onClick);
            });
            $el[0].addEventListener('click', onClick, true);
        }
    };
}]);

blink.app.directive('blinkRequiredField',function() {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        template: '<div><ng-transclude></ng-transclude><span class="bk-asterisk" >*</span></div>'
    };
});

/**
 * A simple directive to listen for `change` event on the host DOM node.
 * This is needed as ng-change does not work for all DOM nodes (e.g file input).
 */
blink.app.directive('blinkOnChange', ['safeApply', function(safeApply){
    return {
        restrict: 'A',
        scope: {
            blinkOnChange: '&'
        },
        link: function (scope, $el) {
            function changeHandler(event){
                safeApply(scope, function () {
                    scope.blinkOnChange({$event : event});
                });
            }

            function clickHandler(event) {
                // Hack (sunny): In case of file selectors if the
                // user selects the same file again we would want
                // to trigger the change handler. This frees up the
                // user of the directive from having to clear the
                // value of the input after it has used up the first
                // change.
                if ($el.is('input[type="file"]')) {
                    $el.val('');
                }
            }

            $el.on('change', changeHandler);
            $el.on('click', clickHandler);
            scope.$on('$destroy', function () {
                $el.off('change', changeHandler);
            });
        }
    };
}]);

/**
 * postRepeat directive when applied to ng-repeat DOM nodes,
 * after last element of ng-repeat directive is rendered -
 * => Calls the postRepeat callback.
 * => (DEPRECATED) Fires LIST_RENDERED_U event.
 */
blink.app.directive('postRepeat', [ '$timeout', 'events',
    function ($timeout, events) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                if (scope.$last) {
                    $timeout(function () {
                        var postRepeatCallback = scope.$eval(attrs.postRepeat);
                        if (_.isFunction(postRepeatCallback)) {
                            postRepeatCallback();
                        }
                        // TODO (Rahul): Remove this event after cleaning up
                        // its usages.
                        scope.$emit(events.LIST_RENDERED_U);
                    });
                }
            }
        };
    }]);

/**
 * A directive to workaround chrome scroll issue SCAL-15274.
 * Warning (sunny): This is intended to only be a stop gap
 * solution until either we figure out a fix/workaround for the
 * underlying chrome issue or chrome fixes the issue. Do NOT
 * use it in any other case unless it is the same issue or
 * there is a very good reason to.
 */
blink.app.directive('blinkScroll', [function() {
    function linker(scope, $el, attrs) {

        if (blink.app.isChrome) {
            $el.on('wheel', function(event){
                event.preventDefault();
                $el[0].scrollTop += event.originalEvent.deltaY;
            });
        }
    }

    return {
        restrict: 'A',
        link: linker
    };
}]);


/**
 * A redefinition of angular ng-* events with $digest instead of $apply.
 *
 * AngularJs provides varius ng-* event directives and let callers bind any callback (including non-angular code) as handler.
 * As a result, they wrap the callback inside $apply which results in root scope redigestion. Due to this, we have an
 * unfortunate side effect of ng-repeats being re-evaluated on every mouse event.
 *
 * The following work around is suggested in:
 * http://stackoverflow.com/questions/14612871/how-can-i-make-a-click-event-inside-ng-repeat-only-re-render-the-affected-item
 */
(function () {

    var PREFIX_REGEXP = /^(x[\:\-_]|data[\:\-_])/i;
    function directiveNormalize(name) {
        return $.camelCase(name.replace(PREFIX_REGEXP, ''));
    }

    var bkNgEventDirectives = {};
    angular.forEach(
        'click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave'.split(' '),
        function(name) {
            var directiveName = directiveNormalize('bk-ng-' + name);
            bkNgEventDirectives[directiveName] = ['$parse', function($parse) {
                return function(scope, element, attr) {
                    var fn = $parse(attr[directiveName]);
                    element.bind(name.toLowerCase(), function(event) {
                        fn(scope, {$event:event});
                        scope.$digest();
                    });
                };
            }];
        });
    blink.app.directive(bkNgEventDirectives);
})();
