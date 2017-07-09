/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Wenxiang Chen (wenxiang.chen@thoughtspot.com) on 7/16/15.
 *
 * @fileoverview Controller for comment service
 */


'use strict';

blink.app.controller('CommentController', ['$http',
    '$q',
    '$rootScope',
    '$scope',
    'alertService',
    'blinkConstants',
    'commentService',
    'dateUtil',
    'dialog',
    'events',
    'jsonConstants',
    'Logger',
    'metadataService',
    'sessionService',
    'strings',
    'UserAction',
    'UserModel',
    function ($http,
          $q,
          $rootScope,
          $scope,
          alertService,
          blinkConstants,
          commentService,
          dateUtil,
          dialog,
          events,
          jsonConstants,
          Logger,
          metadataService,
          sessionService,
          strings,
          UserAction,
          UserModel) {
        var MAX_FETCH_COMMENT = 10000000;  /* backend requires to specify max number of comments to fetch */

        var _logger = Logger.create('comment-controller');
        var fetchCommentCallPromise = null;

        $scope.newCommentMessage = null;
        $scope.comments = [];
        $scope.highlightNewComment = false;
        $scope.inEditMode = false;
        $scope.createCommentPending = false; // flag for comment input box
    // flag for the comment list is completely filled if it is longer than client height
        $scope.isInitCommentListFilled = false;

    /**
     * get type of current owner
     */
        function getOwnerType(){
            return currentAnswerSheet.getSheetType() + '_ANSWER_SHEET';
        }

        var currentAnswerSheet = $scope.model.getCurrentAnswerSheet();
        var ownerId = currentAnswerSheet.getId();
        var ownerType = getOwnerType();

    /**
     * Create a comment in postgres
     */
        $scope.createComment = function () {
            if ($scope.newCommentMessage === null || $scope.createCommentPending) {
                return;
            }
            $scope.createCommentPending = true;
            var userAction = new UserAction(UserAction.CREATE_COMMENT);
            return commentService.createComment(ownerId, ownerType, null, $scope.newCommentMessage)
            .then(function (response) {
                var data = response.data;
                // change has been made to postgres, stop existing poll containing obsolete data
                if (!!fetchCommentCallPromise) {
                    fetchCommentCallPromise.cancel();
                }
                $scope.comments.unshift({
                    id: data.header.id,
                    author: sessionService.getUserGuid(),
                    authorDisplayName: sessionService.getUserDisplayName(),
                    message: data.content.message,
                    createdTime: data.header.created,
                    modifiedTime: data.header.modified,
                    inEdit: false, // whether current comment is being edit
                    currentlyEditingMessageBackup: data.content.message,
                    modifiedCommentPending: false // whether the update/delete network request has finished
                });
                $scope.newCommentMessage = null;
                $scope.highlightNewComment = true;
                $scope.createCommentPending = false;
                $scope.refreshComments();
                _logger.log('Comment created: ', $scope.comments[0]);
            }, function (response) {
                alertService.showUserActionFailureAlert(userAction, response);
                $scope.createCommentPending = false;
                return $q.reject(response.data);
            });
        };

    /**
     * Update a comment in postgres
     *
     * @param idx index of comment object
     */
        $scope.updateComment = function (idx) {
            var comment = $scope.comments[idx];
            _logger.log('update comment: ' , comment);
            comment.modifiedCommentPending = true;
            var userAction = new UserAction(UserAction.UPDATE_COMMENT);
            commentService.updateComment(comment)
            .then(function (response) {
                var data = response.data;
                // change has been made to postgres, stop existing poll containing obsolete data
                if (!!fetchCommentCallPromise) {
                    fetchCommentCallPromise.cancel();
                }
                _logger.log('Comment updated: ', comment);
                comment.currentlyEditingMessageBackup = comment.message;
                comment.modifiedCommentPending = false;
                comment.inEdit = false;
                comment.modifiedTime = data.header.modified;
                $scope.inEditMode = $scope.comments.some(isCommentInEdit);
                $scope.refreshComments();
            }, function (response) {
                alertService.showUserActionFailureAlert(userAction, response);
                comment.modifiedCommentPending = false;
                comment.inEdit = false;
                $scope.inEditMode = $scope.comments.some(isCommentInEdit);
                return $q.reject(response.data);
            });
        };

    /**
     * Delete a comment in postgres
     *
     * @param idx
     */
        $scope.deleteComment = function (idx) {
            var comment = $scope.comments[idx]; // make sure comment is a reference to comments array
            comment.modifiedCommentPending = true;
            dialog.show({
                title: 'Delete Comment',
                confirmBtnLabel: 'Delete',
                message: 'Are you sure you want to delete this comment?',
                onConfirm: function () {
                    var userAction = new UserAction(UserAction.DELETE_COMMENT);
                    commentService.deleteComment(comment.id)
                    .then(function () {
                        // change has been made to postgres, stop existing poll containing obsolete data
                        if (!!fetchCommentCallPromise) {
                            fetchCommentCallPromise.cancel();
                        }
                        $scope.comments = $scope.comments.filter(function (obj) {
                            return obj.id !== comment.id;
                        });
                        $scope.refreshComments();
                    }, function (response) {
                        alertService.showUserActionFailureAlert(userAction, response);
                        comment.modifiedCommentPending = false;
                        return $q.reject(response.data);
                    });
                    return true;
                },
                cancelCbOnClose: true,
                onCancel: function(){
                    comment.modifiedCommentPending = false;
                }
            });
        };

    /**
     * Refresh the comment list
     */
        $scope.refreshComments = function () {
            _logger.log("Refresh comment: " + new Date().toJSON());
            if (!!fetchCommentCallPromise) {
                fetchCommentCallPromise.cancel();
            }
            var userAction = new UserAction(UserAction.FETCH_COMMENTS);
            fetchCommentCallPromise = commentService.fetchComment(ownerId, ownerType, -1, -1, MAX_FETCH_COMMENT);
            fetchCommentCallPromise.then(function (fetchedComments) {
                $scope.highlightNewComment = false;
                if ($scope.shouldFetchComments()) {
                    $scope.comments = fetchedComments;
                }
                if (!$scope.isInitCommentListFilled) {
                    $scope.isInitCommentListFilled = $scope.initRenderItems();
                }
                fetchCommentCallPromise = null;
            }, function (response) {
                alertService.showUserActionFailureAlert(userAction, response);
                $scope.highlightNewComment = false;
                fetchCommentCallPromise = null;
                return $q.reject(response.data);
            }
        );
        };

        $scope.getMatchingUsers = function(term) {
            if (!term) { // only shows the popup when there is at least one matching character
                return;
            }
            var pattern = '%{1}%'.assign(term);

            var params = {
                skipIds: blinkConstants.GUIDS_TO_SKIP,
                pattern: pattern,
                sortAscending: true
            };

            return metadataService.getMetadataList(jsonConstants.metadataType.USER, params).then(function(response){
                $scope.user = response.data.headers.map(function(header){
                    return UserModel.fromHeaderJson(header);
                });
                return $scope.user;
            });
        };

    /**
     * Specify the format to display when a user is selected
     *
     * @param item
     * @returns {string}
     */
        $scope.formatForSelectedUser = function(item) {
            return '@' + item.getName() + '';
        };

    /**
     * Whether should issue the network call to fetch comments
     * @returns {boolean}
     */
        $scope.shouldFetchComments = function() {
            return !$scope.inEditMode && !$scope.createCommentPending && !$scope.comments.some(isModifiedCommentPending);
        };

    /**
     * Check for permission for deleting and editing an existing comment.
     * Only author or admin users have the permission.
     *
     * @param authorId comment GUID
     */
        $scope.canCurrentUserModifyComment = function (authorId) {
            return sessionService.hasAdminPrivileges() || authorId === sessionService.getUserGuid();
        };

    /**
     * Check if there are more items to load
     */
        $scope.hasMoreItemsToLoad = function () {
            return $scope.comments.length > $scope.maxComments;
        };

    /**
     * Check if the comments has been modified since its creation, with 100ms as the tolerance
     */
        function isCommentModified(comment) {
            return Math.abs(comment.createdTime - comment.modifiedTime) > 100;
        }

    /**
     * Show a sign whether a comment have been modified since its creation
     * Start editing mode for the current comment, allowing only editing one comment at a time
     * @param idx
     */
        $scope.startEditMode = function (idx) {
            var comment = $scope.comments[idx];
            $scope.changeEditMode(comment, true);
            comment.currentlyEditingMessageBackup = comment.message;
        };

    /**
     * Helper function to used with Array.prototype.some() for checking if any of the comment is being edited.
     * @param element
     * @returns {boolean}
     */
        function isCommentInEdit(element) {
            return element.inEdit;
        }

    /**
     * Helper function to used with Array.prototype.some() for checking if any of the comment is being edited.
     * @param element
     * @returns {boolean}
     */
        function isModifiedCommentPending(element) {
            return element.modifiedCommentPending;
        }

    /**
     * End editing after click the 'Done' button
     * @param idx
     */
        $scope.endEditMode = function (idx) {
            var comment = $scope.comments[idx];
            if (comment.modifiedCommentPending) { // wait for the pending network call
                return;
            }
            if (!comment.message) {
            // empty message is not allowed, restoring to message backup
                dialog.show({
                    title: 'Notice',
                    confirmBtnLabel: 'OK',
                    skipCancelBtn: true,
                    message: 'Empty comment message is not allowed, reverted to original comment message.',
                    onConfirm: function () {
                        return true;
                    }
                });
                comment.message = comment.currentlyEditingMessageBackup;
                $scope.changeEditMode(comment, false);
            } else if (comment.message !== comment.currentlyEditingMessageBackup) {
            // only call the api when there is some change to the comment message
                $scope.updateComment(idx);
            } else if (comment.message === comment.currentlyEditingMessageBackup) {
                $scope.changeEditMode(comment, false);
            }
        };

    /**
     * Cancel editing for the current comment and for pending comment to update, restoring to message backup.
     *
     * @param idx
     */
        $scope.cancelEditMode = function (idx) {
            var comment = $scope.comments[idx];
            if (comment.modifiedCommentPending) { // wait for the pending network call
                return;
            }
            comment.message = comment.currentlyEditingMessageBackup;
            $scope.changeEditMode(comment, false);
        };

    /**
     * Only allow creating comment when the comment message is non-empty
     * or there is no pending network call to create comment
     */
        $scope.isCreateCommentAllowed = function() {
            return $scope.newCommentMessage && !$scope.createCommentPending;
        };

    /**
     * Change the edit mode of the given comment and update global edit mode.
     *
     * @param comment
     * @param toValue
     */
        $scope.changeEditMode = function(comment, toValue) {
            comment.inEdit = toValue;
            $scope.inEditMode = $scope.comments.some(isCommentInEdit);
        };

    /**
     * Flag for whether showing time ago
     */
        $scope.showTimeAgo = function(comment) {
            return comment.createdTime && !comment.inEdit;
        };

    /**
     * Flag for whether showing modified buttons (edit and delete)
     */
        $scope.showModifiedButtons = function(comment) {
            return $scope.canCurrentUserModifyComment(comment.author)
            && !comment.inEdit && !comment.modifiedCommentPending;
        };

    /**
     * Show buttons in edit mode
     */
        $scope.showEditModeButtons = function(comment) {
            return comment.inEdit && !comment.modifiedCommentPending;
        };

    /***
     * Convert epoch time to timeAgo
     *
     * @param time
     * @returns {string}
     */
        $scope.convertToTimeAgo = function(time) {
            return dateUtil.epochToTimeAgoString(time);
        };

    /**
     * Whether shows edited sign
     * @param comment
     * @returns {*|boolean}
     */
        $scope.showEditedSign = function(comment){
            return isCommentModified(comment) && !comment.inEdit;
        };

    // fetching comments immediately after opening comment panel
        $scope.refreshComments();
    }]);
