/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com), Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Controller for the "Sources" panel component of the data panel.
 */

'use strict';

/* eslint max-params: 1 */
blink.app.controller('SageDataSourcesController', ['$rootScope',
    '$scope',
    '$q',
    'alertService',
    'Logger',
    'util',
    'dateUtil',
    'events',
    'metadataService',
    'sessionService',
    'jsonConstants',
    'alertConstants',
    'blinkConstants',
    'strings',
    'dataExplorerLauncher',
    'actionablePopupService',
    'labelsService',
    'worksheetBuilder',
    'session',
    '$route',
    'autoCompleteObjectUtil',
    'UserAction',
    'sageDataScopeService',
    'RadioButtonComponent',
    'CheckboxComponent',
    'checkbox',
    function ($rootScope,
              $scope,
              $q,
              alertService,
              Logger,
              util,
              dateUtil,
              events,
              metadataService,
              sessionService,
              jsonConstants,
              alertConstants,
              blinkConstants,
              strings,
              dataExplorerLauncher,
              actionablePopupService,
              labelsService,
              worksheetBuilder,
              session,
              $route,
              autoCompleteObjectUtil,
              UserAction,
              sageDataScopeService,
              RadioButtonComponent,
              CheckboxComponent,
              checkbox) {
        var _logger = Logger.create('sage-data-sources-controller');

        var metadataSubtypes = jsonConstants.metadataType.subType;

        var headerLabels = {
            readonly: strings.dataPanel.SELECTED_SOURCES
        };
        headerLabels[metadataSubtypes.WORKSHEET] = strings.WORKSHEETS;
        headerLabels[metadataSubtypes.IMPORTED_DATA] = strings.IMPORTED_DATA;
        headerLabels[metadataSubtypes.SYSTEM_TABLE] = strings.TABLES;

    // Map from id to boolean which is true if selected
        var selectedIdsMap = {};

        var config = session.getBackendConfig(),
            queryOnQueryEnabled = config && config.enableDbView;

        $scope.isSelectedFilterApplied = false;
        $scope.selectAllCheckboxCtrl = new CheckboxComponent('All', function () {
            if ($scope.allItemsSelected($scope.visibilityFilter)) {
                return checkbox.CheckboxState.CHECKED;
            } else if (!$scope.noItemsSelected($scope.visibilityFilter)) {
                return checkbox.CheckboxState.PARTIAL;
            }
            return checkbox.CheckboxState.UNCHECKED;
        }).setTriStateMode(true)
            .setOnClick(function ($event) {
                $scope.toggleItemsSelection($scope.visibilityFilter, $event);
            });

        $scope.deselectDisabledItemIdsHash = {};

    // Map from id to boolean which is true if selected. This stores the currently selected items when the dialog is
    // in a open state. This is useful if the user cancels the action in which case we dont want to change the selectedIdsMap map.
        $scope.tempSelectedIdsMap = {};

        $scope.lists = [];

        $scope.needsJoinTypeFooter = false;

        var worksheetQueryTypesInfo = [{
            type: jsonConstants.queryJoinType.FULL_OUTER,
            label: strings.queryJoinType.labels.FULL_OUTER,
            description: strings.queryJoinType.descriptions.FULL_OUTER
        }, {
            type: jsonConstants.queryJoinType.LEFT_OUTER,
            label: strings.queryJoinType.labels.LEFT_OUTER,
            description: strings.queryJoinType.descriptions.LEFT_OUTER
        }, {
            type: jsonConstants.queryJoinType.RIGHT_OUTER,
            label: strings.queryJoinType.labels.RIGHT_OUTER,
            description: strings.queryJoinType.descriptions.RIGHT_OUTER
        }, {
            type: jsonConstants.queryJoinType.INNER,
            label: strings.queryJoinType.labels.INNER,
            description: strings.queryJoinType.descriptions.INNER
        }];

        $scope.worksheetQueryTypes = worksheetQueryTypesInfo.map(function (queryTypeInfo) {
            return {
                radioBtnCtrl: new RadioButtonComponent(
                    queryTypeInfo.label,
                    function () {
                        return $scope.isCurrentQueryType(queryTypeInfo);
                    },
                    function () {
                        $scope.setCurrentQueryType(queryTypeInfo);
                    }
                ),
                description: queryTypeInfo.description
            };
        });

        $scope.worksheetTypes = [{
            type: jsonConstants.worksheetType.CONTAINER,
            label: strings.worksheetType.labels.CONTAINER
        }, {
            type: jsonConstants.worksheetType.VIEW,
            label: strings.worksheetType.labels.VIEW
        }].map(function (wsType) {
            return new RadioButtonComponent(
                wsType.label,
                function () {
                    return $scope.isCurrentWorksheetType(wsType)
                },
                function() {
                    $scope.setCurrentWorksheetType(wsType);
                }
            );
        });

        $scope.getSelectedSourcesCount = function() {
            return Object.keys($scope.tempSelectedIdsMap).filter(function (itemId) {
                return $scope.tempSelectedIdsMap[itemId];
            }).length;
        };
        $scope.getTooltip = function(item) {
            var tooltipData = new util.NameValuePairs();

            tooltipData.add('NAME', item.name);
            tooltipData.add('AUTHOR', item.authorDisplayName);
            tooltipData.add('CREATED', dateUtil.epochToTimeAgoString(item.created));
            tooltipData.add('UPDATED', dateUtil.epochToTimeAgoString(item.modified));

            if (!!item.databaseStripe) {
                tooltipData.add('DATABASE', item.databaseStripe);
            }

            if (!!item.schemaStripe) {
                tooltipData.add('SCHEMA', item.schemaStripe);
            }

            return tooltipData.getTemplate();
        };

    // HACK(vibhor/shikhar): We need to figure out how one distinct component can manage / pass parameters that are needed
    // by service calls made in another component (SageController).
        $rootScope.currentQueryJoinType = null;
        $rootScope.currentWorksheetType = null;

        function closeDialog() {
            $scope.showDialog = false;

            if (isInsideAdHocAnswerPage()) {
                var selectedItems = $scope.panelComponent.getDataSources();
                sessionService.setSageDataSource(selectedItems);
            }
        }

        $scope.isCurrentQueryType = function (queryType) {
            queryType = queryType.type;

            if (!$scope.panelComponent || !$scope.panelComponent.getDocumentConfig() ||
            !$scope.panelComponent.getDocumentConfig().model) {

                if ($rootScope.currentQueryJoinType) {
                    return queryType === $rootScope.currentQueryJoinType;
                }
                return queryType === jsonConstants.queryJoinType.INNER;
            }

            return $scope.panelComponent.getDocumentConfig().model.getQueryJoinType() === queryType;
        };

        $scope.isCurrentWorksheetType = function (worksheetType) {
            var wType = worksheetType.type;

            if (!$scope.panelComponent || !$scope.panelComponent.getDocumentConfig() ||
            !$scope.panelComponent.getDocumentConfig().model) {

                if ($rootScope.currentWorksheetType) {
                    return wType === $rootScope.currentWorksheetType;
                }
                return wType === jsonConstants.worksheetType.CONTAINER;
            }

            return $scope.panelComponent.getDocumentConfig().model.getWorksheetType() === wType;
        };

        $scope.setCurrentQueryType = function (queryType) {
        // Don't allow changing of query type on a readonly worksheet.
            if ($scope.panelComponent.isReadOnly()) {
                return;
            }

            queryType = queryType.type;
        // save the query type such that it can be used when worksheet request is made.
            $rootScope.currentQueryJoinType = queryType;

            if (!$scope.panelComponent || !$scope.panelComponent.getDocumentConfig() ||
            !$scope.panelComponent.getDocumentConfig().model) {
                return;
            }

            $scope.panelComponent.getDocumentConfig().model.setQueryJoinType(queryType);

            worksheetBuilder.updateWorksheetModel($scope.panelComponent.getDocumentConfig());
        };

        $scope.setCurrentWorksheetType = function (worksheetType) {
            if ($scope.panelComponent.isReadOnly()) {
                return;
            }

            var wType = worksheetType.type;
        // save the query type such that it can be used when worksheet request is made.
            $rootScope.currentWorksheetType = wType;

            if (!$scope.panelComponent || !$scope.panelComponent.getDocumentConfig() ||
            !$scope.panelComponent.getDocumentConfig().model) {
                return;
            }

            $scope.panelComponent.getDocumentConfig().model.setWorksheetType(wType);

            worksheetBuilder.updateWorksheetModel($scope.panelComponent.getDocumentConfig());
        };

        $scope.hasAdminPrivileges = sessionService.hasAdminPrivileges();

        function getCurrentQueryJoinType() {
            if (!$scope.panelComponent || !$scope.panelComponent.getDocumentConfig() ||
            !$scope.panelComponent.getDocumentConfig().model) {
                return null;
            }

            return $scope.panelComponent.getDocumentConfig().model.getQueryJoinType() || null;
        }

        function getCurrentWorksheetType() {
            if (!$scope.panelComponent || !$scope.panelComponent.getDocumentConfig() ||
            !$scope.panelComponent.getDocumentConfig().model) {
                return null;
            }

            return $scope.panelComponent.getDocumentConfig().model.getWorksheetType() || null;
        }

        $scope.getCurrentQueryTypeLabel = function () {
            var queryJoinType = getCurrentQueryJoinType();
            if (!queryJoinType) {
                return '';
            }
            return strings.queryJoinType.labels[queryJoinType] || '';
        };

        $scope.getCurrentQueryTypeDescription = function () {
            var queryJoinType = getCurrentQueryJoinType();
            if (!queryJoinType) {
                return '';
            }
            return strings.queryJoinType.descriptions[queryJoinType] || '';
        };

        $scope.getCurrentWorksheetTypeLabel = function () {
            var wType = getCurrentWorksheetType();
            if (!wType) {
                return '';
            }
            return strings.worksheetType.labels[wType] || '';
        };

        function isItemSelectionChangeRestricted(item) {
            return !!($scope.deselectDisabledItemIdsHash && $scope.deselectDisabledItemIdsHash[item.id]);
        }

        function isItemSelectionChangeAllowed(item) {
            return !$scope.panelComponent.isReadOnly() &&
            (!$scope.tempSelectedIdsMap[item.id] || !isItemSelectionChangeRestricted(item));
        }

        function commitSuppressInUseSourceRemovalWarningPref() {
            sessionService.setPreference(blinkConstants.preferenceKeys.SUPPRESS_IN_USE_SOURCE_REMOVAL_WARNING, true);
        }

        function shouldWarnOnInUseSourceRemoval() {
            return !sessionService.getPreference(blinkConstants.preferenceKeys.SUPPRESS_IN_USE_SOURCE_REMOVAL_WARNING);
        }

        function itemIsSelected(item) {
            return !!$scope.tempSelectedIdsMap[item.id];
        }

    /**
     *
     * @param item
     * @param {boolean=} updateSelectedIds whether to update the state on selected item ids. To be turned off
     *                   when toggling items in a batch to avoid multiple calls to setSelectedIds call
     */
        function toggleItemSelection(item, updateSelectedIds) {
            $scope.tempSelectedIdsMap[item.id] = !$scope.tempSelectedIdsMap[item.id];
        //if an item is de-selected we guarantee that it can't be
        //a part of sage query any more. hence there can be no
        //restrictions on it being de-selectable until the scope
        //selection popup is closed and sage query is changed
            if (!$scope.tempSelectedIdsMap[item.id]) {
                delete $scope.deselectDisabledItemIdsHash[item.id];
            }

            if (!!updateSelectedIds) {
                setSelectedIds();
            }
        }

    /**
     *
     * @param params
     *        $popupAnchor: the $domNode that the popup will be anchored near
     *        restrictedItems: the list items that may not be unselected without user
     *                         confirmation. if the user cancels, they stay selected
     *        unrestrictedItems: the list items that get de-selected regardless of the
     *                           user's choice. we only delay their de-selection and
     *                           don't prevent them. delay is for UX reasons
     *        finallyCallback (optional): a function to be called after the user has either
     *                                    cancelled or confirmed the de-selection
     */
        function confirmItemDeSelection(params) {
            var $popupAnchor = params.$popupAnchor,
                restrictedItems = params.restrictedItems,
                unrestrictedItems = params.unrestrictedItems || [],
                finallyCallback = params.finallyCallback || angular.noop;

            if (restrictedItems.length === 0) {
                return;
            }

            var message,
                actionButtonText,
                cancelButtonText,
                messageTemplates = strings.alert.dataSourceAlertMessages;

            var documentType = $scope.panelComponent.getDocumentConfig().type;
            var itemNames = restrictedItems.map(function(restrictedItem){
                return '<b>{1}</b>'.assign(restrictedItem.name);
            });
            var isAnswerDocument = documentType === blinkConstants.documentType.ANSWER
            || documentType === blinkConstants.documentType.SAVED_ANSWER;

            var clearedEntityName = documentType.toLowerCase();

            if (isAnswerDocument) {
                clearedEntityName = 'search';
            }

            if (itemNames.length <= 1) {
                message = messageTemplates.alertText.assign({
                    sourceText: itemNames[0],
                    clearedEntityName: clearedEntityName
                });
                actionButtonText = messageTemplates.actionButtonText;
                cancelButtonText = messageTemplates.cancelButtonText.singular;
            } else {
                message = messageTemplates.alertText.assign({
                    sourceText: util.joinNames(itemNames, 3, 'source'),
                    clearedEntityName: clearedEntityName
                });
                actionButtonText = messageTemplates.actionButtonText;
                cancelButtonText = messageTemplates.cancelButtonText.plural;
            }

            function deselectUnrestrictedItems() {
                unrestrictedItems.each(function(item){
                    $scope.tempSelectedIdsMap[item.id] = false;
                    delete $scope.deselectDisabledItemIdsHash[item.id];
                });
                setSelectedIds();
            }

            actionablePopupService.show({
                $anchor: $popupAnchor,
                popupText: message,
                onAction: function(doNotShowAgain){
                    deselectUnrestrictedItems();
                    restrictedItems.each(function(item){
                        toggleItemSelection(item, false);
                    });

                    setSelectedIds();

                    if (isAnswerDocument) {
                        var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();
                        tableRequest.setInputTokens([]);

                        var sageClient = $scope.panelComponent.getSageClient();
                        sageClient.editTable(tableRequest);
                    } else {
                        $scope.$root.$broadcast(events.REMOVE_ALL_WORKSHEET_COLUMNS_D);
                    }

                    if (doNotShowAgain) {
                        commitSuppressInUseSourceRemovalWarningPref();
                    }

                //SCAL-14447. Once the question/wks is cleared, we can allow deselection of all items
                    $scope.deselectDisabledItemIdsHash = {};

                    finallyCallback();
                },
                onCancel: function(doNotShowAgain){
                    deselectUnrestrictedItems();
                    if (doNotShowAgain) {
                        commitSuppressInUseSourceRemovalWarningPref();
                    }
                    finallyCallback();
                },
                showSuppressOption: false,
                actionButtonText: actionButtonText,
                cancelButtonText: cancelButtonText
            });
        }

    /**
     * Select a single item
     * @param list
     * @param item
     */
        $scope.selectItem = function ($event, list, item) {
        //selection is currently always okay, only de-selection
        //has restrictions
            if (!itemIsSelected(item)) {
                toggleItemSelection(item, true);
                return;
            }

            if (isItemSelectionChangeAllowed(item) || !shouldWarnOnInUseSourceRemoval()) {
                toggleItemSelection(item, true);
                return;
            }

            if (isItemSelectionChangeRestricted(item)) {
                confirmItemDeSelection({
                    $popupAnchor: $scope.getConfirmationPopupAnchor($event),
                    restrictedItems: [item],
                    unrestrictedItems: []
                });
            }
        };

        $scope.selectAllItems = function ($event, list) {
            var isListSelected = !list._selected;
            var unrestrictedItems = [],
                restrictedItems = [];
            list.data.forEach(function (item) {
                var isChangeAllowed = isListSelected || isItemSelectionChangeAllowed(item);
                if (isChangeAllowed) {
                    unrestrictedItems.push(item);
                } else {
                    restrictedItems.push(item);
                }
            });

            if (restrictedItems.length > 0) {
                confirmItemDeSelection({
                    $popupAnchor: $scope.getConfirmationPopupAnchor($event),
                    restrictedItems: restrictedItems,
                    unrestrictedItems: unrestrictedItems,
                    finallyCallback: function () {
                        list._selected = isListSelected;
                        setSelectedIds();
                    }
                });
            } else {
                list._selected = isListSelected;
                unrestrictedItems.each(function(item){
                    $scope.tempSelectedIdsMap[item.id] = isListSelected;
                });
                setSelectedIds();
            }
        };

        $scope.hasItems = function(filter) {
            return $scope.lists.any(function(item) {
                return item.data.filter(filter).length > 0;
            });
        };

        $scope.allItemsSelected = function(filter) {
            return $scope.hasItems(filter) && $scope.lists.every(function(item) {
                return item.data.filter(filter).every(function(item) {
                    return $scope.tempSelectedIdsMap[item.id];
                });
            });
        };

        $scope.noItemsSelected = function(filter) {
            return $scope.lists.every(function(item) {
                return item.data.filter(filter).every(function(item) {
                    return !$scope.tempSelectedIdsMap[item.id];
                });
            });
        };

    /**
     * Applies selection to all the filtered sources
     * @param selected : true to mark all as selected, false for unselected.
     * @param filter
     * @param $event
     */
        function applyItemSelection (selected, filter, $event) {
            var list = $scope.lists.map(function(item) {
                return item.data;
            }).flatten().filter(filter);
            var unrestrictedItems = [],
                restrictedItems = [];
            list.forEach(function (item) {
                var isChangeAllowed = selected || isItemSelectionChangeAllowed(item);
                if (isChangeAllowed) {
                    unrestrictedItems.push(item);
                } else {
                    restrictedItems.push(item);
                }
            });

            if (restrictedItems.length > 0) {
                confirmItemDeSelection({
                    $popupAnchor: $scope.getConfirmationPopupAnchor($event),
                    restrictedItems: restrictedItems,
                    unrestrictedItems: unrestrictedItems,
                    finallyCallback: setSelectedIds
                });
            } else {
                unrestrictedItems.each(function(item){
                    $scope.tempSelectedIdsMap[item.id] = selected;
                });
                setSelectedIds();
            }
        }

    /**
     * Toggles item selection matching the input filter.
     * if any item is selected it deselects them and if none if selected, it selects all.
     * @param filter
     * @param $event
     */
        $scope.toggleItemsSelection = function(filter, $event) {
            var select = $scope.noItemsSelected(filter);
            applyItemSelection(select, filter, $event);
        };

    /**
     * De selects item selection matching the input filter.
     * if any item is selected it deselects them.
     * @param filter
     * @param $event
     */
        $scope.clearItemsSelection = function(filter, $event) {
            if (!$scope.noItemsSelected(filter)) {
                applyItemSelection(false, filter, $event);
            }
        };

        function getInitIds(){
            var initIds = [];
            if (!!$scope.panelComponent) {
                var documentConfig = $scope.panelComponent.getDocumentConfig();
                var inputSources = util.prop(documentConfig, 'sageDataSourcesConfig.sources');
                if (!!inputSources) {
                    return inputSources;
                }
            // Note we dont want to use sources from the tokens in answer to determine sources in case
            // of ad-hoc answers.
            // SCAL-10923 Refeshing answer updates the left panel sources
                if (!!documentConfig && documentConfig.model && !isInsideAdHocAnswerPage()) {
                    initIds = documentConfig.model.getSageDataScope() || [];
                } else if (!isInWorksheetPage()){
                    initIds = sessionService.getSageDataSource() || [];
                }
            }
            return initIds;
        }

    /**
     * Sets the initial selected items. If this is a saved document, then we can calculate the minimum scope from the
     * model. Else we set the items from user preferences
     * @param lists
     */
        function setInitSelectedItems(lists) {
            $scope.tempSelectedIdsMap = {};

            var initIds = getInitIds();

            var initIdsMap = util.mapArrayToBooleanHash(initIds);
        // There might be a case that some of the ids from initIds may have been deleted or permissions might have been
        // taken away. So here we store the intersection of initIds and ids in the lists in tempSelectedIdMap.
        // We then call closeDialog which updates ids in user preference and sets the correct ids on $rootScope and panel.
            lists.forEach(function (list) {
                list.data.forEach(function (item) {
                    if (!!initIdsMap[item.id]) {
                        $scope.tempSelectedIdsMap[item.id] = true;
                    }
                });
            });

            setSelectedIds();
        }

        $scope.labelsRegistry = labelsService.labelsRegistry;
        $scope.listOfLabelFilters = [];
        $scope.onLabelClicked = function (label) {
            $scope.isSelectedFilterApplied = false;
            $scope.selectAllCheckboxCtrl.setLabel(label.name);
            $scope.searchText = '';
            var filter = $scope.listOfLabelFilters.find(function(name) {
                return name === label.getName();
            });
            if (!!filter) {
                $scope.onSelectionFilterChanged(false);
            } else {
                $scope.listOfLabelFilters = [label.getName()];
            }
        };

        $scope.onSelectionFilterChanged = function(selected) {
            $scope.selectAllCheckboxCtrl.setLabel(selected ? 'Selected' : 'All');
            $scope.searchText = '';
            $scope.listOfLabelFilters = [];
            $scope.isSelectedFilterApplied = selected;
            $rootScope.$broadcast(events.RESET_LABEL_SELECTION_D);
        };

        function getMetadataListPromise(type, subtypes) {
            var userAction = new UserAction(UserAction.FETCH_METADATA_LIST);
            return metadataService.getMetadataList(type, {subTypes: subtypes}).
            then(function(response) {
                return response.data;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        }

    /**
     * Update Source lists.
     */
        function refreshLists() {
            $scope.waitingForSourcesListToLoad = true;
            $scope.errorLoadingSourcesList = false;
            var typesToShow = [
                metadataSubtypes.IMPORTED_DATA,
                metadataSubtypes.SYSTEM_TABLE
            ];
            var typesToFetch = typesToShow.slice(0);

            var config = $scope.panelComponent.getDocumentConfig();
            var isNotWorksheetSources = config
                && config.type.toLowerCase() !== blinkConstants.WORKSHEET_TYPE;
            if (isNotWorksheetSources) {
                typesToShow.unshift(metadataSubtypes.WORKSHEET);
                typesToFetch.unshift(metadataSubtypes.WORKSHEET);
                typesToFetch.unshift(metadataSubtypes.AGGR_WORKSHEET);
            } else {
                if (sessionService.isWorksheetOverAggregatedWorksheetEnabled()) {
                    typesToShow.unshift(metadataSubtypes.WORKSHEET);
                    typesToFetch.unshift(metadataSubtypes.AGGR_WORKSHEET);
                }
            }
            return getMetadataListPromise(
            jsonConstants.metadataType.LOGICAL_TABLE,
            typesToFetch
        ).then(function (response) {
            $scope.waitingForSourcesListToLoad = false;
            var sourcesBySubtype = response.headers.reduce(function(sources, object) {
                // NOTE: We would like to bundle the aggregated and unaggreageted worksheets into Worksheets.
                var type = (object.type === metadataSubtypes.AGGR_WORKSHEET) ?
                    metadataSubtypes.WORKSHEET : object.type;

                sources[type] = sources[type] || [];
                sources[type].push(object);
                return sources;
            }, {});

            var lists = typesToShow.map(function(type) {
                var data = sourcesBySubtype[type] || [];
                return {
                    headerLabel: headerLabels[type],
                    data: data.sortBy('name')
                };
            });

            // Set initial selected items
            lists.forEach(function(list) {
                list.data.forEach(function(item) {
                    item.tooltip = $scope.getTooltip(item);
                    item.checkboxCtrl = new CheckboxComponent(item.name, function() {
                        return !!$scope.tempSelectedIdsMap[item.id];
                    }).setShouldTruncate(true)
                        .setOnClick(function($event) {
                            $scope.selectItem($event, list, item);
                        });
                });
            });
            $scope.lists = $rootScope.sageDataSources = lists;
            setInitSelectedItems(lists);
        }, function () {
            $scope.waitingForSourcesListToLoad = false;
            $scope.errorLoadingSourcesList = true;
            _logger.error('Callosum requests to fetch list of sources failed with error', arguments);
            return $q.reject();
        });
        }

        var selectedItemsFilter = function(element) {
            if (!$scope.isSelectedFilterApplied) {
                return true;
            } else {
                return sageDataScopeService.isSourceSelected(element.id);
            }
        };

        var labelsFilter = function(element) {
            if (!$scope.listOfLabelFilters.length) {
                return true;
            } else {
            // Relying on the fact that there is only one label selection allowed currently
                var selectedLabelName = $scope.listOfLabelFilters[0];
                return element.tags.find(function(tag) {
                    return (tag.name == selectedLabelName);
                });
            }
        };

        var textFilter = function(element) {
            if (!$scope.searchText) {
                return true;
            } else {
                return element.name.toLowerCase().indexOf($scope.searchText.toLowerCase()) > -1;
            }
        };

        $scope.pageFilter = function(element) {
            return selectedItemsFilter(element) && labelsFilter(element);
        };

        $scope.visibilityFilter = function(element) {
            return (selectedItemsFilter(element) && labelsFilter(element) && textFilter(element));
        };

    // This function sets up left panel with sources already in use in the answer model.
    // This also adds columns to those sources based on the names in sage tokens.
        function updateListsFakeSourcesMode() {
            var model = $scope.panelComponent.getDocumentConfig().model;

            if (!model) {
                _logger.warn('Data sources opened in read only mode with no model');
                return;
            }

            var recognizedTokens = model.getRecognizedTokens();

            if (!recognizedTokens || !recognizedTokens.length) {
                _logger.warn('Data sources opened in read only mode with model with no recognized tokens');
                return;
            }

            var sourceIds = {};
            var sources = [];

            recognizedTokens.filter(function (rt) {
                return (rt.isDataToken()) && !!rt.getTableGuid();
            }).forEach(function (rt) {
                var srcId = rt.getTableGuid();
                if (!sourceIds[srcId]) {
                    sourceIds[srcId] = true;
                    sources.push({
                        id: srcId,
                        name: rt.getTableName()
                    });
                }
            });

            var lists = [{
                headerLabel: headerLabels.readonly,
                data: sources
            }];
            lists.forEach(function(list) {
                list.data.forEach(function(item) {
                    item.checkboxCtrl = new CheckboxComponent(item.id, function() {
                        return !!$scope.tempSelectedIdsMap[item.id];
                    }).setShouldTruncate(true)
                        .setOnClick(function($event) {
                            $scope.selectItem($event, list, item);
                        });
                });
            });
        // Set initial selected items
            $scope.lists = $rootScope.sageDataSources = lists;
            setInitSelectedItems(lists);
        }

        function getSelectedItems() {
            var selectedItems = Object.keys(selectedIdsMap).filter(function (id) {
                return selectedIdsMap[id];
            });

            return selectedItems || [];
        }

        function setSelectedIds() {
            selectedIdsMap = $scope.tempSelectedIdsMap;
            var selectedItems = getSelectedItems();
            $scope.sourcesChangeCallback(selectedItems);

            // Note: Whenever selection is made from the left panel, sageDataScope needs
            // to be updated.
            // In case of answer the data scope is also updated from outside.
            sageDataScopeService.setSources(selectedItems);
            $scope.panelComponent.setDataSources(selectedItems);
        }

        function isInsideAdHocAnswerPage(){
            return $route.current.$$route.canvasState == blinkConstants.ANSWER_TYPE;
        }

        function updateJoinType() {
            var queryJoinType = getCurrentQueryJoinType();
            if (!queryJoinType) {
                return;
            }
            $rootScope.currentQueryJoinType = queryJoinType;
        }

        function updateSelectedIds() {
            var answerModel = $scope.panelComponent.getDocumentConfig().model;
            if (!answerModel) {
                return;
            }

            var recognizedTokens = answerModel.getRecognizedTokens() || [];

            recognizedTokens.each(function(token){
                if (!token.isUnrecognized()) {
                    var tableGuid = token.getTableGuid();
                    if (!!tableGuid) {
                        if (!$scope.tempSelectedIdsMap[tableGuid]) {
                            _logger.debug('automatically adding out of scope data source', tableGuid);
                            $scope.tempSelectedIdsMap[tableGuid] = true;
                        }
                    }
                }
            });

            setSelectedIds();
        }

        function setDeselectDisabledItemIds() {
            var deselectIds = [];
            var docModel = $scope.panelComponent.getDocumentConfig().model;
            if (!!docModel) {
                deselectIds = docModel.getSageDataScope() || [];
            }

            $scope.deselectDisabledItemIdsHash = util.mapArrayToBooleanHash(deselectIds);
        }

        function openDialog() {
            setDeselectDisabledItemIds();
        // We make a copy because the user can cancel his actions
            $scope.tempSelectedIdsMap = angular.copy(selectedIdsMap);
            $scope.lists.forEach(function (list) {
                list._selected = false;
            });

            $scope.showDialog = true;
        }

        function setUpWatchOnModel() {
            $scope.$watch(function () {
                return $scope.panelComponent.getDocumentConfig().model;
            }, function () {
                if (!$scope.panelComponent.documentHasUnderlyingDataAccess()) {
                    updateListsFakeSourcesMode();
                }
            // Out of scope suggestions can cause automatic changes
            // to the list of selected sources
                updateSelectedIds();
                if (isInWorksheetPage()) {
                    updateJoinType();
                }
            });
        }

        function extendPanelComponent() {
            angular.extend($scope.panelComponent, {
                getSubtitle: function () {
                    if (!getSelectedItems().length) {
                        return '+ Add Sources';
                    }
                    return strings.dataPanel.SELECTED_SUBTITLE.assign(getSelectedItems().length);
                },
                onExpansionStateChanged: function () {
                    if (this.isExpanded()) {
                        closeDialog();
                    } else {
                        openDialog();
                    }
                }
            });
        }

        $scope.blinkConstants = blinkConstants;
        $scope.strings = strings;

        $scope.hasAccessToNoDataSources = function () {
            return !sessionService.hasAdminPrivileges()
            && $scope.getSourcesAvailabilityState() == 'NONE';
        };

        $scope.showExplorer = function () {
            if ($scope.hasAccessToNoDataSources()) {
                return;
            }
            dataExplorerLauncher.open({
                mode: blinkConstants.DataExplorerViewModes.PROP_VIEW,
                title: strings.exploreDataTitle
            });
        };

        var SourceListStateTypes = {
            WAITING: 'WAITING',
            AVAILABLE: 'AVAILABLE',
            ERROR: 'ERROR',
            NONE: 'NONE'
        };

        $scope.getSourcesAvailabilityState = function () {
            if ($scope.waitingForSourcesListToLoad) {
                return SourceListStateTypes.WAITING;
            }

            if ($scope.errorLoadingSourcesList) {
                return SourceListStateTypes.ERROR;
            }

            return $scope.noDataSourcesAvailable() ? SourceListStateTypes.NONE : SourceListStateTypes.AVAILABLE;
        };

        $scope.noDataSourcesAvailable = function () {
            return $scope.lists.none(function(list){
                return list.data && list.data.length > 0;
            });
        };

        function isInWorksheetPage() {
            return $scope.panelComponent.getDocumentConfig().type.toLowerCase() === blinkConstants.WORKSHEET_TYPE;
        }

        $scope.init = function () {
            extendPanelComponent();
            var documentConfig;

            util.registerOneShotEventListener($scope, events.LIST_RENDERED_U, function(event) {
                _logger.log('Received LIST_RENDERED event for sage-data-sources-controller.');
                event.stopPropagation();
                $scope.$emit(events.LEFT_PANEL_COMPONENT_RENDERED_U);
            });

            if ($scope.panelComponent) {
                documentConfig = $scope.panelComponent.getDocumentConfig();
                var shouldSetupPanelWithFakeSources = false;
                if (!!documentConfig.model) {
                    var permission = documentConfig.model.getPermission();
                    shouldSetupPanelWithFakeSources = !!permission ? permission.isMissingUnderlyingAccess() : false;
                }
                if (shouldSetupPanelWithFakeSources || !$scope.panelComponent.documentHasUnderlyingDataAccess()) {
                    updateListsFakeSourcesMode();
                    $scope.needsJoinTypeFooter = isInWorksheetPage();
                    setUpWatchOnModel();
                    return;
                }
            }

            refreshLists()
            .then(function() {
                var selectedItems = getSelectedItems();
                $scope.sourcesChangeCallback(selectedItems);
                setUpWatchOnModel();
            });

            $scope.needsJoinTypeFooter = isInWorksheetPage();
        };

        $scope.$on(events.REFRESH_SAGE_DATA_SOURCES_D, refreshLists);
    }]);


blink.app.directive('blinkDataScope', ['Logger', function (Logger) {
    var _logger = Logger.create('data-scope');

    function linker(scope, $el, attrs) {
        scope.init();

        scope.getConfirmationPopupAnchor = function (clickEvent) {
            return $(clickEvent.currentTarget);
        };

        scope.sourcesChangeCallback = scope.sourcesChangeCallback || angular.noop;
    }

    return {
        restrict: 'E',
        replace: true,
        scope: {
            panelComponent: '=component',
            sourcesChangeCallback: '='
        },
        controller: 'SageDataSourcesController',
        templateUrl: 'src/modules/sage/data-panel/sources-panel-component/data-scope.html',
        link: linker
    };
}]);
