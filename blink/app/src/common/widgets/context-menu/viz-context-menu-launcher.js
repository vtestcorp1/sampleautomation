/**
 * Copyright: ThoughtSpot Inc. 2014-2015
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview  A utility service to launch context menu
 */

'use strict';

blink.app.factory('vizContextMenuLauncher', ['$rootScope', 'angularUtil', 'Logger',
    function ($rootScope, angularUtil, Logger) {
        var _logger = Logger.create('viz-context-menu-launcher');

        var me = {};

        function showContextMenu(params) {
        // We have to remove any other older context menu. We have to do this here for this case:
        // If I drill at other point on slick-grid. This is because slick-grid consumes mousedown and blinkOverlay is
        // not triggered. So clear() inside context-menu is also not triggered.
            var $container = !!params.config.container ? $(params.config.container) : $('body');
            if (!$container || !$container.length) {
                _logger.warn('Invalid container');
                return;
            }

            me.close();

            var newScope = $rootScope.$new(),
                $contextMenuElem = $('<div context-menu data="data" config="config" on-close="onClose"></div>');

            $contextMenuElem = angularUtil.getCompiledElement($contextMenuElem, newScope);
            newScope.data = params.data;
            newScope.config = params.config;
            newScope.onClose = function() {
                newScope.$destroy();
            };
            $container.append($contextMenuElem);
        }

    /**
     *
     * @param {Object} params
     *
     * @param {Object} params.data
     * @param {Object} params.config
     */
        me.launch = function (params) {
            _logger.info('launch function entered');
            _logger.debug(params);

            var config = params.config;

            if (!params.data || !config || !config.subMenuItems || !config.subMenuItems.length
            || (!config.isPositionFixed && !config.clickedPosition)) {
                _logger.error('Invalid params');
                return;
            }

            showContextMenu(params);
        };

    /**
     * Closes and removes context menu body
     */
        me.close = function () {
            var $oldContextMenuElem = $('.bk-context-menu');
            if ($oldContextMenuElem && $oldContextMenuElem.length) {
                $oldContextMenuElem.isolateScope().$destroy();
                $oldContextMenuElem.remove();
            }
        };

        return me;
    }]);
