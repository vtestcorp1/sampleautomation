/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Controller showing a list of admin items
 */

'use strict';

blink.app.factory('AdminDialogController', ['$q',
    'AdminTabsCollectionController',
    'blinkConstants',
    'strings',
    'env',
    'jsonConstants',
    'metadataService',
    'SmartCheckboxCollectionConfig',
    'SmartCheckboxCollectionController',
    'util',
    function ($q,
          AdminTabsCollectionController,
          blinkConstants,
          strings,
          env,
          jsonConstants,
          metadataService,
          SmartCheckboxCollectionConfig,
          SmartCheckboxCollectionController,
          util) {

        var BATCH_SIZE = isNaN(env.metadataBatchSize) ? 50 : parseInt(env.metadataBatchSize, 10);

        function AdminDialogController(editedItem, isRoleEnabled) {
            this.editedItem = editedItem;
            this.isRoleEnabled = isRoleEnabled;
            this.shouldCollapseFormPanel = false;
            this.strings = strings.adminSection.userManagement;
        }

        AdminDialogController.prototype.getCheckBoxListControllerForItems = function(metadataType,
                                                                                 checkedItems,
                                                                                 readOnlyPredicate)
    {
            var selectedItems = checkedItems.reduce(function(idToCheckbbox, checkbox){
                idToCheckbbox[checkbox.id] = checkbox;
                return idToCheckbbox;
            }, {});
            this.updateSelectedItems(metadataType, selectedItems);
            var oldSearchString = '';
            var storedPromise;

            var checkboxCollectionGetter = function (readOnlyItems, searchString) {
            // send a request to metadata list and return
                var self = this;
                function getPromise() {
                    var pattern = '%{1}%'.assign(searchString);
                    var params = {
                        offset: 0,
                        sort: jsonConstants.metadataTypeSort.NAME,
                        batchSize: BATCH_SIZE,
                        pattern: pattern,
                        skipIds: blinkConstants.GUIDS_TO_SKIP
                    };
                    if (searchString !== oldSearchString || !storedPromise) {
                        storedPromise =  metadataService.getMetadataList(metadataType, params)
                        .then(function(response) {
                            return response.data;
                        });
                    }
                    oldSearchString = searchString;
                    return storedPromise;
                }
                return getPromise()
                .then(function(data) {
                    // push all returned items and remove non-selected items
                    var displayAllCheckedItems = !searchString || !searchString.trim().length;
                    var items = data.headers.reduce(function(array, header){
                        if (selectedItems[header.id]) {
                            if (!displayAllCheckedItems) {
                                array.push(getCheckboxItemFromHeader(header, true));
                            }
                        } else {
                            array.push(getCheckboxItemFromHeader(header, false));
                        }
                        return array;
                    }, []);
                    // push all selected selected items
                    if (displayAllCheckedItems) {
                        var checkedBoxesArray = Object.values(selectedItems);
                        if (checkedBoxesArray) {
                            items = items.concat(checkedBoxesArray);
                        }
                    }
                    //apply read-only predicate if needed

                    items = items.filter(function(item){
                        var isReadOnly = readOnlyPredicate(item);
                        return readOnlyItems ? isReadOnly : !isReadOnly;
                    });

                    return {
                        checkboxItems: items
                    };
                }
            );
            };

            var onChange =  function(title, isChecked, id) {
                if (isChecked) {
                    selectedItems[id] = {
                        id: id,
                        title : title,
                        isChecked: true
                    };
                } else {
                    delete selectedItems[id];
                }
                this.updateSelectedItems(metadataType, selectedItems);
            };

            return new SmartCheckboxCollectionController(
            checkboxCollectionGetter.bind(this, false),
            checkboxCollectionGetter.bind(this, true),
            onChange.bind(this),
            new SmartCheckboxCollectionConfig()
        );
        };

        AdminDialogController.prototype.updateSelectedItems = function(metadataType, items) {
        //TODO(chab) pull down in class hierarchy and find a nicer approach
            switch(metadataType) {
                case jsonConstants.metadataType.USER:
                    this.editedItem.userIds = Object.keys(items);
                    if (this.tabsController) {
                        this.tabsController.tabModels[1].countedItems =
                    this.editedItem.userIds.length;
                    }
                    break;
                case jsonConstants.metadataType.GROUP:
                    this.editedItem.groupIds = Object.keys(items);
                    if (this.tabsController) {
                        this.tabsController.tabModels[0].countedItems =
                    this.editedItem.groupIds.length;
                    }
                    break;
                case jsonConstants.metadataType.ROLE:
            //Todo(chab) handle roles
                    this.editedItem.roleIds = Object.keys(items);
                    break;
            }
        };

        AdminDialogController.prototype.buildTabsControllerFromModels = function(tabModels) {
            return new AdminTabsCollectionController(tabModels);
        };

        function getCheckboxItemFromHeader(header, isChecked) {
            return {
                isChecked: isChecked,
                title: header.name,
                id: header.id
            };
        }

        return AdminDialogController;
    }]);


blink.app.component('adminDialogComponent',
    {
        bindings: {
            bkCtrl:'<'
        },
        controller: blink.app.DynamicController,
        templateUrl: 'src/modules/admin/usersAdministration/admin-dialog-controller/admin-dialog.html'
    }
);
