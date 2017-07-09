/**
* Copyright: ThoughtSpot Inc. 2015
* Author: Wenxiang Chen (wenxiang.chen@thoughtspot.com) on 7/16/15.
*
* @fileoverview Directive for comment service
*/

'use strict';

blink.app.directive('comment', ['Logger', '$timeout', 'events',
    function (Logger, $timeout, events) {

        var _logger = Logger.create('comment-ui');

        function linker(scope, $el, attrs) {
            var INIT_NUM_COMMENTS = 10,
                INCREMENT_NUM_COMMENT = 10;

            var commentPollTimer = null,
                COMMENT_POLL_INTERVAL = 2000;

            var ulElems = $el.find('ul');
            var ulElem = ulElems[0];

            scope.maxComments = INIT_NUM_COMMENTS;

            scope.postButtonConifg = {
                btnClass: "bk-btn-blue",
                inactive: true,
                primaryMenu: {
                    label: 'Post',
                    event: events.POST_COMMENT_BUTTON_CLICKED_D
                }
            };

            scope.$on(events.POST_COMMENT_BUTTON_CLICKED_D, function ($ev) {
                scope.createCommentAndScrollToTop();
            });

            scope.$watch('isCreateCommentAllowed()', function(){
                scope.postButtonConifg.inactive = !scope.isCreateCommentAllowed();
            });

        /**
         * Create a comment and then scroll to the top to show the new comment
         */
            scope.createCommentAndScrollToTop = function(){
                var promise = scope.createComment();
                if (!promise) {
                    return;
                }
                promise.then( function(){
                    scope.scrollCommentListToTop();
                });
            };

        /**
         * Resizing window can allow more items to show, which may need increase on maxComents to fill the entire
         * height of comment panel
         */
            $(window).resize(function() {
                scope.initRenderItems();
            });

        /**
         * Scroll to top
         */
            scope.scrollCommentListToTop = function() {
                ulElem.scrollTop = 0;
            };

        /**
         * Check if vertical scrollbar for comment list is active, using a flag to limit the number of calls to this
         * function: it will only be called on initialization and when the browser is resized
         */
            scope.isScrollActive = function () {
                return ulElem.scrollHeight > ulElem.clientHeight;
            };

        /**
         * when initial maxComments is too small to fill the comment list, increase maxComments
         * return true if the comment list is completely filled.
         */
            scope.initRenderItems = function () {
                if (!scope.isScrollActive() && scope.hasMoreItemsToLoad()) {
                    scope.renderMoreItems();
                    return false;
                }
                return true;
            };

        /**
         * Check if there are more items to load
         */
            scope.hasMoreItemsToLoad = function () {
                return scope.comments.length > scope.maxComments;
            };

        /**
         * Rendering more items by increasing the limit in ng-repeat
         */
            scope.renderMoreItems = function () {
                _logger.log("Scrolling start: " + scope.maxComments);
                scope.maxComments += INCREMENT_NUM_COMMENT;
                _logger.log("Scrolling End: " + scope.maxComments);
            };

        /**
         * Poll comments and broadcast 'refreshCommentsRequest'
         */
            function pollComments() {
                if (commentPollTimer) {
                    $timeout.cancel(commentPollTimer);
                }
                commentPollTimer = $timeout(function () {
                    _logger.log("poll: " + new Date().toJSON());
                    if ( scope.shouldFetchComments() ) {
                        scope.refreshComments();
                    }
                    pollComments();
                }, COMMENT_POLL_INTERVAL, false);
            }

        /**
         * Cancel timer upon destroy of directive
         */
            $el.on('$destroy', function() {
                $timeout.cancel(commentPollTimer);
            });

            pollComments();
        }

        return {
            restrict: 'E',
            templateUrl: 'src/modules/comment/comment.html',
            controller: 'CommentController',
            scope: {
                model: '='
            },
            replace: true,
            link: linker
        };
    }]);

/**
 * Directive used for infinite scroll
 */
blink.app.directive('infiniteScroll', ['safeApply',
    function(safeApply) {
        return function(scope, $el, attr) {
            var raw = $el[0];

            $el.on('scroll', function() {
                if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                    safeApply(scope, attr.infiniteScroll);
                }
            });

            $el.on('$destroy', function() {
                $el.off('scroll');
            });
        };
    }]);
