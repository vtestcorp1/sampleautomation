/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Slider directive implementation. It is functionally defined as follows:
 *               - It takes a pair of boundary values that defines its end-points.
 *               - It should do a 2-way data binding with low/high-value model object.
 *               - It should provide user with 2 handle bars, one for each of low and high value in the model.
 *               - It should not allow user to cross the boundary values.
 *               - It should not allow user to drag the low value handle bar past the high value bar.
 *               - It should disable the slider on invalid inputs.
 *               - It should disable the slider when explicitly disabled.
 */

'use strict';

// TODO(vibhor): Move the widgets into their own module
blink.app.controller('SliderController', ['$scope',
    'events',
    'safeApply',
    function ($scope,
          events,
          safeApply) {
        angular.extend($scope, {
        /**
         * The left coordinate of the slider bar.
         *
         * @type {number}
         */
            pixelLeft: 0,

        /**
         * The right coordinate of the slider bar.
         *
         *  @type {number}
         */
            pixelRight: 0,

        /**
         * Pixel position of the low handle bar.
         *
         * @type {number}
         */
            pixelLowHandle: 0,

        /**
         * Pixel position of the high handle bar.
         *
         * @type {number}
         */
            pixelHighHandle: 0
        });

        $scope.$watch('isDisabled()', function () {
            if ($scope.setSliderDisabled) {
                $scope.setSliderDisabled($scope.isDisabled());
            }
        });

        function isScopeValid() {
            var values = $scope.values;

            var min = $scope.getMin(),
                max = $scope.getMax();
            if (isNaN(min) || isNaN(max)) {
                return false;
            }

            if (min >= max || !values) {
                return false;
            }

        // Assert the presence of required scope properties.
            if (!angular.isFunction($scope.getSliderPixelWidth) || !$scope.getSliderPixelWidth() ||
            isNaN($scope.pixelLeft)) {
                return false;
            }

            if ($scope.isLowBarFixed()) {
                return !isNaN(values.high);
            }

            if ($scope.isHighBarFixed()) {
                return !isNaN(values.low);
            }

            return true;
        }

        function updateHandleCoordinates() {
            var values = $scope.values,
                width = $scope.getSliderPixelWidth(),
                range = $scope.getMax() - $scope.getMin();

        // Cap the handle values;
            var low = Math.min($scope.getMax(), Math.max(values.low, $scope.getMin())),
                high = Math.max($scope.getMin(), Math.min(values.high, $scope.getMax()));

            if ($scope.isLowBarFixed()) {
                low = $scope.getMin();
            }
            if ($scope.isHighBarFixed()) {
                high = $scope.getMax();
            }

            $scope.pixelLowHandle = $scope.pixelLeft + width * (low - $scope.getMin()) / range;
            $scope.pixelHighHandle = $scope.pixelLeft + width * (high - $scope.getMin()) / range;
            $scope.updateSlider();
        }

        $scope.$watch('values', function () {
            if ($scope.sliderInvalid) {
                return;
            }
            if (!isScopeValid() && $scope.setSliderDisabled) {
                $scope.setSliderDisabled(true);
                return;
            }

            if (!$scope.isDisabled() && $scope.setSliderDisabled) {
                $scope.setSliderDisabled(false);
            }

            updateHandleCoordinates();
        }, true);

        $scope.$watch('isLowBarFixed()', function () {
            if ($scope.sliderInvalid) {
                return;
            }
            if (angular.isDefined($scope.values)) {
                if ($scope.isLowBarFixed() || isNaN($scope.values.low)) {
                    $scope.values.low = $scope.getMin();
                }
            }
            updateHandleCoordinates();
        });

        $scope.$watch('isHighBarFixed()', function () {
            if ($scope.sliderInvalid) {
                return;
            }
            if ($scope.isHighBarFixed() && angular.isDefined($scope.values)) {
                $scope.values.high = $scope.getMax();
            }
        });

        $scope.$watch('getSliderPixelWidth()', function () {
            if ($scope.sliderInvalid) {
                return;
            }
            if (!$scope.getSliderPixelWidth()) {
                return;
            }
            updateHandleCoordinates();
        });

        $scope.$on(events.WIDGET_SLIDER_HANDLE_MOVED_U, function ($ev, type, pixelValue) {
            if (!$scope.values || !$scope.values.hasOwnProperty(type) || isNaN($scope.pixelLeft) || isNaN(pixelValue)) {
                return;
            }

            var sliderPixelWidth = $scope.getSliderPixelWidth();
            if (!sliderPixelWidth) {
                return;
            }

            var MAX_DECIMAL_PRECISION = 20,
                pixelDifference = (pixelValue - $scope.pixelLeft),
                sliderRange = ($scope.getMax() - $scope.getMin()),
                value = $scope.getMin() + (sliderRange * pixelDifference / sliderPixelWidth),
                valueDeltaPerSliderPixel = Math.abs(sliderRange/sliderPixelWidth),
                decimalPrecision = -Math.floor(Math.log(valueDeltaPerSliderPixel)/Math.log(10)) + 1;

        //the minimum movement of the slider can be assumed to be 1px. if the range of values is so big that
        //1px movement of the slider translates to a "big" number, we support only integer value jumps using slider
        //we still, however, support fractional changes if the range is "small" (< 1)
            if (!$scope.getIsDouble() || decimalPrecision <= 1) {
                value = Math.floor(value);
            } else {
            //for very small slider range the decimal precision can grow too big, toFixed allows only up to
            //MAX_DECIMAL_PRECISION
            //Note that this will not be a problem in practice as the slider will be disabled before the difference
            //becomes small enough to trigger the problem
                decimalPrecision = Math.min(MAX_DECIMAL_PRECISION, decimalPrecision);
                value = (value).toFixed(decimalPrecision);
            }

            $scope.values[type] = value;

        // Note that this is an apply rather than a local scope digest because the slider widget binds to an ngModel
        // at parent scope level. Given that the slider is an isolated scope widget, it has to perform a global digest
        // cycle to let all the users of the model object update their corresponding view states.
            safeApply($scope);
        });

    }]);

blink.app.factory('SliderHandlePositionTracker', function () {
    function SliderHandlePositionTracker(params) {
        this._dragStartPageX = params.dragStartPageX;
        this._startPos = params.startPos;
        this._leftBoundary = params.leftBoundary;
        this._rightBoundary = params.rightBoundary;
    }

    SliderHandlePositionTracker.prototype.getNewPosition = function (pageX) {
        // Find the new position of the handle bar.
        var newPos = this._startPos + pageX - this._dragStartPageX;
        // Check the boundary values and don't let handle bar escape those.
        if (newPos < this._leftBoundary) {
            newPos = this._leftBoundary;
        }
        if (newPos > this._rightBoundary) {
            newPos = this._rightBoundary;
        }

        return newPos;
    };

    return SliderHandlePositionTracker;
});

blink.app.directive('blinkSlider', ['Logger',
    'safeApply',
    function (Logger,
              safeApply) {
        function linker(scope, $el, attrs) {
            var _logger = Logger.create('blink-slider');

            $el.on('selectstart', false);
            var _range = scope.getMax() - scope.getMin();

            if (isNaN(scope.getMin()) || isNaN(scope.getMax()) || _range <= 0) {
                _logger.warn('Invalid slider configuration');
                scope.sliderInvalid = true;
                return;
            }

            var _$loHandle = $($el.children()[0]),
                _$hiHandle = $($el.children()[1]),
                _$selectionBar = $($el.children()[2]);

            scope.updateSlider = function () {
                _$loHandle.offset({left: scope.pixelLowHandle});
                _$hiHandle.offset({left: scope.pixelHighHandle});
                _$selectionBar.width(scope.pixelHighHandle - scope.pixelLowHandle);
                _$selectionBar.offset({left: scope.pixelLowHandle});
            };

            scope.setSliderDisabled = function (disable) {
                $el.toggleClass('disabled', !!disable);
            };

            var _width;
            scope.getSliderPixelWidth = function () {
                return _width;
            };

            function setSliderBoundaries() {
                _width = $el.width();
            // Take out 1px for the border of the slider bar.
                scope.pixelLeft = $el.offset().left - 1;
                scope.pixelRight = $el.offset().left + _width;
            }
            $(window).resize(function () {
                setSliderBoundaries();
                safeApply(scope);
            });
            setSliderBoundaries();
        }

        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                getMin: '&min',
                getMax: '&max',
                getIsDouble: '&isDouble',
                getLowHandleTooltipText: '&lowTooltipText',
                getHighHandleTooltipText: '&highTooltipText',
                isDisabled: '&disabled',
                isLowBarFixed: '&lowBarFixed',  // Set to true if the lower end bar (left bar) of slider is to be fixed.
                isHighBarFixed: '&highBarFixed', // Set to true if the higher end bar of slider is to be fixed.
                shouldHideSelectionBar: '&hideSelectionBar',
                values: '=ngModel'
            },
            templateUrl: 'src/common/widgets/slider/slider.html',
            link: linker,
            controller: 'SliderController'
        };
    }]);

// The handle bar implementation for the slider.
blink.app.directive('blinkSliderHandle', ['events', 'SliderHandlePositionTracker',
    function (events, SliderHandlePositionTracker) {
        function linker(scope, $handle) {
            $handle = $($handle);

            function setHandleFixed(fixed) {
                $handle.toggleClass('fixed-handle', fixed);
            }

            scope.$watch('isFixed()', function () {
                if (scope.isFixed()) {
                    disableDragging();
                } else {
                    enableDragging();
                }
            });

            function enableDragging() {
                setHandleFixed(false);
                $handle.on('mousedown.sliderHandle', function (ev) {
                // Record the initial state on mousedown.
                    var handleTracker = new SliderHandlePositionTracker({
                        dragStartPageX: ev.pageX,
                        startPos: $handle.offset().left,
                        leftBoundary: scope.getLeftBoundary(),
                        rightBoundary: scope.getRightBoundary()
                    });

                // Disable text selection and show the unidirectional dragging cursor.
                    $handle.parent().addClass('slider-handle-dragging');
                    $handle.on('selectstart', false);
                    $(window).on('mousemove.sliderHandle', function (ev) {
                    // Find the new position of the handle bar.
                        var newPos = handleTracker.getNewPosition(ev.pageX);
                        $handle.offset({left: newPos});
                    // Notify the parent slider bar that this handle bar moved.
                        scope.$emit(events.WIDGET_SLIDER_HANDLE_MOVED_U, scope.type, newPos);
                    });
                    $(window).on('mouseup.sliderHandle', function () {
                    // On a mouse up, reset the state to what it was before the dragging.
                        $(window).off('mousemove.sliderHandle');
                        $(document.body).removeClass('slider-handle-dragging');
                    });
                });
            }

            function disableDragging() {
                setHandleFixed(true);
                $handle.off('mousedown.sliderHandle');
                $(window).off('mousemove.sliderHandle');
                $(window).off('mouseup.sliderHandle');
            }
        }

        return {
            restrict: 'E',
            scope: {
                getLeftBoundary: '&left',
                getRightBoundary: '&right',
                type: '@',
                isFixed: '&fixed'
            },
            link: linker
        };
    }]);
