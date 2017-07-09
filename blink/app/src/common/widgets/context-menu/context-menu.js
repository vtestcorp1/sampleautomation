/**
 * Copyright: ThoughtSpot Inc. 2014-2015
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview A generic context menu
 */

'use strict';
addBooleanFlag('showRelatedItems', 'Whether to show related Items', false);
addBooleanFlag('showRelatedLinks', 'Whether to show related Links only', false);

blink.app.controller('ContextMenuController', [
    '$scope',
    'events',
    'Logger',
    'strings',
    function ($scope,
              events,
              Logger,
              strings) {
        var _logger = Logger.create('context-menu-controller');

        var activeSubMenuId = '';

        var shouldShowRelatedItems = flags.getValue('showRelatedItems');
        var showRelatedLinks = flags.getValue('showRelatedLinks');

        $scope.showRelatedItems = function() {
            return shouldShowRelatedItems || showRelatedLinks;
        }

        // We put the data on the scope so that sub menus can access this data.
        $scope.contextMenuData = $scope.getData();

        $scope.config = $scope.getConfig();
        $scope.strings = strings;

        $scope.canShowSubMenu = function (subMenuId) {
            return activeSubMenuId === '' || (angular.isDefined(subMenuId) && activeSubMenuId === subMenuId);
        };

        $scope.$on(events.EXPAND_AND_SET_ACTIVE_SUBMENU, function ($evt, subMenuId, expandUp) {
            $evt.stopPropagation();
            if (angular.isDefined(subMenuId)) {
                activeSubMenuId = subMenuId;
            }

            $scope.expandMenu(expandUp);
        });

        // This resets the context menu to its original state. It brings all the submenus back in the collapsed state.
        $scope.$on(events.CONTEXT_MENU_RESET, function ($evt) {
            $evt.stopPropagation();
            activeSubMenuId = '';
            $scope.positionMenuAtInitialState();
        });

        $scope.$on('$destroy', function () {
        // If any close callback is provided, call it.
            if ($scope.config.onCloseCB) {
                $scope.config.onCloseCB();
            }
        });
    }]);

blink.app.directive('contextMenu', ['Logger', 'RelatedItemsComponent',
    function (Logger, RelatedItemsComponent) {
        var _logger = Logger.create('context-menu');

        var WIDTH = 202,
            HEIGHT_PER_SUBMENU = 33;

        var initialLaunchPosition = null;

        function keepWithinViewPort($menu, scope) {
            var config = scope.config,
                clickedPosition = config.clickedPosition,
                menuHeight = HEIGHT_PER_SUBMENU * config.subMenuItems.length,
                menuWidth = WIDTH,
                documentHeight = document.documentElement.clientHeight,
                containerElem = config.container ? $(config.container)[0] : document.documentElement,
                menuElem = $menu[0];

            if (!containerElem || !menuElem) {
                _logger.error('Invalid container or menu element');
                return;
            }

            var containerBoundary = containerElem.getBoundingClientRect(),
                newTop = clickedPosition.top,
                newLeft = clickedPosition.left;

        // Open the menu where there is more space
            if (newTop - containerBoundary.top > containerBoundary.bottom - newTop) {
                newTop = newTop - menuHeight;
            }

            if (newLeft - containerBoundary.left > containerBoundary.right - newLeft) {
                newLeft = newLeft - menuWidth;
            }

            var newBottom = containerBoundary.bottom - newTop - menuHeight;

            initialLaunchPosition = {
                top: newTop,
                left: newLeft,
                bottom: newBottom
            };

            scope.positionMenuAtInitialState();

            scope.contextSubMenuConfig = {
                positionConfig: {
                    spaceLeftAbove: newTop - containerBoundary.top,
                    spaceLeftBelow: containerBoundary.bottom - (newTop + menuHeight)
                }
            };
        }

    /**
     * Note - this code assumes that the launcher has checked for the validity of data and config. We do not check here.
     */
        function linker(scope, $el, attrs) {
        /**
         * Note (Shikhar) - this is not called if click is anywhere inside slickgrid because it eats the mousedown
         * event. So that is handled in the launcher.
         */
            scope.close = function (vizContextMenuOption) {
                var config = scope.getConfig();
                if (config && config.onClose) {
                    config.onClose(vizContextMenuOption);
                }
                scope.onClose();
                scope.$destroy();
                $el.remove();
            };

        // Right now, the code only handles moving menu up/down, not left/right
            scope.expandMenu = function (expandUp) {
            // If expansion down, unset bottom so that submenus can expand downwards. We anchor the top here.
                if (!expandUp) {
                    $el.css({
                        top: initialLaunchPosition.top + 'px',
                        bottom: ''
                    });
                } else {
                    $el.css({
                        top: '',
                        bottom: initialLaunchPosition.bottom + 'px'
                    });
                }
            };

            scope.positionMenuAtInitialState = function () {
                $el.css({
                    top: initialLaunchPosition.top + 'px',
                    left: initialLaunchPosition.left + 'px'
                });
            };

            scope.onSubMenuItemClick = function ($event, item) {
                if (!item.enabled) {
                    $event.stopPropagation();
                }
            };

            if (!scope.config.isPositionFixed) {
                keepWithinViewPort($el, scope);
            }

            $(window).resize(function() {
                keepWithinViewPort($el, scope);
            });

            // this is in linker and not in controller since some functions
            // are added to scope in linker like close and onItemsFetched
            if (scope.showRelatedItems()) {
                scope.relatedItemsComponent = new RelatedItemsComponent(
                    scope.contextMenuData,
                    scope.expandMenu,
                    scope.close
                );
                scope.relatedItemsComponent.fetchRelatedItems();
            }
        }

        return {
            restrict: 'A',
            replace: true,
            scope: {
                getData: '&data',
                getConfig: '&config',
                onClose: '='
            },
            link: linker,
            controller: 'ContextMenuController',
            templateUrl: 'src/common/widgets/context-menu/context-menu.html'
        };
    }]);
