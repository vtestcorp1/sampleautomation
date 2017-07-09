/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Maxim Leonovich
 *
 * @fileoverview Controller for debug page
 */

'use strict';

blink.app.controller('DebugController', ['$scope',
    'strings',
    function ($scope,
          strings) {

    /**
     * @typedef {{
     *     actionType: string,
     *     label: string,
     *     selected: boolean?
     * }}
     */
        $scope.menus = [
            {
                header: 'Callosum',
                items: [
                    {
                        actionType: 'loggers-management',
                        label: 'Loggers',
                    },
                    {
                        actionType: 'memcache-management',
                        label: 'Memcache'
                    },
                    {
                        actionType: 'metadata-management',
                        label: 'Metadata'
                    }
                ]
            }
        ];

    /**
     * Determine the selected item from the multiple menus.
     *
     * @param {MenuItem} menuItem
     */
        $scope.onMenuItemClick = function (menuItem) {
            $scope.selectedMenuItem = menuItem;
        };

        $scope.onMenuItemClick($scope.menus[0].items[0]);

    /**
     * Determine if a given menuItem is selected
     *
     * @param {MenuItem} menuItem
     */
        $scope.isMenuItemSelected = function (menuItem) {
            return $scope.selectedMenuItem === menuItem;
        };
    }]);
