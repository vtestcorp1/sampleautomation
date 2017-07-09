/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview View for Loading Indicator
 */

'use strict';

blink.app.directive('blinkLoadingIndicatorOverlay', ['$timeout', 'env', function ($timeout, env) {

    var timer = null;

    function linker(scope, $indicator, attrs) {
        $indicator.on('selectstart', false);
    }

    return {
        restrict: 'A',
        replace: true,
        scope: {
            loadingText: '=',
            transparent: '='
        },
        link: linker,
        templateUrl: 'src/common/loading-indicator/loading-indicator-overlay.html'
    };

}]);

blink.app.directive('blinkLoadingIndicator', [function () {

    function linker(scope, $indicator) {
        $indicator.on('selectstart', false);

        scope.$on('$destroy', function () {
            $indicator.remove();
            $indicator = null;
        });
    }

    return {
        restrict: 'AE',
        replace: true,
        scope: {
            loadingText: '='
        },
        link: linker,
        templateUrl: 'src/common/loading-indicator/loading-indicator.html'
    };
}]);

blink.app.factory('loadingIndicator', ['$rootScope', '$timeout', 'Logger', 'env', 'angularUtil',
    function ($rootScope, $timeout, Logger, env, angularUtil) {
        var _logger = Logger.create('loading-indicator-service');

        var me = {};

        var _timer;
        var _$indicator = $('<div blink-loading-indicator-overlay loading-text="loadingText"></div>');
        var _indicatorScope = $rootScope.$new();

        var indicatorCounter = 0;

        angular.extend(_indicatorScope, {
            loadingText: 'Computing'
        });
        $('body').append(_$indicator);
        angularUtil.getCompiledElement(_$indicator, _indicatorScope);

        var _oldExternalCssClasses = [];
    /**
     *
     * @param {Object} params
     * @param {Object|string} params.anchorElementOrSelector
     * @param {boolean=} params.showInstantly
     * @param {string=} params.loadingText
     * @param {Array=} params.additionalStyleClasses
     */
        var indicatorDisabled = false;

        me.enableLoadingIndicator = function() {
            indicatorDisabled = false;
        };

        me.disableLoadingIndicator = function() {
            indicatorDisabled = true;
        };

        me.show = function (params) {
            if(indicatorDisabled){
                return;
            }

            indicatorCounter++;
            if (indicatorCounter != 1) {
                return;
            }

            params = params || {};
            _indicatorScope.loadingText = params.loadingText || 'Thinking';

            var anchorElement = params.anchorElementOrSelector || '.bk-page-app-canvas';
            if (typeof anchorElement == 'string') {
                anchorElement = $(anchorElement);
            }

        // Note that if the anchor element provided by the caller is going under animation, it is safer to user the
        // parent canvas to anchor the loader against. Otherwise, the indicator can appear to be on top of one of
        // the intermediate state of the anchor element.
            if (anchorElement.data('isAnimating')) {
                anchorElement = $('.bk-page-app-canvas');
            }

            if (!_$indicator.length || !anchorElement.length) {
                return;
            }

            _$indicator.css(anchorElement.offset());
            _$indicator.height(anchorElement.height());
            _$indicator.width(anchorElement.width());

            _oldExternalCssClasses.each(function (className) {
                _$indicator.removeClass(className);
            });

            if (params.additionalStyleClasses) {
                params.additionalStyleClasses.each(function (className) {
                    _$indicator.addClass(className);
                });

                _oldExternalCssClasses = params.additionalStyleClasses;
            }

            if (params.showInstantly) {
                _$indicator.show();
                return;
            }

            if (_timer) {
                return;
            }
            _timer = $timeout(function () {
                if (indicatorCounter > 0) {
                    _$indicator.show();
                }
            }, env.loadingIndicatorDelay);
        };

    /**
     *
     * @param {string} anchorElementOrSelector
     * @param {Object} additionalParams (See params above in me.show)
     */
        me.reAnchorAndShow = function (anchorElementOrSelector, additionalParams) {
            me.show(angular.extend(additionalParams, {
                anchorElementOrSelector: anchorElementOrSelector
            }));
        };

        me.hide = function () {
            if (indicatorDisabled) {
                return;
            }

            if (indicatorCounter < 1) {
                return;
            }

            indicatorCounter--;

            if (_timer) {
                $timeout.cancel(_timer);
                _timer = null;
            }

            if (_$indicator) {
                _$indicator.hide();
            }
        };

        me.clear = function () {
            if (_$indicator) {
                _$indicator.hide();
            }
            indicatorCounter = 0;
        };

        return me;
    }]);
