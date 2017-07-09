/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Class encapsulating a document's permission model that controls the access of various interactions.
 * A typical usage of this class is as follows:
 *
 *
 * // Somewhere in chart module
 * if (docPermission.isInteractionAllowed('editVizTitle')) {
 *     // enable viz title editing.
 * } else {
 *     // disable viz title editing.
 * }
 */

'use strict';

blink.app.factory('DocumentPermissionFactory', ['$q',
    'alertService',
    'metadataPermissionService',
    'jsonConstants',
    'Logger',
    'util',
    'sessionService',
    'permissionFactory',
    'UserAction',
    'metadataUtil',
    function ($q,
          alertService,
          metadataPermissionService,
          jsonConstants,
          Logger,
          util,
          sessionService,
          permissionFactory,
          UserAction,
          metadataUtil) {
        var _logger = Logger.create('document-permission');

    // If the ACL rules are expanded to include more modes, this enum should also be expanded.
        var ACCESS_MODES = {
            NO_ACCESS: 'no-access',  // invalid option
            READ_ONLY: 'readonly',
            EDIT: 'edit'
        };

    /**
     *
     * @param {EffectivePermissionModel} documentPermission
     * @return {string=} Returns one of the keys in ACCESS_MODES.
     *
     * @private
     */
        function getDocumentAccessMode(documentPermission) {
            if (!documentPermission) {
                return ACCESS_MODES.NO_ACCESS;
            }

            var documentShareMode = documentPermission.getShareMode();

            switch (documentShareMode) {
                case jsonConstants.permission.NO_ACCESS:
                    return ACCESS_MODES.NO_ACCESS;
                case jsonConstants.permission.READ_ONLY:
                    return ACCESS_MODES.READ_ONLY;
                case jsonConstants.permission.MODIFY:
                    return ACCESS_MODES.EDIT;
                default:
                    return ACCESS_MODES.NO_ACCESS;
            }
        }

    /**
     * An internal class that can encapsulates the ACLs for a given interaction feature. The ACLs are combination of
     * access-ability in different modes, required privileges and other misc rules.
     *
     * @param {Object} modes A hash key of allowed/not-allowed rules (ACLs) for various ACCESS_MODES.
     * @param {Array.<string>=} requiredPrivileges A list of privilege levels that are required to access this interaction.
     *     Can be empty list.
     * @param {boolean=} onlyAuthorOrAdmin If true, the feature requires the current user to be either the author of the
     *     document or have admin privileges.
     *
     * @private
     */
        function createInteractionACL(modes, requiredPrivileges, onlyAuthorOrAdmin, needsUnderlyingAccess) {
            requiredPrivileges = requiredPrivileges || [];
            onlyAuthorOrAdmin = onlyAuthorOrAdmin || false;
            needsUnderlyingAccess = needsUnderlyingAccess || false;
            return {
                modes: modes,
                requiredPrivileges: requiredPrivileges,
                onlyAuthorOrAdmin: onlyAuthorOrAdmin,
                needsUnderlyingAccess: needsUnderlyingAccess
            };
        }

    // List of document level features and the corresponding ACLs.
    // To add a new document interaction that should be controlled by ACLs, following actions are needed:
    // - Determine [READ_ONLY, EDIT, ...] access mode permissions
    // - Determine if there are any privileges required to access this feature.
    // - Determine if the feature can only be accessed by author or admin.
    // - Determine if the feature needs underlying access
        var documentInteractionACLs = {
            sage: createInteractionACL({readonly: true, edit: true}, [], false, true),
            drill: createInteractionACL({readonly: true, edit: true}, [], false, true),
            layout: createInteractionACL({readonly: false, edit: true}),
            pinboard: {
                deleteViz:  createInteractionACL({readonly: false, edit: true}),
                addViz: createInteractionACL({readonly: true, edit: true})
            },
            editingDocumentTitle: createInteractionACL({readonly: false, edit: true}),
            editingVizTitle: createInteractionACL({readonly: false, edit: true}),
            maximizeViz: createInteractionACL({readonly: true, edit: true}),
            table: {
                localSorting: createInteractionACL({readonly: true, edit: true}),
                sorting: createInteractionACL({readonly: false, edit: true})
            },
            headline: createInteractionACL({readonly: true, edit: true}),
            chart: {
                zoom: createInteractionACL({readonly: true, edit: true}),
                type: createInteractionACL({readonly: true, edit: true}),
                legend: createInteractionACL({readonly: true, edit: true})
            },
            downloadingData: createInteractionACL({readonly: true, edit: true}, [jsonConstants.privilegeType.DATADOWNLOADING]),
            copyingDocument: createInteractionACL({readonly: true, edit: true}),
            savingDocument: createInteractionACL({readonly: false, edit: true}),
            sharingDocument: createInteractionACL({readonly: true, edit: true}),

            dataPanel: {
                changeSources: createInteractionACL({readonly: false, edit: true}),
                seeAllSourceColumns: createInteractionACL({readonly: false, edit: true}),
                useColumnInteractions: createInteractionACL({readonly: false, edit: true}),
                changeFilters: createInteractionACL({readonly: true, edit: true}, [], false, true),
                changeMetrics: createInteractionACL({readonly: true, edit: true}, [], false, true)
            }
        };

    // Worksheet is a document with features not applicable and some additional interactions.
        var worksheetInteractionACLs = angular.copy(documentInteractionACLs);
        angular.extend(worksheetInteractionACLs, {
            changingColumnName: createInteractionACL({readonly: false, edit: true}),
            sharingDocument: createInteractionACL({readonly: true, edit: true}, [], true)
        });

    // An enum of the dot-notation key into an interaction ACL hash object.
        var interactionTypeToACLKey = {
            SAGE: 'sage',
            DRILL: 'drill',
            LAYOUT: 'layout',
            DELETING_VIZ_FROM_PINBOARD: 'pinboard.deleteViz',
            ADDING_VIZ_TO_PINBOARD: 'pinboard.addViz',
            EDITING_DOCUMENT_TITLE: 'editingDocumentTitle',
            EDITING_VIZ_TITLE: 'editingVizTitle',
            MAXIMIZE_VIZ: 'maximizeViz',
            TABLE_SORTING: 'table.sorting',
            TABLE_LOCAL_SORTING: 'table.localSorting',
            HEADLINE_INTERACTION: 'headline',
            CHART_ZOOM: 'chart.zoom',
            CHANGING_CHART_TYPE: 'chart.type',
            CHART_LEGEND_INTERACTION: 'chart.legend',
            DOWNLOADING_DATA: 'downloadingData',
            COPYING_DOCUMENT: 'copyingDocument',
            SAVING_DOCUMENT: 'savingDocument',
            SHARING_DOCUMENT: 'sharingDocument',
            CHANGING_COLUMN_NAME: 'changingColumnName',
            CHANGING_DATA_SOURCES: 'dataPanel.changeSources',
            SEEING_ALL_DATA_SOURCE_COLUMNS: 'dataPanel.seeAllSourceColumns',
            USING_DATA_SOURCE_COLUMN_INTERACTIONS: 'dataPanel.useColumnInteractions',
            CHANGING_FILTERS: 'dataPanel.changeFilters',
            CHANGING_METRICS: 'dataPanel.changeMetrics'
        };

    /**
     * A class that can be used to determine what interactions are allowed/not-allowed given the current user's
     * document permission, privileges and author info of the document.
     *
     * @param {EffectivePermissionModel} documentPermission
     * @param {string} authorGuid GUID of the author of this document.
     * @param {string} type The document type.
     *
     * @constructor
     */
        function DocumentPermission(documentPermission, authorGuid, type) {
            this.accessMode = getDocumentAccessMode(documentPermission);
            this.authorGuid = authorGuid || sessionService.getUserGuid();

            if (!!documentPermission) {
                this._shareMode = documentPermission.getShareMode();
                this._hasUnderlyingAccess = documentPermission.hasUnderlyingAccess();
            }

            switch (type) {
                case jsonConstants.metadataType.QUESTION_ANSWER_BOOK:
                case jsonConstants.metadataType.PINBOARD_ANSWER_BOOK:
                    this.acls = documentInteractionACLs;
                    break;
                case jsonConstants.metadataType.LOGICAL_TABLE:
                    this.acls = worksheetInteractionACLs;
            }

            var self = this;
        // Syntactic sugar to allow access pattern such as isEditingDocumentTitleAllowed.
            Object.keys(interactionTypeToACLKey).forEach(function (interactionType) {
                self['is' + interactionType.camelize() + 'Allowed'] = self.isInteractionAllowed.bind(
                self, interactionTypeToACLKey[interactionType]);
            });
        }

        function PinboardDocumentPermission(documentPermission, authorGuid, answerDocumentPermissionsMap) {
            PinboardDocumentPermission.__super.call(
                this,
                documentPermission,
                authorGuid,
                jsonConstants.metadataType.PINBOARD_ANSWER_BOOK
            );

            var self = this;

            this.answerDocumentPermissions = {};
            util.iterateObject(answerDocumentPermissionsMap, function(answerId, answerDocumentPermission) {
                self.answerDocumentPermissions[answerId] =
                new DocumentPermission(answerDocumentPermission, authorGuid, jsonConstants.metadataType.QUESTION_ANSWER_BOOK);
                if (!answerDocumentPermission.hasUnderlyingAccess()) {
                    self._hasUnderlyingAccess = false;
                }
            });
        }

        util.inherits(PinboardDocumentPermission, DocumentPermission);

        PinboardDocumentPermission.prototype.getAnswerDocumentPermission = function (answerModelId) {
            return this.answerDocumentPermissions[answerModelId];
        };

    /**
     *
     * @param {string} interactionKey A dot-notation key into the interaction ACL hash object.
     * @return {boolean}
     */
        DocumentPermission.prototype.isInteractionAllowed = function (interactionKey) {
            if (this.accessMode === ACCESS_MODES.NO_ACCESS) {
                _logger.log('Current user has no access to the document');
                return false;
            }

            if (!this.acls) {
                _logger.warn('No interaction acls found!');
                return false;
            }
            var interactionACL = util.prop(this.acls, interactionKey);

            if (!interactionACL) {
                _logger.log('Interaction ACL not found for key', interactionKey);
                return false;
            }

        // Enforce required privileges.
            if (interactionACL.requiredPrivileges.length > 0) {
                var userPrivileges = sessionService.getUserPrivileges();
                if (userPrivileges.length <= 0) {
                    return false;
                }
                for (var i = 0; i < interactionACL.requiredPrivileges.length; ++i) {
                    if (userPrivileges.indexOf(interactionACL.requiredPrivileges[i]) === -1) {
                        return false;
                    }
                }
            }

            if (interactionACL.onlyAuthorOrAdmin) {
                if (!sessionService.hasAdminPrivileges() && this.authorGuid !== sessionService.getUserGuid()) {
                    return false;
                }
            }

            if (interactionACL.needsUnderlyingAccess && !this._hasUnderlyingAccess) {
                return false;
            }

            return interactionACL.modes[this.accessMode];
        };

        DocumentPermission.prototype.isMissingUnderlyingAccess = function () {
            return !this._hasUnderlyingAccess;
        };

        DocumentPermission.prototype.isReadOnly = function () {
            return this.accessMode !== ACCESS_MODES.EDIT;
        };

    /**
     * Instantiate document permission model with edit permissions
     *
     * @param {string} type
     * @return {DocumentPermission}
     */
        function createPermissiveInstance(type) {
            return new DocumentPermission(
            permissionFactory.EffectivePermissionModel.createPermissiveModel(), null, type);
        }

        /**
         * Instantiate pinboard document permission model with edit permissions
         *
         * @param {Array} ansIds
         * @return {PinboardDocumentPermission}
         */
        function createPinboardPermissiveInstance(ansIds) {
            var ansIdToPermissionMap = {};
            ansIds.forEach(function (ansId) {
                ansIdToPermissionMap[ansId] =
                    permissionFactory.EffectivePermissionModel.createPermissiveModel();
            });
            return new PinboardDocumentPermission(
                permissionFactory.EffectivePermissionModel.createPermissiveModel(),
                null,
                ansIdToPermissionMap
            );
        }

    /**
     * A method that asynchronously creates an object of DocumentPermission class by fetching the permissions from
     * backend.
     *
     * @param {string} documentId Id of the document for which the permission should be fetched.
     * @param {string} authorGuid
     * @param {string} type
     * @return {Deferred}
     *
     * @static
     */
        function createAsyncDocumentPermission(documentId, authorGuid, type) {
        // Make service call(s) to load the top level permission and underlying permission of current user for the
        // given documentId.
            var userAction = new UserAction(metadataUtil.getPermissionUserActionForType(type));
            return metadataPermissionService.getEffectivePermissions(
                [{
                    id: documentId
                }], type, true)
            .then(function (response) {
                var permission = response.data;
                var docPermission = permission.getObjectPermission(documentId);
                return new DocumentPermission(docPermission, authorGuid, type);
            }, function (response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        }

    /**
     * A method that asynchronously creates an object of DocumentPermission class by fetching the permissions from
     * backend.
     *
     * @param {string} pinboardId Id of the document for which the permission should be fetched.
     * @param {Array.<string>} answerIds Ids of the context answers
     * @param {string} authorGuid
     * @return {Deferred}
     *
     * @static
     */
        function createAsyncPinboardPermission(pinboardId, answerIds, authorGuid) {
        // Make service call(s) to load the top level permission and underlying permission of current user for the
        // given pinboardId.
            var typeToIdsMap = {};
            typeToIdsMap[jsonConstants.metadataType.PINBOARD_ANSWER_BOOK] = [pinboardId];
            typeToIdsMap[jsonConstants.metadataType.QUESTION_ANSWER_BOOK] = answerIds;

            var userAction = new UserAction(metadataUtil.getPermissionUserActionForType(jsonConstants.metadataType.PINBOARD_ANSWER_BOOK));
            return metadataPermissionService.getEffectivePermissionsByType(typeToIdsMap, true)
            .then(function (response) {
                var permissionByType = response.data;
                var pinboardPermissions = permissionByType[jsonConstants.metadataType.PINBOARD_ANSWER_BOOK];
                var docPermission = pinboardPermissions.getObjectPermission(pinboardId);
                var answerBulkPermissions = permissionByType[jsonConstants.metadataType.QUESTION_ANSWER_BOOK];
                var answerPermissions = {};
                util.iterateObject(answerIds, function(index, answerId) {
                    answerPermissions[answerId] = answerBulkPermissions.getObjectPermission(answerId);
                });

                return new PinboardDocumentPermission(docPermission, authorGuid, answerPermissions);
            }, function (response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        }

        return {
            DocumentPermission: DocumentPermission,
            PinboardDocumentPermission: PinboardDocumentPermission,
            createPermissiveInstance: createPermissiveInstance,
            createPinboardPermissiveInstance: createPinboardPermissiveInstance,
            createAsyncDocumentPermission: createAsyncDocumentPermission,
            createAsyncPinboardPermission: createAsyncPinboardPermission
        };
    }]);
