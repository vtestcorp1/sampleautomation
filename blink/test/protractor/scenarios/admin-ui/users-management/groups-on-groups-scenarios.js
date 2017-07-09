/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * Group on groups scenarios
 *
 */

/*jslint node: true */
'use strict';

var adminUI = require('../admin-ui.js');
var blinkList = require('../../list/blink-list.js');
var common = require('../../common.js');
var dialog = require('../../dialog.js');
var relationships = require('../../data-ui/relationships/relationship.js');
var share = require('../../share/share-ui.js');
var util = common.util;
var checkbox = common.blinkCheckbox;

var usersToDelete = [];
var groupsToDelete = [];

describe('Groups on groups', function() {

    afterEach(function(){
        adminUI.deleteGroups(groupsToDelete);
        adminUI.deleteUsers(usersToDelete);
        usersToDelete = [];
        groupsToDelete = [];
    });

    it('should not be able to add own group on its groups', function(){

        adminUI.goToGroupManagement();
        var groupName = 'Analyst';

        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
        adminUI.selectGroupInGroupPanel(groupName);

        checkbox.checkForReadOnlyCheckbox(groupName, dialog.selectors.DIALOG);
        dialog.clickSecondaryButton();
    });

    it('should persist addition of group', function() {

        adminUI.goToUserManagement();
        var groupName = '[0group Name]';
        var groupToAdd = 'Analyst';
        groupsToDelete = [ groupName ];
        adminUI.addNewGroup(groupName);
        adminUI.goToGroupManagement();

        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
        adminUI.selectGroupInGroupPanel(groupToAdd);
        adminUI.save();

        adminUI.goToGroupManagement();
        adminUI.checkIfGroupHasGroup(groupName, groupToAdd, true);
    });

    it('should persist removal of group', function() {

        adminUI.goToUserManagement();
        var groupName = '[0group Name]';
        var groupToAdd = 'Analyst';
        adminUI.addNewGroup(groupName);
        adminUI.goToGroupManagement();
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
        adminUI.selectGroupInGroupPanel(groupToAdd);
        adminUI.save();

        adminUI.goToGroupManagement();
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
        adminUI.selectGroupInGroupPanel(groupToAdd);
        adminUI.save();

        adminUI.checkIfGroupHasGroup(groupName, groupToAdd, false);
        groupsToDelete = [groupName];
    });

    it('should only gives group that belongs directly to a group', function() {

        // add 2 groups
        // A => Analyst
        // Anaylst => Consumer
        // A should not have consumer
        adminUI.goToUserManagement();
        var groupName = '[0group Name]';
        var groupToAdd = 'Analyst';

        adminUI.addNewGroup(groupName);
        adminUI.goToGroupManagement();
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
        adminUI.selectGroupInGroupPanel(groupToAdd);
        adminUI.save();

        groupName = '[0group Name2]';
        groupToAdd = '[0group Name]';
        groupsToDelete = [groupName, groupToAdd];
        adminUI.addNewGroup(groupName);
        adminUI.goToGroupManagement();
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
        adminUI.selectGroupInGroupPanel(groupToAdd);
        adminUI.save();
        adminUI.checkIfGroupHasGroup(groupName, 'Analyst', false);
    });

    // There is currently no way to know that we are going to create a cycle,
    // so we have to wait from callosum response
    it('should return an error if we create a cycle', function(){

        adminUI.goToUserManagement();
        var groupName = '[0group Name]';
        var groupToAdd = 'Analyst';
        adminUI.addNewGroup(groupName);
        adminUI.goToGroupManagement();
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
        adminUI.selectGroupInGroupPanel(groupToAdd);
        adminUI.save();

        groupToAdd = '[0group Name]';
        groupName = 'Analyst';
        groupsToDelete = [groupToAdd];
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
        adminUI.selectGroupInGroupPanel(groupToAdd);
        adminUI.save();

        // expect an error mirrored on screen or something
        util.expectErrorNotif();
        adminUI.goToGroupManagement();
    });
});

