/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit tests for slider controller
 */

'use strict';

describe('Slider controller', function() {
    var $scope = null,
        sliderCtrl = null,
        eventsUtil,

        SLIDER_WIDTH_PX = 124,
        SLIDER_LEFT_PX = 0;

    beforeEach(module('blink.app'));

    beforeEach(inject(function ($rootScope, $controller, events) {
        eventsUtil = events;

        $scope = $rootScope.$new();

        // Set valid values for min/max so that most tests can proceed without running into isNaN check.
        $scope._min = 0;
        $scope._max = 300;
        $scope.pixelLeft = SLIDER_LEFT_PX;
        // Expects following model properties
        angular.extend($scope, {
            values: {
                low: 0,
                high: 300
            },
            getMin: function () {
                return $scope._min;
            },
            getMax: function () {
                return $scope._max;
            },
            getIsDouble: function() {
                return false;
            },
            isDisabled: function () {
                return $scope._disabled;
            },
            isLowBarFixed: function () {
                return $scope._lowFixed;
            },
            isHighBarFixed: function () {
                return $scope._highFixed;
            },
            setSliderDisabled: function (disabled) {
                $scope._sliderDisabled = disabled;
            },
            getSliderPixelWidth: function () {
                return SLIDER_WIDTH_PX;
            }
        });

        sliderCtrl = $controller('SliderController', {
            $scope: $scope,
            events: events
        });
    }));

    it('should trigger isDisabled watch', function () {
        $scope._disabled = true;
        $scope.$apply();
        expect($scope._sliderDisabled).toEqual(true);
    });

    it('should disable slider for missing model values', function () {
        // Fix the low bar. Now without a high value, the slider is invalid.
        $scope._lowFixed = true;
        $scope.$apply();
        $scope.values = {
            low: 0
        };
        $scope.$apply();
        expect($scope._sliderDisabled).toEqual(true);

        // Only define high now and fix the low bar.
        $scope._lowFixed = false;
        $scope._highFixed = true;
        $scope.$apply();
        $scope.values = {
            high: 0
        };
        $scope.$apply();
        expect($scope._sliderDisabled).toEqual(true);
    });

    it('should mark scope invalid for invalid min-max values', function () {
        $scope._min = 'abc';
        $scope.values = {
            low: 0,
            high: 300
        };
        $scope.$apply();
        expect($scope._sliderDisabled).toEqual(true);

        $scope._min = 0;
        $scope._max = 'abc';
        $scope.values = {
            low: 0,
            high: 100
        };
        $scope.$apply();
        expect($scope._sliderDisabled).toEqual(true);
    });

    it('should set scope invalid for missing slider width accessor', function () {
        $scope.getSliderPixelWidth = null;
        $scope.values = {
            low: 0,
            high: 300
        };
        $scope.$apply();
        expect($scope._sliderDisabled).toEqual(true);

        $scope.getSliderPixelWidth = function () {
            return 0;
        };
        $scope.values = {
            low: 0,
            high: 200
        };
        $scope.$apply();
        expect($scope._sliderDisabled).toEqual(true);
    });

    it('should set scope invalid for missing slider left position', function () {
        $scope.pixelLeft = 'abc';
        $scope.values = {
            low: 0,
            high: 300
        };
        $scope.$apply();
        expect($scope._sliderDisabled).toEqual(true);
    });

    it('should set bar positions for valid scope', function () {
        $scope.values = {
            low: 0,
            high: 300
        };
        $scope._min = 0;
        $scope._max = 300;
        $scope.updateSlider = angular.noop;
        $scope.$apply();
        expect($scope.pixelLowHandle).toEqual(0);
        expect($scope.pixelHighHandle).toEqual(SLIDER_LEFT_PX + SLIDER_WIDTH_PX);

        $scope.values = {
            low: 10,
            high: 200
        };
        $scope.$apply();
        expect($scope.pixelLowHandle).toEqual(SLIDER_LEFT_PX + SLIDER_WIDTH_PX * 1 / 30);
        expect($scope.pixelHighHandle).toEqual(SLIDER_LEFT_PX + SLIDER_WIDTH_PX * 2 / 3);

        $scope.values = {
            low: 100,
            high: 100
        };
        $scope.$apply();
        expect($scope.pixelLowHandle).toEqual(SLIDER_LEFT_PX + SLIDER_WIDTH_PX * 1 / 3);
        expect($scope.pixelHighHandle).toEqual(SLIDER_LEFT_PX + SLIDER_WIDTH_PX * 1 / 3);
    });

    it('should set bar positions for non-zero min values', function () {
        $scope.values = {
            low: 0,
            high: 300
        };
        $scope._min = 10;
        $scope._max = 300;
        $scope.updateSlider = angular.noop;
        $scope.$apply();
        expect($scope.pixelLowHandle).toEqual(0);
        expect($scope.pixelHighHandle).toEqual(SLIDER_LEFT_PX + SLIDER_WIDTH_PX);
    });

    it('should trigger slider handle move event callback but no-op', function () {
        $scope.values = null;
        $scope.$emit(eventsUtil.WIDGET_SLIDER_HANDLE_MOVED_U, 'low', 0);
        expect($scope.values).toBeFalsy();
        expect($scope.pixelLowHandle).toBeFalsy();

        $scope.values = {};
        $scope.$emit(eventsUtil.WIDGET_SLIDER_HANDLE_MOVED_U, 'low', 0);
        expect($scope.values.low).toBeFalsy();
        expect($scope.pixelLowHandle).toBeFalsy();

        $scope.values = {
            low: 0,
            high: 300
        };
        $scope.pixelLeft = 'abc';
        $scope.$emit(eventsUtil.WIDGET_SLIDER_HANDLE_MOVED_U, 'low', 0);
        expect($scope.values.low).toBeFalsy();
        expect($scope.pixelLowHandle).toBeFalsy();

        $scope.pixelLeft = SLIDER_LEFT_PX;
        $scope.$emit(eventsUtil.WIDGET_SLIDER_HANDLE_MOVED_U, 'low');
        expect($scope.values.low).toBeFalsy();
        expect($scope.pixelLowHandle).toBeFalsy();

        $scope.getSliderPixelWidth = angular.noop;
        $scope.$emit(eventsUtil.WIDGET_SLIDER_HANDLE_MOVED_U, 'low');
        expect($scope.values.low).toBeFalsy();
        expect($scope.pixelLowHandle).toBeFalsy();
    });

    it('should trigger slider handle move event handler and set model values', function () {
        var lowHandlePos = SLIDER_LEFT_PX + SLIDER_WIDTH_PX / 2,
            highHandlePos = SLIDER_LEFT_PX + SLIDER_WIDTH_PX * 2 / 3;
        $scope.$emit(eventsUtil.WIDGET_SLIDER_HANDLE_MOVED_U, 'low', lowHandlePos);
        expect($scope.values.low).toEqual(150);
        expect($scope.pixelLowHandle).toEqual(lowHandlePos);

        $scope.$emit(eventsUtil.WIDGET_SLIDER_HANDLE_MOVED_U, 'high', highHandlePos);
        expect($scope.values.high).toEqual(200);
        expect($scope.pixelHighHandle).toEqual(highHandlePos);
    });

    function isInteger(n) {
        return n % 1 === 0;
    }

    it('should allow only integer changes if the range is too big', function () {
        $scope.values.low = 151.5487;
        $scope.$apply();
        $scope.$emit(eventsUtil.WIDGET_SLIDER_HANDLE_MOVED_U, 'low', $scope.pixelLowHandle + 1);
        expect(isInteger($scope.values.low)).toEqual(true);
        $scope.$emit(eventsUtil.WIDGET_SLIDER_HANDLE_MOVED_U, 'low', $scope.pixelLowHandle - 1);
        expect(isInteger($scope.values.low)).toEqual(true);

        $scope.values.high = 161.5487;
        $scope.$apply();
        $scope.$emit(eventsUtil.WIDGET_SLIDER_HANDLE_MOVED_U, 'high', $scope.pixelHighHandle + 1);
        expect(isInteger($scope.values.high)).toEqual(true);
        $scope.$emit(eventsUtil.WIDGET_SLIDER_HANDLE_MOVED_U, 'high', $scope.pixelHighHandle - 1);
        expect(isInteger($scope.values.high)).toEqual(true);

    });

    function testNonIntegralValue(isDoubleColumn, isRangeBig, shouldExpectNonIntegralValue) {
        angular.extend($scope, {
            getSliderPixelWidth: function () {
                return isRangeBig ? 20 : 1000;
            },
            getIsDouble: function() {
                return isDoubleColumn;
            }
        });

        $scope.values.low = 151.5487;
        $scope.$apply();

        $scope.$emit(eventsUtil.WIDGET_SLIDER_HANDLE_MOVED_U, 'low', $scope.pixelLowHandle);
        expect(isInteger($scope.values.low)).toEqual(!shouldExpectNonIntegralValue);

        $scope.values.high = 161.5487;
        $scope.$apply();
        $scope.$emit(eventsUtil.WIDGET_SLIDER_HANDLE_MOVED_U, 'high', $scope.pixelHighHandle);
        expect(isInteger($scope.values.high)).toEqual(!shouldExpectNonIntegralValue);
    }

    it('should allow only integer values if the column is of type integer', function () {
        testNonIntegralValue(false, true, false);
        testNonIntegralValue(false, false, false);
    });
    it('should allow double values if the range is small and column is of type double', function () {
        testNonIntegralValue(true, false, true);
    });
    it('should allow only integer values if the range is too big', function () {
        testNonIntegralValue(true, true, false);
    });
});

describe('SliderHandlePositionTracker', function () {
    var handleTracker,
        SliderHandlePositionTracker;

    beforeEach(module('blink.app'));
    beforeEach(inject(function ($injector) {
        SliderHandlePositionTracker = $injector.get('SliderHandlePositionTracker');
    }));

    it('should return new handle position', function () {
        handleTracker = new SliderHandlePositionTracker({
            dragStartPageX: 0,
            startPos: 0,
            leftBoundary: 0,
            rightBoundary: 300
        });
        expect(handleTracker.getNewPosition(10)).toEqual(10);
        expect(handleTracker.getNewPosition(0)).toEqual(0);
        expect(handleTracker.getNewPosition(-10)).toEqual(0);
        expect(handleTracker.getNewPosition(300)).toEqual(300);
        expect(handleTracker.getNewPosition(400)).toEqual(300);

        handleTracker = new SliderHandlePositionTracker({
            dragStartPageX: 0,
            startPos: 200,
            leftBoundary: 400,
            rightBoundary: 1000
        });
        expect(handleTracker.getNewPosition(10)).toEqual(400);
        expect(handleTracker.getNewPosition(0)).toEqual(400);
        expect(handleTracker.getNewPosition(-10)).toEqual(400);
        expect(handleTracker.getNewPosition(300)).toEqual(500);
        expect(handleTracker.getNewPosition(900)).toEqual(1000);
    });

});
