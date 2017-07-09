/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Controller for Home Page Sage
 */

'use strict';

blink.app.controller('HomeSageController', ['$scope',
    'blinkConstants',
    'strings',
    'Logger',
    'navService',
    'sessionService',
    function ($scope,
          blinkConstants,
          strings,
          Logger,
          navService,
          sessionService) {
        var _logger = Logger.create('home-sage-controller');

        $scope.sagePlaceHolderText = strings.SEARCH_YOUR_DATA;

        $scope.onSageBarClick = function () {
            navService.goToAnswer();
        };

        $scope.hasDataSourcesInUserPref = function () {
            return sessionService.getSageDataSource() && sessionService.getSageDataSource().length;
        };
    }]);
