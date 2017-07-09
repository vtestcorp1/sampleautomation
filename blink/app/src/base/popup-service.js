/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A generic service to manage showing/hiding any popup
 */

'use strict';

blink.app.factory('popupService', ['$rootScope', 'angularUtil', 'Logger', 'util',
    function ($rootScope, angularUtil, Logger, util) {
        var _logger = Logger.create('popup-service');

        var me = {};

        me.show = function (template, scopeConfig) {

            var $popupScope = $rootScope.$new();
            util.iterateObject(scopeConfig, function(key, value){
                $popupScope[key] = value;
            });

            var $popup = angularUtil.getCompiledElement(template, $popupScope),
                hide = function () {
                    $popup.remove();
                    $popupScope.$destroy();
                };

            $popupScope.hide = function () {
                hide();
            };

            var anchorSelector = scopeConfig.anchorSelector || '.bk-page-app-canvas';
            $(anchorSelector).append($popup);
            $popup.show();

            return {
                hide: function () {
                    hide();
                }
            };
        };

        return me;
    }]);
