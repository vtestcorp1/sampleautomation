/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Implementation of labels and labels panel.
 *
 * Provides a directive <labels-panel> that when instantiated fetches the list of labels (TAGs) and shows the
 * corresponding color and label name. The directive can be instantiated in readonly mode that does not allow user to
 * change tag or add new tags.
 *
 * A label-panel comprises of following sub-components:
 * - <color-picker> directive that allows user to pick a color.
 * - <div blink-content-editable>
 * - <add-new-item> directive that can be used to show an add button/link, show an input to fill name of new item and
 * show the loading spinnerwhile addition is in progress.
 *
 */

'use strict';

blink.app.controller('LabelsPanelController', ['$scope',
    '$rootScope',
    '$q',
    'alertConstants',
    'blinkConstants',
    'strings',
    'dialog',
    'events',
    'labelsService',
    'Logger',
    'sessionService',
    'util',
    function ($scope,
          $rootScope,
          $q,
          alertConstants,
          blinkConstants,
          strings,
          dialog,
          events,
          labelsService,
          Logger,
          sessionService,
          util) {
        var _logger = Logger.create('labels-panel-controller');

        var self = this;
        $scope.labelsPanel = self;
        $scope.labelsRegistry = labelsService.labelsRegistry;

        var _private = {
            isReadonly: false,
            isNotSelectable: false,
            currentUser: '',
            colorHistogram: {},
            labels: []
        };

        self.isLoading = false;
        function updateLabelsFromInput() {
            _private.labels = Object.values($scope.labelsRegistry.getLabels()).sortBy(function (label) {
                return label.name;
            });
        }

        function init() {
            $scope.$watch(function () {
                return $scope.labelsRegistry.getHash();
            }, updateLabelsFromInput);

            if (!$scope.labelsRegistry.isInitialized()) {
                $scope.labelsRegistry.setLoading(true);
            // Make service calls to fetch the list of labels the current user has access to.
                labelsService.getLabels().then(function (labelsList) {
                    $scope.labelsRegistry.setLoading(false);
                    labelsList.each(function (label) {
                        $scope.labelsRegistry.addLabel(label);
                    });
                    updateColorHistogram();
                    $rootScope.$broadcast(events.LABELS_REFRESH_D);
                }, function (error) {
                    $scope.labelsRegistry.setLoading(false);
                });
            } else {
                updateLabelsFromInput();
            }

        }

        self.getLabels = function () {
            return _private.labels;
        };

        self.isLabelCreationAllowed = function () {
            return !_private.isReadonly;
        };

        self.createNewLabel = function (newLabelName) {
            var createLabelDeferred = $q.defer();
        // Make a service call to create a new label and update it with the new guid.
            labelsService.createLabel(newLabelName).then(function (newLabel) {
                newLabel.color = getLeastFrequentDefaultColor();
                labelsService.saveLabel(newLabel).then(function () {
                    _private.labels.push(newLabel);
                    $scope.labelsRegistry.addLabel(newLabel);
                    updateColorHistogram();
                    createLabelDeferred.resolve(newLabel);
                }, function (e) {
                    _logger.error('Error creating automatic color for new label', e);
                    createLabelDeferred.reject(e);
                });
            }, function (e) {
                _logger.error('Error creating a new label', e);
                createLabelDeferred.reject(e);
            });
            return createLabelDeferred.promise;
        };

        self.saveLabel = function (label) {
            var saveLabelDeferred = $q.defer();
        // Make a service call to save the label.
            labelsService.saveLabel(label).then(function () {
                updateColorHistogram();
                self.onLabelUpdate(label);
                $rootScope.$broadcast(events.LABEL_UPDATED_D, label);
                saveLabelDeferred.resolve(label);
            });
            return saveLabelDeferred.promise;
        };

        self.deleteLabel = function (label) {
            var deleteLabelDeferred = $q.defer();
            dialog.show({
                title: 'Remove sticker',
                customBodyUrl: 'src/modules/labels/label-removal-alert-message.html',
                cancelBtnLabel: 'No',
                confirmBtnLabel: 'Yes',
            // TODO(rahul): Introduce an async dialog (similar to the nav alert but with 2 buttons only)
                onConfirm: function () {
                    labelsService.deleteLabel(label).then(function () {
                        $scope.labelsRegistry.deleteLabel(label.getId());
                        updateColorHistogram();
                        self.onLabelDeletion(label);
                        deleteLabelDeferred.resolve(label);
                    }, function (error) {
                        _logger.error('Unable to remove label', label.getName());
                        _logger.debug(error);
                        deleteLabelDeferred.reject(label);
                    });
                    return true;
                }
            });
            return deleteLabelDeferred.promise;
        };

    /**
     * Validates a label name, checking for non-emptiness and for name clashing with other label names
     * @param {String} labelName - new labelName
     * @param {Boolean} existing - is it a name edit of an existing label or creation of a new one
     * @returns {String} error message, or null if labelName is valid
     */
        self.validateLabelName = function(labelName, existing) {
            var expectedLabelNameCount = existing ? 1 : 0;
            var labelNameCount = self.countLabelsWithName(labelName);
            if (!labelName.trim()) {
                return strings.alert.labelAlertMessages.labelNameEmpty;
            }
            if (labelNameCount != expectedLabelNameCount) {
                return strings.alert.labelAlertMessages.duplicateLabelName;
            }
            return null;
        };

        var defaultLabelColors = {
            SUPER_YELLOW: '#fbc17c',
            ANGRY_RED: '#fe7a76',
            GIRLY_PINK: '#ff78a9',
            FUNKY_PURPLE: '#c598f0',
            OCEAN_BLUE: '#63c9ea',
            CARRIBEAN_GREEN: '#4bcb9f',
            DRY_GRASS_GREEN: '#c2d578'
        };

        function resetColorHistogram() {
            Object.keys(_private.colorHistogram).each(function (color) {
                _private.colorHistogram[color] = 0;
            });
        }

        function yuvDistance(color1, color2) {
            color1 = new $.colorpicker.Color(color1).toRGB();
            color2 = new $.colorpicker.Color(color2).toRGB();

            var y1 = color1.r * 0.299 + color1.g * 0.587 + color1.b * 0.114,
                y2 = color2.r * 0.299 + color2.g * 0.587 + color2.b * 0.114;

            var u1 = 0.492 * (color1.b - y1),
                u2 = 0.492 * (color2.b - y2);

            var v1 = 0.877 * (color1.r - y1),
                v2 = 0.877 * (color2.r - y2);

            return Math.pow((y1 - y2), 2) + Math.pow((u1 - u2), 2) + Math.pow((v1 - v2), 2);
        }

        function getNearestDefaultColor(labelColor) {
            return Object.values(defaultLabelColors).min(function (defaultColor) {
                return yuvDistance(defaultColor, labelColor);
            });
        }

        function updateColorHistogram() {
            resetColorHistogram();
            _private.labels.each(function (label) {
                _private.colorHistogram[getNearestDefaultColor(label.getCommittedColor())]++;
            });
        }

        function getLeastFrequentDefaultColor() {
            var colorsInHistogram = Object.keys(_private.colorHistogram),
                allDefaultColors = Object.values(defaultLabelColors);

            var remainingColors = allDefaultColors.subtract(colorsInHistogram);
            if (remainingColors.length) {
                return remainingColors[0];
            }

            return colorsInHistogram.min(function (color) {
                return _private.colorHistogram[color];
            });
        }

        self.countLabelsWithName = function(labelName) {
            labelName = labelName.trim().toLowerCase();
            return _private.labels.reduce(function (previous, current) {
                return (current.name.trim().toLowerCase() == labelName) ? previous + 1 : previous;
            }, 0);
        };

        self.setReadonly = function (isReadonly) {
            _private.isReadonly = isReadonly;
        };

        self.setNotSelectable = function (isNotSelectable) {
            _private.isNotSelectable = isNotSelectable;
        };

        self.isEditingAllowed = function (label) {
            if (_private.isReadonly) {
                return false;
            }

            if (!_private.currentUser) {
                _private.currentUser = sessionService.getUserGuid();
            }
            return label.getAuthor() == _private.currentUser || sessionService.hasAdminPrivileges();
        };

        self.onEditBtnClick = function (event) {
            event.stopPropagation();
            $scope.showBootstrapDropdown(event);
        };

        self.isCurrentlyActive = function (label) {
            return !_private.isNotSelectable && _private.currentActiveLabel === label.getId();
        };

        self.updateActiveState = function (label) {
            if (_private.currentActiveLabel == label.getId()) {
                _private.currentActiveLabel = null;
                return;
            }

            _private.currentActiveLabel = label.getId();
        };

        self.setSelectedLabel = function (labelId) {
            var label = $scope.labelsRegistry.getLabel(labelId);
            self.updateActiveState(label);
        };

        $scope.$on(events.FILTER_METADATA_BY_LABEL_D, function ($evt, label) {
            if (_private.currentActiveLabel == label.getId()) {
                return;
            }

            self.onLabelClick(label);
        });

        $scope.$on(events.RESET_LABEL_SELECTION_D, function ($evt) {
            _private.currentActiveLabel = null;
        });

        var MenuItemType = {
            EDIT_NAME: 'EDIT_NAME',
            CHANGE_COLOR: 'CHANGE_COLOR',
            REMOVE_LABEL: 'REMOVE_LABEL'
        };
        self.editMenuItems = [{
            id: MenuItemType.EDIT_NAME,
            text: 'Edit name'
        }, {
            id: MenuItemType.CHANGE_COLOR,
            text: 'Change Color'
        }, {
            id: MenuItemType.REMOVE_LABEL,
            text: 'Remove {1}'.assign(strings.listFilterLabels.TAG_LABEL_UI_NAME)
        }];

        self.onMenuItemClick = function (event, menuItem, label) {
            _logger.debug('menu item clicked', event, menuItem);
            var $label = $(event.target).closest('.bk-label');
            switch (menuItem.id) {
                case MenuItemType.EDIT_NAME:
                    util.executeInNextEventLoop(function () {
                        $label.find('.bk-editable').trigger('blink.contenteditable.edit');
                    });
                    break;
                case MenuItemType.CHANGE_COLOR:
                    $label.find('.bk-color-picker').trigger('showColorPicker');
                    break;
                case MenuItemType.REMOVE_LABEL:
                    self.deleteLabel(label);
                    break;
            }
            $label.find('[data-toggle=dropdown]').trigger('click.bs.dropdown');
        };
        init();
    }]);

/**
 * @ngdoc directive
 * @param {Boolean} readonly
 * @param {Boolean} selectable
 * @paran {Function} onLabelClicked Callback called on clicking of a label
 * @param {Function} onLabelDeleted Callback called when a label is deleted
 * @param {string} selectedLabelId id of the initially selected label
 */
blink.app.directive('labelsPanel', ['$parse', 'Logger', function ($parse, Logger) {
    var _logger = Logger.create('labels-panel');

    function linker(scope, $labelPanel, attrs) {
        var isReadonly = angular.isDefined(attrs.readonly) && attrs.readonly !== 'false';
        _logger.info('LabelsPanel component in readonly mode:', isReadonly);
        scope.labelsPanel.setReadonly(isReadonly);

        var isNotSelectable = angular.isDefined(attrs.selectable) && attrs.selectable === 'false';
        _logger.info('LabelsPanel component in non-selectable mode:', isNotSelectable);
        scope.labelsPanel.setNotSelectable(isNotSelectable);

        scope.labelsPanel.onLabelClick = function (label) {
            scope.labelsPanel.updateActiveState(label);
            if (scope.onLabelClick) {
                scope.onLabelClick({
                    $label: label
                });
            }
        };

        scope.labelsPanel.onLabelDeletion = function (label) {
            if (scope.onLabelDeletion) {
                scope.onLabelDeletion({
                    $label: label
                });
            }
        };

        scope.labelsPanel.onLabelUpdate = function (label) {
            if (scope.onLabelUpdate) {
                scope.onLabelUpdate({
                    $label: label
                });
            }
        };

        if(!!scope.selectedLabelId) {
            scope.labelsPanel.setSelectedLabel(scope.selectedLabelId);
        }

        var DDOWN_STICKY_CLASS = 'bk-sticky';
        scope.showBootstrapDropdown = function (event) {
            var $btn = $(event.target),
                $parent = $btn.parent();
            $parent
                .off('show.bs.dropdown')
                .off('hide.bs.dropdown');
            $parent
                .on('show.bs.dropdown', function () {
                    $parent.addClass(DDOWN_STICKY_CLASS);
                })
                .on('hide.bs.dropdown', function () {
                    $parent.removeClass(DDOWN_STICKY_CLASS);
                });

            // Overwritting min-width of 160px defined in bootstrap css
            $parent.find('.dropdown-menu').css({minWidth: '129px'});
            $btn.trigger('click.bs.dropdown');
            // apply scrolling offset of the menu div
            var offsetYInScrollableMenu = $('.bk-label-wrapper').scrollTop();
            $parent.find('.dropdown-menu').css({marginTop:-offsetYInScrollableMenu});
        };
    }

    return {
        restrict: 'E',
        templateUrl: 'src/modules/labels/labels.html',
        controller: 'LabelsPanelController',
        scope: {
            readonly: '@',
            selectable: '@',
            onLabelClick: '&',
            onLabelDeletion: '&',
            onLabelUpdate : '&',
            selectedLabelId: '='
        },
        link: linker
    };
}]);
