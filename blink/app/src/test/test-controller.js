// NOT TO BE SUBMITTED

'use strict';
/* eslint camelcase: 1 */

blink.app.controller('JoinTestController', ['$scope', 'strings', function ($scope, strings) {

    function createJoinChoices(tokens, choices) {
        // tokens: ['name', 'industry']
        // choices: ['|employer->company:curr employer id', '|employer->company:prev employer id']

        function getLTRLinkComponents(link) {
            var linkAndName = link.split(':'),
                parentAndChild = linkAndName[0].split('->');

            return {
                parent: parentAndChild[0].trim(),
                child: parentAndChild[1].trim(),
                linkName: linkAndName[1]
            };
        }

        function getRTLLinkComponents(link) {
            var linkAndName = link.split(':'),
                parentAndChild = linkAndName[1].split('<-');

            return {
                parent: parentAndChild[1].trim(),
                child: parentAndChild[0].trim(),
                linkName: linkAndName[0]
            };
        }

        function parseAndCreateJoinPath(pathString, getLinkComponents, reverse) {
            reverse = reverse || false;

            var links = reverse ? pathString.split(',').reverse() : pathString.split(','),
                root = getLinkComponents(links[0]).parent,
                leaf = getLinkComponents(links[links.length - 1]).child,
                joins = links.map(function (link) {
                    var comp = getLinkComponents(link);
                    return sage.Join.create(comp.linkName, comp.parent, comp.child);
                });

            return sage.JoinPath.create(root, leaf, joins);
        }

        tokens = tokens.map(function (token) {
            var rt = sage.RecognizedToken.createAttributeToken(token);
            rt.guid = token;
            return rt;
        });

        choices = choices.map(function (choice) {
            var candidate = new sage.JoinPathChoice();

            var choiceParts = choice.split('|'),
                leftPart = choiceParts[0].trim(),
                rightPart = choiceParts[1].trim();

            if (leftPart && leftPart.length) {
                candidate.append_path_for_existing_tokens = parseAndCreateJoinPath(leftPart, getRTLLinkComponents, true);
            }

            if (rightPart && rightPart.length) {
                candidate.path_for_new_token = parseAndCreateJoinPath(rightPart, getLTRLinkComponents);
            }

            return candidate;
        });

        return {
            tokens: tokens,
            joinPathCollection: new sage.JoinPathCollection({
                new_token_index: tokens.length - 1,
                join_path_candidates: choices
            })
        };
    }

    var CASE1 = createJoinChoices(['name', 'industry'], [
        '|employer->company:curr employer id',
        '|employer->company:prev employer id'
    ]);

    var CASE2 = createJoinChoices(['bonus', 'industry'], [
        '|ref->employer:referer id,employer->company:curr employer id',
        '|ref->employer:referee id,employer->company:curr employer id',
        '|ref->employer:referer id,employer->company:prev employer id',
        '|ref->employer:referee id,employer->company:prev employer id'
    ]);

    var CASE3 = createJoinChoices(['year', 'industry'], [
        'process init date:date<-ref | ref->employer:referer id,employer->company:curr employer id',
        'process completion date:date<-ref | ref->employer:referer id,employer->company:curr employer id',
        'process init date:date<-ref | ref->employer:referer id,employer->company:prev employer id',
        'process completion date:date<-ref | ref->employer:referer id,employer->company:prev employer id',
        'process init date:date<-ref | ref->employer:referee id,employer->company:curr employer id',
        'process completion date:date<-ref | ref->employer:referee id,employer->company:curr employer id',
        'process init date:date<-ref | ref->employer:referee id,employer->company:prev employer id',
        'process completion date:date<-ref | ref->employer:referee id,employer->company:prev employer id'
    ]);

    var CASE4 = createJoinChoices(['bonus', 'industry'], [
        '|ref->employer:referer id,employer->company:curr employer id',
        '|ref->employer:referee id,employer->company:curr employer id'
    ]);

    var CASE5 = createJoinChoices(
        ['color', 'category'],
        [
            'product type id:type<-product|',
            'trans product type id:type<-trans|trans->product:trans product id'
        ]
    );

    $scope.ambiguityInput = CASE3;

    $scope.completed = function () {
        console.log('got', arguments);
    };
}]);

blink.app.controller('TableTestController', ['$scope', 'Logger', function ($scope, Logger) {
    var _logger = Logger.create('test-controller');

    console.log('I was called');
    $scope.increaseMyWidthTo = function (width) {
        $('.bk-slickgrid-table').width(Math.min(500, width));
    };

    $scope.config = {
        editableColumnHeaders: true
    };
    $scope.tableModel = {
        columns: [
            {id: 'f1', field: 'f1', name: 'f1', headerCssClass: 'bk-numeric-column', cssClass: 'bk-numeric-column'},
            {id: 'f2', field: 'f2', name: 'f2'}
        ],
        data: [
            {f1: 'val11', f2: 'val12'},
            {f1: 'val21', f2: 'val22'},
            {f1: 'val31', f2: 'val32'},
            {f1: 'val41', f2: 'val42'}
        ]
    };
}]);
