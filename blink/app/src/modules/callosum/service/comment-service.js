/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Wenxiang Chen (wenxiang.chen@thoughtspot.com) on 7/16/15.
 *
 * @fileoverview Service for comments
 */

'use strict';

blink.app.factory('commentService', ['$q', '$rootScope', 'Command', 'CancelablePromise', '$timeout', 'Logger',
    function ($q, $rootScope, Command, CancelablePromise, $timeout, Logger) {
        var me = {};

        var _logger = Logger.create('comment-service');

    /**
     * Create a comment attached to visualization, pinboard_answer_sheet for now
     *
     * @param {string} owner GUID of owner object
     * @param {string} type Type of metadata object
     * @param {string} parent Type of metadata object
     * @param {string} comment Comment String
     */
        me.createComment = function (owner, type, parent, comment) {
            var command = new Command()
            .setPath('/comment/create')
            .setPostMethod()
            .setPostParams({
                owner: owner,
                type: type,
                parent: parent,
                comment: comment
            });
            return command.execute();
        };

    /**
     * Update a comment in postgres
     *
     * @param comment comment object
     */
        me.updateComment = function (comment) {
            var command = new Command()
            .setPath('/comment/update')
            .setPostMethod()
            .setPostParams({
                id: comment.id,
                comment: comment.message
            });
            return command.execute();
        };

    /**
     * Delete a comment in postgres
     *
     * @param id comment GUID
     */
        me.deleteComment = function (id) {
            var command = new Command()
            .setPath('/comment/delete/' + id)
            .setDeleteMethod();
            return command.execute();
        };

    /**
     * Fetch comments from postgres within specified range
     *
     * @param id owner object GUID
     * @param type type of owner object
     * @param fromTime starting time (inclusive) of range
     * @param toTime ending time (inclusive) of range
     * @param numOfComment maximum number of comments to fetch
     * @returns {*}
     */
        me.fetchComment = function (id, type, fromTime, toTime, numOfComment) {
            var command = new Command()
            .setPath('/comment/fetch')
            .setPostMethod()
            .setPostParams({
                id: id,
                type: type,
                fromtime: fromTime,
                totime: toTime,
                numofcomment: numOfComment
            });

            return new CancelablePromise(
            command.execute().then(function (response) {
                var fetchComments = response.data.comments.map(
                    function (item) {
                        return {
                            id: item.header.id,
                            author: item.header.author,
                            message: item.content.message,
                            authorDisplayName: item.header.authorName,
                            createdTime: item.header.created,
                            modifiedTime: item.header.modified,
                            inEdit: false, // whether current comment is being edit
                            currentlyEditingMessageBackup: item.content.message,
                            modifiedCommentPending: false // whether the update/delete network request has finished
                        };
                    });
                return fetchComments;
            }, function (error) {
                return error;
            }));
        };

        return me;
    }]);
