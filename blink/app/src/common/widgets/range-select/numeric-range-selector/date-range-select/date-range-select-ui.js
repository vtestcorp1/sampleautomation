/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com),
 * Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview View for date range select
 */

'use strict';

blink.app.controller('NGDateRangeSelectController', ['$scope',
    'DateRangeSelectController',
    'Logger',
    function ($scope,
          DateRangeSelectController,
          Logger) {
        var _logger = Logger.create('date-range-select-ui');
        if (!$scope.ctrl) {
            _logger.error('No controller passed in');
        }
        $.extend(true, $scope, $scope.ctrl);
    }]);

blink.app.directive('blinkDateRangeSelect', ['$window',
    'Logger',
    function ($window,
              Logger) {
        var _logger = Logger.create('date-range-select-ui');

        function linker (scope, $el) {
            $el.find('input').each(function (idx) {
                var $input = $(this);

            // TODO(Jasmeet): Create a directive for onWindow resize.
                angular.element($window).on('resize.dateFilter', function () {
                    $input.datepicker('hide');
                });

            // TODO(Jasmeet): Create a datepicker input which takes care of this.
                $input.on('click', function() {
                    if (scope.isReadOnly) {
                        return;
                    }

                    var dateEpoch = idx === 0 ? scope.firstOperand : scope.secondOperand;
                    if (dateEpoch !== null) {
                        $input.datepicker('update');
                        $input.trigger('changeDate');
                    }
                });
            });

            scope.$on('$destroy', function () {
                angular.element($window).off('resize.dateFilter');
            });
        }

        return {
            restrict: 'E',
            link: linker,
            scope: {
                ctrl: '='
            },
            templateUrl: 'src/common/widgets/range-select/numeric-range-selector/date-range-select/date-range-select.html',
            controller: 'NGDateRangeSelectController'
        };
    }]);
