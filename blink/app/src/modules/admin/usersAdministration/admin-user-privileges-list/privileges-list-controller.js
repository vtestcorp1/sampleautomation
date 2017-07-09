/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Francois Chabbey
 *
 * @fileoverview UI for displaying list of checkboxes
 */

'use strict';

blink.app.factory('PrivilegesListController',['CheckboxCollectionController',
    'strings',
    'util',
    function (CheckboxCollectionController,
    strings,
    util) {
    /**
     *
     * @param {Array<Object>}
     * @constructor
     */
        function PrivilegesListController(privileges, onPrivilegeChange) {

            this.privileges = privileges;
            this.onPrivilegeChange = onPrivilegeChange;
            this.strings = strings;
            var checkboxItems = this.privileges.map(function(privilege){
                return {
                    isChecked: privilege.isEnabled,
                    title: privilege.label
                };
            });

            var onChange = this.onChange.bind(this);
            PrivilegesListController.__super.call(this, checkboxItems, onChange, false);
        }
        util.inherits(PrivilegesListController, CheckboxCollectionController);

        PrivilegesListController.prototype.onChange = function(title, isChecked, id){
            this.onPrivilegeChange(this.privileges[id], isChecked);
        };

        return PrivilegesListController;
    }]);
