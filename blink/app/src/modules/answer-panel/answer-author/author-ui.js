/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Author Directive
 */

'use strict';

blink.app.directive('blinkAuthor', ['userService', 'Logger', function (userService, Logger) {

    var _logger = Logger.create('blink-author');

    function linker(scope, $el, attrs) {

        function updateAuthor() {
            scope.authorId = (scope.answerModel && scope.answerModel.getAuthorId()) || '';
            if (!scope.authorId) {
                return;
            }
            scope.authorName = scope.answerModel.getAuthorDisplayName();
        }

        scope.canShowAuthor = function () {
            return !!scope.answerModel && scope.answerModel.isCreatedOnServer();
        };

        scope.$watch('answerModel.getAuthorId()', function (newAuthorId, oldAuthorId) {
            updateAuthor();
        });

        updateAuthor();
    }

    return {
        restrict: 'E',
        replace: true,
        scope: {
            answerModel: '='
        },
        link: linker,
        templateUrl: 'src/modules/answer-panel/answer-author/answer-author.html'
    };

}]);
