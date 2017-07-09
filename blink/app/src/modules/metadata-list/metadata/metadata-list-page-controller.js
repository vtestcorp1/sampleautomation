/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview
 */

'use strict';

/* eslint max-params: 1 */
blink.app.factory('MetadataListController', ['$q',
    '$rootScope',
    '$timeout',
    'alertConstants',
    'alertService',
    'blinkConstants',
    'CancelablePromise',
    'debugInfoCollector',
    'env',
    'events',
    'exportDialog',
    'importDialog',
    'jsonConstants',
    'PaginatedListModel',
    'loadingIndicator',
    'metadataService',
    'metadataPermissionService',
    'metadataUtil',
    'ShareDialogComponent',
    'serviceNames',
    'sessionService',
    'strings',
    'UserAction',
    'userDialogs',
    function($q,
             $rootScope,
             $timeout,
             alertConstants,
             alertService,
             blinkConstants,
             CancelablePromise,
             debugInfoCollector,
             env,
             events,
             exportDialog,
             importDialog,
             jsonConstants,
             PaginatedListModel,
             loadingIndicator,
             metadataService,
             metadataPermissionService,
             metadataUtil,
             ShareDialogComponent,
             serviceNames,
             sessionService,
             strings,
             UserAction,
             userDialogs) {

        var BATCH_SIZE = blinkConstants.METADATA_PAGE_SIZE;
        var alertStrings = strings.alert;
        var debugInfo;

        function MetadataListController(metadataListStrings,
                                        metadataType,
                                        columns,
                                        filters,
                                        actionItems,
                                        onRowClick,
                                        onRefresh,
                                        stickers,
                                        sortKey,
                                        sortReverse,
                                        autoCreated
        )
        {
            this.onRowClick = onRowClick;
            this.metadataType = metadataType;
            this.strings = metadataListStrings;
            this.filters = filters;
            this.actionItems = actionItems;
            this.columns = columns;
            this.onRefresh = onRefresh;
            this.sortKey = sortKey || jsonConstants.metadataTypeSort.MODIFIED;
            this.sortReverse = sortReverse !== false;
            this.stickers = stickers;
            this.autoCreated = autoCreated;
            this.lastRefreshStopped = false;
            this.lastRefreshPromise = $q.when();
            this.init();
        }

        MetadataListController.prototype.init = function () {
            var self = this;

            this.listModel = new PaginatedListModel(
                this.columns,
                BATCH_SIZE,
                this.onPaginate.bind(this),
                this.onFiltering.bind(this),
                this.titleFunction.bind(this),
                true, /* selection-enabled */
                true,  /* header-enabled */
                this.sortKey,
                this.sortReverse
            );

            var startTime = (new Date()).getTime();

            debugInfo = {
                type: 'listRender',
                timestamp: startTime,
                url: this.metadataType
            };

            this.onShareItemClear = function() {
                self.showShareDialog = false;
            };

            this.refreshList();
        };

        MetadataListController.prototype.titleFunction = function(items, page) {
            if (!items || !items.length) {
                return this.strings.noItems;
            } else {
                var from = page * BATCH_SIZE + 1;
                var to = page * BATCH_SIZE + _.min([BATCH_SIZE, items.length]);
                return from + " - " + to;
            }
        };

        MetadataListController.prototype.onListRenderCallback = function () {
            if (!!debugInfo) {
                debugInfoCollector.collect(serviceNames.RENDER, debugInfo);
                debugInfo = null;
            }
        };

        MetadataListController.prototype.filterFunction = function(item, filterText) {
            var filtered = this.filters.every(function(filter) {
                return filter.isFiltered(item);
            });
            var stickered = this.stickers.isLabelledWith(item);
            var regex = new RegExp(filterText.escapeRegExp(), 'gi');
            var nameMatched = item.name.match(regex);

            return filtered && stickered && nameMatched;
        };

        MetadataListController.prototype.filterData = function() {
            this.listModel.clearSearchText();
            this.listModel.filterData();
        };

        MetadataListController.prototype.onLabelDeleted = function() {
            this.refreshList();
        };

        MetadataListController.prototype.getData = function() {
            return this.listModel.getData();
        };

        MetadataListController.prototype.processHeaders = function(headers) {
            return headers;
        };

        MetadataListController.prototype.loadData = function(pageNumber) {
            if (!!this.loadDataPromise) {
                this.loadDataPromise.cancel();
            }

            var fetchListUserAction = new UserAction(UserAction.FETCH_METADATA_LIST);

            var page = (pageNumber === void 0) ? 0 : pageNumber;

            var pattern = '%{1}%'.assign(this.listModel.getSearchText());

            var params = {
                offset: page * BATCH_SIZE,
                batchSize: BATCH_SIZE,
                pattern: pattern,
                skipIds: blinkConstants.GUIDS_TO_SKIP,
                autoCreated: this.autoCreated
            };

            if (!!this.listModel.getSortKey()) {
                params.sort = this.listModel.getSortKey();
                params.sortAscending = !this.listModel.isSortedReverse();
            }

            this.filters.forEach(function(filter) {
                params[filter.getKey()] = filter.getValue();
            });

            if (!!this.stickers) {
                params[this.stickers.getKey()] = this.stickers.getValue();
            }

            var self = this;

            this.loadDataPromise = new CancelablePromise(metadataService.getMetadataList(this.metadataType, params));

            return this.loadDataPromise
                .then(function(response) {
                    return response.data;
                }, function(response) {
                    alertService.showUserActionFailureAlert(fetchListUserAction, response);
                    return $q.reject(response.data);
                })
                .then(function(data) {
                    if (!data || !data.headers) {
                        return $q.reject(data);
                    }

                    var items = self.processHeaders(data.headers);

                    var hasMoreData = !data.isLastBatch;

                    self.listModel.setData(items, hasMoreData, page);
                    self.listModel.filterData();
                    if (_.isFunction(self.onRefresh)) {
                        self.onRefresh();
                    }
                    return items;
                });
        };

        MetadataListController.prototype.loadPermissions = function() {
            var self = this;
            var fetchPermissionUserAction = new UserAction(UserAction.FETCH_METADATA_PERMISSIONS);

            var items = self.listModel.getData();

            if (!items.length) {
                return $q.resolve({});
            }

            return metadataPermissionService.getEffectivePermissions(items, self.metadataType)
                .then(function(response) {
                    self.permissions = response.data;
                    return items;
                }, function(response) {
                    alertService.showUserActionFailureAlert(fetchPermissionUserAction, response);
                    return $q.reject(response.data);
                });
        };


        MetadataListController.prototype.onPaginate = function(pageNumber) {
            return this.refreshList(pageNumber);
        };

        MetadataListController.prototype.onFiltering = function() {
            this.listModel.page = 0;
            this.refreshList();
        };

        MetadataListController.prototype.refreshList = function(pageNumber, hideLoadingIndicator) {
            var showLoadingIndicator = true;
            if (hideLoadingIndicator === true) {
                showLoadingIndicator = false;
            }
            if (showLoadingIndicator) {
                loadingIndicator.show();
            }

            var self = this;
            return self.loadData(pageNumber)
                .then(self.loadPermissions.bind(self))
                .finally(function () {
                    if (showLoadingIndicator) {
                        loadingIndicator.hide();
                    }
                });
        };

        MetadataListController.prototype.canDelete = function(items) {
            return metadataPermissionService.isDeletable(items, this.metadataType, null, this.permissions);
        };

        MetadataListController.prototype.canShare = function(items) {
            return metadataPermissionService.isShareable(items, this.metadataType, null);
        };

        MetadataListController.prototype.canTag = function(items) {
            return metadataPermissionService.isTaggable(items, this.permissions);
        };

        MetadataListController.prototype.canExport = function(items) {
            return metadataPermissionService.isShareable(items, this.metadataType, null);
        };

        MetadataListController.prototype.fetchCustomDataForDialog = function(items, metadataType) {
            return null;
        };

        var onRefreshTimeOutHelper = function (self) {
            if (self.listModel.getSelectedItems().length != 0) {
                return;
            }
            return self.refreshList(
                self.listModel.page, true /* hide loading indicator */);
        };

        MetadataListController.prototype.onRefreshTimeout = function(refreshms) {
            if (refreshms <= 0) {
                return;
            }

            var self = this;
            if (this.lastRefreshStopped) {
                return;
            }

            this.lastRefreshPromise = this.lastRefreshPromise
                .finally(function () {
                    return $timeout(function () {
                        // do nothing
                    }, refreshms, true)
                        .finally(function () {
                            return onRefreshTimeOutHelper(self)
                                .finally(function () {
                                    return self.onRefreshTimeout(refreshms);
                                })
                        });
                });
        };

        MetadataListController.prototype.destroy = function() {
            this.lastRefreshStopped = true;
        };

        MetadataListController.prototype.showConfirmDeleteDialog = function(items) {
            var messages =  alertStrings.dataDeletionAlertMessages.withoutContent;
            var displayNameForMetadataType = metadataUtil.getDisplayNameForMetadataType(this.metadataType);
            var singular = items.length === 1,
                message = singular ? messages.singular.assign({itemName: items[0].name})
                    : messages.plural.assign({itemType: displayNameForMetadataType});
            var customDataObj = this.fetchCustomDataForDialog(items, this.metadataType);
            var dialogPromise = userDialogs.showMetadataListDeleteDialog(message, customDataObj);
            return dialogPromise;
        };

        MetadataListController.prototype.onDeleteAction = function(items) {
            this.showConfirmDeleteDialog(items)
                .then(this.delete.bind(this, items))
                .then(this.refreshList.bind(this));
        };

        MetadataListController.prototype.delete = function(items) {
            var self = this;
            var ids = items.map(function(item) {
                return item.id;
            });

            var userAction = this.getDeleteUserAction();
            return metadataService.deleteMetadataItems(ids, this.metadataType)
                .then(function (response) {
                    alertService.showUserActionSuccessAlert(userAction, response);
                    return response.data;
                }, function (response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                    return $q.reject(response.data);
                })
                .finally(loadingIndicator.hide);
        };

        MetadataListController.prototype.getDeleteUserAction = function() {
            return new UserAction(UserAction.DELETE_METADATA_ITEMS);
        };

        MetadataListController.prototype.share = function(items) {
            var isBulkShare = (items.length > 1),
                objects = items.map(function (item) {
                    var object = { id: item.id };
                    object.subtype = item.type;
                    if (!isBulkShare) {
                        object.name = item.name;
                        object.authorId = item.author;
                    }
                    return object;
                });
            var shareDialogConfig = {
                objects: objects,
                type: this.metadataType
            };
            this.shareDialogComponent = new ShareDialogComponent(
                shareDialogConfig,
                this.onShareItemClear.bind(this));
            this.showShareDialog = true;
        };

        MetadataListController.prototype.export = function(items) {
            var metadataObjects = items.map(function (item) {
                var object = { id: item.owner };
                object.tags = item.tags.map(function(tag) {
                    return tag.name;
                });
                return object;
            });
            exportDialog.show(metadataObjects, this.metadataType);
        };

        MetadataListController.prototype.import = function() {
            importDialog.show(this.metadataType).then(this.refreshList.bind(this));
        };

        MetadataListController.prototype.assignTag = function(label) {
            var self = this;
            var items = this.listModel.getSelectedItems();
            var labelIds = [label.getId()];
            var ids = items.map(function(item) {
                return item.id;
            });

            var userAction = new UserAction(UserAction.ASSIGN_TAG);
            return metadataService.assignTag(ids, this.metadataType, labelIds)
                .then(function (response) {
                    alertService.showUserActionSuccessAlert(userAction, response);
                    return response.data;
                }, function (response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                    return $q.reject(response.data);
                })
                .then(function() {
                    return self.refreshList();
                });
        };

        MetadataListController.prototype.unassignTag = function(item, label) {
            var self = this;
            var labelIds = [label.getId()];
            var ids = [item.id];

            var userAction = new UserAction(UserAction.UNASSIGN_TAG);
            return metadataService.unAssignTag(ids, this.metadataType, labelIds)
                .then(function (response) {
                    alertService.showUserActionSuccessAlert(userAction, response);
                    return response.data;
                }, function (response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                    return $q.reject(response.data);
                })
                .then(function() {
                    return self.refreshList();
                });
        };

        MetadataListController.prototype.showHeader = function () {
            return this.headerTitle
                || (this.filters && this.filters.length)
                || this.dropdownMenu;
        };

        return MetadataListController;
    }]);
