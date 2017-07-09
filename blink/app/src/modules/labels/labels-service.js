/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview A common service to fetch labels from callosum and encapsulate label specific implementation in a class.
 */

'use strict';

blink.app.factory('labelsService', ['$q',
    'alertService',
    'jsonConstants',
    'Logger',
    'metadataService',
    'UserAction',
    'util',
    function ($q,
          alertService,
          jsonConstants,
          Logger,
          metadataService,
          UserAction,
          util) {
        var _logger = Logger.create('labels-service');

        var me = {};

        function Metadata(headerJson) {
        /* @private */
            headerJson = headerJson || {};

        /* @privileged */
            this.getJson = function () {
                return headerJson;
            };
        }

    // Public methods.
        Metadata.prototype = {
            getAuthor: function () {
                return this.getJson().author;
            },
            getId: function () {
                return this.getJson().id;
            },
            getName: function () {
                return this.getJson().name;
            },
            setName: function (name) {
                this.getJson().name = name;
            },
            getClientState: function (key) {
                var json = this.getJson();
                if (!json.clientState) {
                    return null;
                }

                return json.clientState[key];
            },
            setClientState: function (key, value) {
                var json = this.getJson();
                if (!json.clientState) {
                    json.clientState = {};
                }

                json.clientState[key] = value;
            }
        };

        var DEFAULT_LABEL_COLOR = '#777';
        var COLOR_KEY = 'color';
        function Label(json) {
            angular.extend(this, new Metadata(json));

        // The 'name' and 'color' properties act as a model for view.
        // For any user of this class, if you are interested in inspecting the name/color committed by the user to be
        // saved on server, use the getCommitted*() methods.
            this.name = this.getName();
            this.color = this.getCommittedColor();
            this.deleted = false;
        }
        angular.extend(Label.prototype, Metadata.prototype);

        Label.prototype.update = function () {
            this.setName(this.name);
            this.setClientState(COLOR_KEY, this.color);
            this._textColor = '';
        };

        Label.prototype.getCommittedColor = function () {
            return this.getClientState(COLOR_KEY) || DEFAULT_LABEL_COLOR;
        };

        Label.prototype.getTextColor = function () {
            if (!this._textColor) {
                this._textColor = util.getReadableTextColor(this.color);
            }

            return this._textColor;
        };

        me.Label = Label;

        function LabelRegistry() {
            this.initialized = false;
            this.loading = false;
            this.labels = {};
            this.hash = '';
        }

        LabelRegistry.prototype.addLabel = function(label) {
            this.labels[label.getId()] = label;
            this.recomputeHash();
        };

        LabelRegistry.prototype.deleteLabel = function(labelId) {
            delete this.labels[labelId];
            this.recomputeHash();
        };

        LabelRegistry.prototype.getLabels = function() {
            return this.labels;
        };

        LabelRegistry.prototype.getLabel = function(labelId) {
            return this.labels[labelId];
        };

        LabelRegistry.prototype.isLoading = function() {
            return this.isLoading;
        };

        LabelRegistry.prototype.setLoading = function(loading) {
            this.initialized = true;
            this.loading = loading;
        };

        LabelRegistry.prototype.isInitialized = function() {
            return this.initialized;
        };

        LabelRegistry.prototype.setInitialized = function(initialized) {
            this.initialized = initialized;
        };

        LabelRegistry.prototype.getHash = function() {
            return this.hash;
        };

        LabelRegistry.prototype.recomputeHash = function() {
            var hash = '';
            Object.keys(this.labels).each(function(labelId) {
                hash += labelId;
            });
            this.hash = hash;
        };

        me.labelsRegistry = new LabelRegistry();

    /**
     * @return {Promise}
     */
        me.getLabels = function () {
            var labelListDeferred = $q.defer();

            var userAction = new UserAction(UserAction.FETCH_TAG_LIST);
            metadataService.getMetadataListModel(jsonConstants.metadataType.TAG)
            .then(function (response) {
                var listData = response.data;
                labelListDeferred.resolve(listData._metadataList.headers.map(function (metadata) {
                    return new Label(metadata);
                }));
            }, function (response) {
                alertService.showUserActionFailureAlert(userAction, response);
                labelListDeferred.reject(response.data);
            });
            return labelListDeferred.promise;
        };

    /**
     *
     * @param {Label} label
     * @return {Promise}
     */
        me.deleteLabel = function (label) {
            var userAction = new UserAction(UserAction.DELETE_LABELS);
            return metadataService.deleteMetadataItems(
            [label.getId()],
            jsonConstants.metadataType.TAG)
            .then(function (response) {
                alertService.showUserActionSuccessAlert(userAction, response);
                label.deleted = true;
                return label;
            }, function (response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        };

    /**
     *
     * @param {string} labelName
     * @return {Promise}
     */
        me.createLabel = function (labelName) {
            var userAction = new UserAction(UserAction.CREATE_LABEL, {successParams: [labelName]});

            return metadataService.createMetadataObject(
            jsonConstants.metadataType.TAG,
            labelName
        ).then(function (response) {
            var newLabelJson = response.data;
            alertService.showUserActionSuccessAlert(userAction, response);
            return new Label(newLabelJson.header);
        }, function(response) {
            alertService.showUserActionFailureAlert(userAction, response);
            return $q.reject(response.data);
        });
        };

    /**
     *
     * @param {Label} label
     * @return {Promise}
     */
        me.saveLabel = function (label) {
            label.update();
            var tagContent = {
                header: label.getJson(),
                content: {}
            };

            var userAction = new UserAction(UserAction.SAVE_TAG);

        // NOTE: Callosum save api expects the header + content but for label/tags we don't deal with content.
        // TODO(vibhor): Work with callosum to expose a /metadata/updateHeader end-point.
            return metadataService.save(jsonConstants.metadataType.TAG, JSON.stringify(tagContent))
            .then(function(response) {
                return response.data;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        };

        return me;
    }]);
