/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Utilities for the list directive action items.
 */

'use strict';

blink.app.factory('listActionUtil', ['blinkConstants',
    'strings',
    function(blinkConstants, strings) {
        var actionStrings = strings.metadataListPage.actions;
        var actionConstants = blinkConstants.metadataListPage.actions;

        function getShareAction(ctrl) {
            return {
                icon: actionConstants.share.icon,
                text: actionStrings.share.text,
                isEnabled: function(items) {
                    return items.length && ctrl.canShare(items);
                },
                onClick: ctrl.share.bind(ctrl)
            };
        }

        function getDeleteAction(ctrl) {
            return {
                icon: actionConstants.delete.icon,
                text: actionStrings.delete.text,
                isEnabled: function(items) {
                    return items.length && ctrl.canDelete(items);
                },
                onClick: function(items) {
                    return items.length && ctrl.onDeleteAction(items);
                }
            };
        }

        function getAssignAction(ctrl) {
            return {
                id: 'add-to-group',
                icon: 'bk-style-icon-users',
                text: strings.adminUI.tooltip.ADD_USER_TO_GROUP,
                isEnabled:  function(items) {
                    return !!items.length;
                },
                onClick: function(users) {
                    ctrl.addUsersToGroups(users);
                }
            };
        }

        function getTagAction(ctrl) {
            var action = {
                icon: actionConstants.tag.icon,
                text: actionStrings.tag.text,
                class: actionConstants.tag.class,
                isEnabled: function(items) {
                    return items.length && ctrl.canTag(items);
                },
                applyLabel: ctrl.assignTag.bind(ctrl),
                accessoryContentUrl: 'src/modules/metadata-list/apply-label-menu.html',
                onClick: function() {
                    action.showMenu = true;
                }
            };
            return action;
        }

        function getExportAction(ctrl) {
            return {
                icon: actionConstants.export.icon,
                text: actionStrings.export.text,
                isEnabled: function(items) {
                    return items.length && ctrl.canExport(items);
                },
                onClick: ctrl.export.bind(ctrl)
            };
        }

        function getImportAction(ctrl) {
            return {
                icon: actionConstants.import.icon,
                text: actionStrings.import.text,
                isEnabled: function () {
                    return true;
                },
                onClick: ctrl.import.bind(ctrl)
            };
        }

        function getDownloadAction(ctrl) {
            return {
                icon: actionConstants.download.icon,
                text: actionStrings.download.text,
                isEnabled: function () {
                    return true;
                },
                onClick: ctrl.download.bind(ctrl)
            };
        }

        function getScheduleAction(ctrl) {
            return {
                icon: actionConstants.schedule.icon,
                text: actionStrings.schedule.text,
                isEnabled: function () {
                    return true;
                },
                onClick: ctrl.schedule.bind(ctrl)
            };
        }

        function getSendByEmailAction(ctrl) {
            return {
                icon: actionConstants.sendEmail.icon,
                text: actionStrings.sendEmail.text,
                isEnabled: function () {
                    return true;
                },
                onClick: ctrl.sendByEmail.bind(ctrl)
            };
        }

        function getPauseAction(ctrl) {
            return {
                icon: actionConstants.pause.icon,
                text: actionStrings.pause.text,
                class: actionConstants.pause.class,
                isEnabled: function (items) {
                    return items.length && ctrl.canPause(items);
                },
                onClick: ctrl.pauseJob.bind(ctrl)
            };
        }
        function getResumeAction(ctrl) {
            return {
                icon: actionConstants.resume.icon,
                text: actionStrings.resume.text,
                class: actionConstants.resume.class,
                isEnabled: function (items) {
                    return items.length && ctrl.canResume(items);
                },
                onClick: ctrl.resumeJob.bind(ctrl)
            };
        }

        return {
            getAssignAction: getAssignAction,
            getDeleteAction: getDeleteAction,
            getSendByEmailAction: getSendByEmailAction,
            getDownloadAction: getDownloadAction,
            getExportAction: getExportAction,
            getImportAction: getImportAction,
            getPauseAction: getPauseAction,
            getResumeAction: getResumeAction,
            getShareAction: getShareAction,
            getScheduleAction: getScheduleAction,
            getTagAction: getTagAction
        };
    }]);
