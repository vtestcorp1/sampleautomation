/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview TODO
 */

'use strict';

/* global addBooleanFlag */
addBooleanFlag('enableQueryLatencyVisualizer', 'This flag enables UI to visualize query latency', false);
addBooleanFlag('enablePinboardSnapshots', 'This flag enables pinboard snapshotting in the UI', false);

/* eslint max-params: 1 */
blink.app.directive('blinkSharableItem', ['$rootScope',
    'appClientStateService',
    'autoAnalyzerService',
    'blinkConstants',
    'clientState',
    'dialog',
    'dateUtil',
    'DocumentPermissionFactory',
    'events',
    'joinPathRegistry',
    'jsonConstants',
    'loadingIndicator',
    'Logger',
    'navService',
    'SageModel',
    'session',
    'sessionService',
    'showUnderlyingDataService',
    'strings',
    'userDialogs',
    'util',
    function ($rootScope,
          appClientStateService,
          autoAnalyzerService,
          blinkConstants,
          clientState,
          dialog,
          dateUtil,
          DocumentPermissionFactory,
          events,
          joinPathRegistry,
          jsonConstants,
          loadingIndicator,
          Logger,
          navService,
          SageModel,
          session,
          sessionService,
          showUnderlyingDataService,
          strings,
          userDialogs,
          util) {

        var _logger = Logger.create('sharable-item-ui');

    /* global flags */
        var enableQueryLatencyVisualizer = flags.getValue('enableQueryLatencyVisualizer');

        var _actionsMenuTypes = {
            STANDARD: 'standard',
            CUSTOM: 'custom'
        };

        var scrollDebounceTime = 500;

    /**
     *
     * @param {Object} model
     * @return {boolean}
     * @private
     */
        function _isNewDocument(model) {
            if (!model) {
                return true;
            }
            return !model.isCreatedOnServer();
        }

        function isShareable(permission, model, isAnswerSharingDisabled) {
            return permission
            && permission.isSharingDocumentAllowed()
            && (model
                && !model.isHidden()
                && isAnswerSharingDisabled
                || model && model.isAggregatedWorksheet());
        }

        function getActionMenu(scope,
                           model,
                           actionsMenuType,
                           type,
                           permission,
                           canChangeLayout) {
            if (!actionsMenuType) {
                return;
            }
            var menuItems = blinkConstants.metadataObjectMenuItems;
            var menuItemsStrings = strings.metadataObjectMenuItems;
            var addActionBtn = {
                    actions: []
                },
                subMenuSave = _.assign({}, menuItems.save, menuItemsStrings.save, {
                    onClick : function() {
                        scope.$broadcast(events.SAVE_BUTTON_CLICKED_D);
                    }
                }),
                subMenuUpdate = _.assign({}, menuItems.update, menuItemsStrings.update, {
                    onClick : function() {
                        scope.$broadcast(events.SAVE_BUTTON_CLICKED_D);
                    }
                }),
                subMenuMakeACopy = _.assign({}, menuItems.makeACopy, menuItemsStrings.makeACopy, {
                    onClick : function() {
                        scope.$broadcast(events.MAKECOPY_BUTTON_CLICKED_D);
                    }
                }),
                subMenuSaveUntitled = _.assign({}, menuItems.saveUntitled, menuItemsStrings.saveUntitled, {
                    onClick : function() {
                        scope.$broadcast(events.SAVEAS_BUTTON_CLICKED_D);
                    }
                }),
                subMenuSnapshot = _.assign({}, menuItems.pinboardSnapshot, menuItemsStrings.pinboardSnapshot, {
                // TODO(raj): enforced pb is saved (i.e. no unsaved changes)
                    onClick : function() {
                        userDialogs.showPinboardSnapshotDialog(model);
                    }
                }),
                subMenuEmbedDocument = _.assign({}, menuItems.copyLink, menuItemsStrings.copyLink, {
                    onClick : function() {
                        scope.$broadcast(events.COPY_LINK_BUTTON_CLICKED_D);
                    }
                }),
                subMenuAddFilter = _.assign({}, menuItems.addFilter, menuItemsStrings.addFilter, {
                    onClick : function() {
                        scope.$broadcast(events.ADD_FILTER);
                    }
                }),
                subMenuShare = _.assign({}, menuItems.share, menuItemsStrings.share, {
                    onClick: function () {
                        scope.$broadcast(events.SHARE_BUTTON_CLICKED_D);
                    }
                }),
                subMenuDownloadAsPdf = _.assign({}, menuItems.downloadAsPdf, menuItemsStrings.downloadAsPdf, {
                // TODO(Vishwas): Move this to disabledAction and add tooltip on how to get download
                    dropdownItemDisabled : function() {
                        return !!scope.config.model._hasUserTriggeredChanges;
                    },
                    onClick : function() {
                        scope.$broadcast(events.FOOLSCAP_DOWNLOAD_AS_PDF_BUTTON_CLICKED_D);
                    }
                }),
                subMenuViewSchedules = _.assign({}, menuItems.schedulesList, menuItemsStrings.schedulesList, {
                    onClick: function () {
                        scope.$broadcast(events.VIEW_SCHEDULE_BUTTON_CLICKED_D);
                    }
                }),

                actionResetLayout = _.assign({}, menuItems.resetLayout, menuItemsStrings.resetLayout, {
                    onClick : function() {
                        scope.$emit(events.LAYOUT_RESET_U);
                    }
                });

            var isSnapshot =
            !!scope.metadataConfig &&
            !!scope.metadataConfig.pinboardPageConfig &&
            !!scope.metadataConfig.pinboardPageConfig.snapshotId;

            if (actionsMenuType  == _actionsMenuTypes.STANDARD) {

                var isVizContext = !!model && model.isHidden() && scope.isAnswer();

                if (isSnapshot) {
                    return null;
                }

            // NOTE: In case of pinboards even when we are missing underlying access we want to
            // show save and make a copy
                if (!!permission && permission.isMissingUnderlyingAccess()
                && type !== blinkConstants.documentType.PINBOARD) {
                    addActionBtn = null;
                    return addActionBtn;
                } else {
                    if (!_isNewDocument(model) || (!!model && model.getPermission().isMissingUnderlyingAccess())) {
                        if (permission && permission.isSavingDocumentAllowed()) {
                            addActionBtn.actions.push(subMenuSave);
                            addActionBtn.actions.push(subMenuMakeACopy);
                        } else if (permission && permission.isCopyingDocumentAllowed()) {
                            addActionBtn.actions.push(subMenuMakeACopy);
                        }
                    } else {
                        addActionBtn.actions.push(subMenuSaveUntitled);
                    }
                }
                var backendConfig = session.getBackendConfig();

                if (type === blinkConstants.documentType.PINBOARD) {
                    if (!!model) {
                        var isMissingUnderlyingAccess = permission.isMissingUnderlyingAccess();
                        if (!isMissingUnderlyingAccess) {
                            addActionBtn.actions.push(subMenuAddFilter);
                        }
                    }
                    if (!clientState.isAppEmbedded()) {
                        addActionBtn.actions.push(subMenuEmbedDocument);
                    }

                    if (flags.getValue('enablePinboardSnapshots')) {
                        addActionBtn.actions.push(subMenuSnapshot);
                    }

                    var layoutEditPermission = (!canChangeLayout || (permission && !permission.isLayoutAllowed()));

                    if (!layoutEditPermission) {
                        addActionBtn.actions.push(actionResetLayout);
                    }

                    if (sessionService.isFoolscapPdfDownloadEnabled()
                            && sessionService.hasDataDownloadPrivileges()) {
                        addActionBtn.actions.push(subMenuDownloadAsPdf);
                    }

                    var canViewSchedule =  sessionService.hasJobSchedulingPrivileges() || sessionService.hasAdminPrivileges();
                    subMenuViewSchedules.dropdownItemDisabled = !canViewSchedule;
                    subMenuViewSchedules.dropdownItemTooltip = blinkConstants.report.noPermission;
                    if (sessionService.isSchedulingJobEnabled()) {
                        addActionBtn.actions.push(subMenuViewSchedules);
                    }
                }

                if(isShareable(permission, model, !scope.isAnswerSavingDisabled())) {
                    addActionBtn.actions.push(subMenuShare);
                }

                scope.$on(events.LAYOUT_CUSTOM_MODE_CHANGED_U, function ($evt, inCustomMode) {
                    actionResetLayout.dropdownItemDisabled = !inCustomMode;
                });

                return addActionBtn;
            }
        }

        function getPermission (model, type) {
            var metadataType = typeToMetadataType[type];
            if (!!model && !!model.getPermission()) {
                return model.getPermission();
            } else {
                return DocumentPermissionFactory.createPermissiveInstance(metadataType);
            }
        }

        function Config(metadataConfig, type, permission, actionMenuConfig) {
            angular.extend(this, metadataConfig);
            this.type = type;
            this.permission = permission;
            this.actionMenuConfig = actionMenuConfig;
        }

        var typeToMetadataType = {
            PINBOARD: jsonConstants.metadataType.PINBOARD_ANSWER_BOOK,
            WORKSHEET: jsonConstants.metadataType.LOGICAL_TABLE
        };

    // TODO (Shikhar) - make 2 functions from this. One which just updates the model and global state. And other taking
    // into account the permission during init.
        Config.prototype.updateFromModel = function (model, actionMenuConfig) {
            this.model = model;
            this.permission = getPermission(model, this.type);

            this.actionMenuConfig = actionMenuConfig;

            var  tokens = (this.model && this.model.getRecognizedTokens()) || [];

        // Every time we get an updated sage response from server that affects the document state, it should update the
        // join path registry. This registry is used by other parts of the app to show join path information.
            joinPathRegistry.update(tokens);
        };

    /**
     * Returns true if author icon can be shown
     * @returns {boolean}
     */
        Config.prototype.showAuthor = function () {
            return !_isNewDocument(this.model);
        };

    /**
     * Returns true if save operation is in progress
     * @returns {boolean}
     */
        Config.prototype.isActionMenuBusy = function () {
            return !!this.isSaveOperationInProgress;
        };

    /**
     * Return true if the caller permits showing of sage. This does not take into account current permissions
     * @returns {boolean}
     */
        Config.prototype.isSageAllowed = function () {
            return !!this.withSageBar;
        };

    /**
     * Return true if sage interaction is permitted taking into account the permission settings
     * @returns {boolean}
     */
        Config.prototype.isSageInteractionAllowed = function () {
            return !!(this.isSageAllowed() && !!this.permission && this.permission.isSageAllowed());
        };

        Config.prototype.disableActionMenuItem = function (actionMenuConfig, id) {
            this.actionMenuConfig = actionMenuConfig;
            if (!this.actionMenuConfig || !this.actionMenuConfig.actions) {
                return;
            }
            angular.forEach(this.actionMenuConfig.actions, function (action){
                if(action.id === id) {
                    action.dropdownItemDisabled = true;
                }
            });
        };

        Config.prototype.enableActionMenuItem = function (actionMenuConfig, id) {
            this.actionMenuConfig = actionMenuConfig;
            if (!this.actionMenuConfig || !this.actionMenuConfig.actions) {
                return;
            }
            angular.forEach(this.actionMenuConfig.actions, function (action){
                if(action.id === id) {
                    action.dropdownItemDisabled = false;
                }
            });
        };

        var typeToDetails = {
            PINBOARD: {
                label: 'pinboard',
                placeholder: 'Pin charts and tables here'
            },
            WORKSHEET: {
                label: 'worksheet',
                placeholder: 'Create your worksheet'
            }
        };

        Config.prototype.getItemName = function () {
            if (!this.model || !this.model.getName) {
                _logger.warn('Sharable item without a backing model', this);
                return '';
            }

            return this.model.getName();
        };

        Config.prototype.shouldShowPlaceholderContainer = function () {
            var hidePlaceholder = util.prop(this, 'canvasConfig.hidePlaceholder');
            if (angular.isDefined(hidePlaceholder)) {
                return !hidePlaceholder;
            }

            return !this.model;
        };

        Config.prototype.getPlaceholderText = function () {
            if (!typeToDetails.hasOwnProperty(this.type)) {
                _logger.warn('Unknown type of sharable item:', this.type);
                return '';
            }

            return typeToDetails[this.type].placeholder;
        };

        var allowedAttributesInDirective = {
            withSageBar: true,
            searchOnStart: true,
            contentUrl: true,
            sageClient: true
        };

        function _parseAttributeIntoConfig(attrs, scope, config) {
            angular.forEach(Object.keys(attrs), function (prop) {
                if (allowedAttributesInDirective.hasOwnProperty(prop)) {
                    config[prop] = scope.$parent.$eval(attrs[prop]);
                }
            });
        }

        function linker(scope, $item, attrs) {
            scope.currentDate = dateUtil.formatDate(new Date());

            var permission = getPermission(scope.metadataConfig.model, scope.type);
            scope.config = new Config(scope.metadataConfig, scope.type,
                permission,
                getActionMenu(scope,
                    scope.metadataConfig.model,
                    scope.metadataConfig.actionsMenuType,
                    scope.type,
                    permission,
                    scope.metadataConfig.canChangeLayout)
            );

            _parseAttributeIntoConfig(attrs, scope, scope.config);
            scope.config.updateFromModel(scope.config.model,
            getActionMenu(scope,
                scope.config.model,
                scope.config.actionsMenuType,
                scope.config.type,
                scope.config.permission,
                scope.config.canChangeLayout));

        // This is to watch changes that are done from parent of this directive.
            scope.$watch(function () {
                return !!scope.metadataConfig ? scope.metadataConfig.model : null;
            }, function (newModel) {
                scope.config.updateFromModel(newModel,
                getActionMenu(scope,
                    newModel,
                    scope.config.actionsMenuType,
                    scope.config.type,
                    scope.config.permission,
                    scope.config.canChangeLayout));
            });

        // This is to watch changes made by children/self. AutoUpgrade worksheet is one such case.
            scope.$watch(function () {
                return !!scope.config ? scope.config.model : null;
            }, function (newModel) {
                scope.config.updateFromModel(newModel,
                getActionMenu(scope,
                    newModel,
                    scope.config.actionsMenuType,
                    scope.config.type,
                    scope.config.permission,
                    scope.config.canChangeLayout));
            });

            if (!!attrs.type) {
                $item.addClass('bk-sharable-item-{1}'.assign(util.replaceAll(attrs.type, '\'','').toLowerCase()));
            }

        // NOTE: The options in action menu change when the display mode is changed.
            scope.$on(events.ANSWER_UI_RENDERED_U, function() {
                scope.updateMenu();
            });

        /**
         * Update the layout and action menus in the document
         */
            scope.updateMenu = function () {
                var config = scope.config;
                if (!config) {
                    return;
                }
                config.actionMenuConfig = getActionMenu(scope,
                config.model,
                config.actionsMenuType,
                config.type,
                config.permission,
                config.canChangeLayout);
            };

            scope.isSageBarReady = false;
            scope.$on(events.SAGE_LOADED_U, function () {
                scope.isSageBarReady = true;
            });

            scope.modelValidationError = {};

            scope.$watch('modelValidationError.message', function () {
                var saveTypeId = blinkConstants.metadataObjectMenuItems.saveUntitled.id;
                if (!_isNewDocument(scope.config.model)) {
                    saveTypeId = blinkConstants.metadataObjectMenuItems.save.id;
                }

                if (!!scope.modelValidationError.message && !!scope.config.actionMenuConfig) {
                    scope.config.disableActionMenuItem(scope.config.actionMenuConfig, saveTypeId);
                } else {
                    scope.config.enableActionMenuItem(scope.config.actionMenuConfig, saveTypeId);
                }
            });

            scope.showOverlay = (scope.config.documentType == 'worksheet') && !scope.metadataConfig.model;

            scope.showDataPanelAboveOverlay = function () {
                return scope.showOverlay;
            };

            scope.showQueryLatencyVisualizer = function () {
                return enableQueryLatencyVisualizer;
            };

            scope.updatePinboardChosenDropdown = function () {
            // chosen.js doesn't update the options list until next event loop
                util.executeInNextEventLoop(function() {
                    $item.find('.bk-pinboard-picker-drop-down').trigger('chosen:updated');
                });
            };

            scope.init();

            $item.on('$destroy', function () {
                appClientStateService.cleanClientState();
            });
            scope.onDataSourcesChanged = function(dataSources) {
                var hasNoSourcesSelected = !dataSources || dataSources.length === 0;
                var isWorksheet = scope.config.documentType == 'worksheet';
                scope.showOverlay = hasNoSourcesSelected && isWorksheet;
            };

            scope.showLoadingIndicator = function() {
                loadingIndicator.reAnchorAndShow(null, {
                    additionalStyleClasses: ['bk-light-weight'],
                    loadingText:'Downloading',
                    showInstantly: true
                });
            };

            scope.hideLoadingIndicator = function() {
                loadingIndicator.hide();
            };

            scope.setupScroll = function() {
                $item.find('.content-container').scroll(_.debounce(
                    function() {
                        scope.$emit(events.REFLOW_PINBOARD);
                    },
                    scrollDebounceTime
                ));
            }
        }

        return {
            restrict: 'E',
            scope: {
                type: '=',
                metadataConfig: '=',
                sageSearchOnInit: '='
            },
            link: linker,
            controller: 'SharableItemController',
            templateUrl: 'src/modules/sharable-item/sharable-item.html'
        };
    }]);
