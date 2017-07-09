/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Controller for widget showing checkbox with the specified name.
 */

'use strict';

blink.app.factory('CheckboxCollectionController', ['blinkConstants',
    'strings',
    'CheckboxComponent',
    'Logger',
    function (blinkConstants,
          strings,
          CheckboxComponent,
          Logger) {
        var _logger = Logger.create('checkbox-collection-controller');

        function CheckboxCollectionController(
            checkboxCollection,
            onChange,
            isReadOnly,
            allowSelectAll
        ) {
            this.selectedItemsKeys = {};
            this.checkboxCollection = checkboxCollection;
            this.inputOnChange = onChange;
            this.isReadOnly = !!isReadOnly;
            this.allowSelectAll = !!allowSelectAll && !this.isReadOnly;

            this.selectedItemsKeys = {};

            this.checkboxCollection.forEach(function(checkboxItem, index) {
                var key = checkboxItem.id || index;
                if (checkboxItem.isChecked) {
                    this.selectedItemsKeys[key] = true;
                }
            }, this);

            this.init();
        }

        CheckboxCollectionController.prototype.init = function () {
            this.initCheckboxControllers();
            this.initSelectAllCBCtrl();
        };

        CheckboxCollectionController.prototype.initCheckboxControllers = function () {
            this.checkboxItemCtrls = this.checkboxCollection.map(function(checkboxItem, index) {
                var key = checkboxItem.id || index;
                var checkbox = new CheckboxComponent(
                    checkboxItem.title,
                    function () {
                        return this.selectedItemsKeys[key];
                    }.bind(this)
                );
                return checkbox
                    .setReadOnly(this.isReadOnly)
                    .setOnClick(function ($event) {
                        this.onSingleCheckboxChange(
                            checkboxItem.title, !this.selectedItemsKeys[key], key, false
                        );
                    }.bind(this));
            }, this);
        };

        CheckboxCollectionController.prototype.initSelectAllCBCtrl = function () {
            if (this.allowSelectAll) {
                this.selectAllCBCtrl = new CheckboxComponent(
                    strings.ALL,
                    function () {
                        return Object.keys(this.selectedItemsKeys).length > 0;
                    }.bind(this)
                ).setOnClick(function ($event) {
                    this.onSelectAllToggle(Object.keys(this.selectedItemsKeys).length === 0);
                }.bind(this));
            }
        };

        CheckboxCollectionController.prototype.onSingleCheckboxChange = function (
            title,
            newState,
            id,
            shouldInitSelectAllCtrl
        ) {
            if (newState) {
                this.selectedItemsKeys[id] = true;
            } else {
                delete this.selectedItemsKeys[id];
            }

            this.inputOnChange(title, newState, id);

            if (!!shouldInitSelectAllCtrl) {
                this.initSelectAllCBCtrl();
            }
        };

        CheckboxCollectionController.prototype.onSelectAllToggle = function (newState) {
            if (newState && Object.keys(this.selectedItemsKeys).length > 0) {
                _logger.error('Select all cannot be checked when there is any selection present');
                return;
            }

            if (newState) {
                this.checkboxCollection.forEach(function(checkboxItem, index) {
                    this.onSingleCheckboxChange(
                        checkboxItem.title, true, checkboxItem.id || index, false
                    );
                }, this);
            } else {
                this.checkboxCollection.forEach(function(checkboxItem, index) {
                    var key = checkboxItem.id || index;
                    if (this.selectedItemsKeys[key]) {
                        this.onSingleCheckboxChange(
                            checkboxItem.title, false, checkboxItem.id || index, false
                        );
                    }
                }, this);
            }

            this.init();
        };

        return CheckboxCollectionController;
    }]);
