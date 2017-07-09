/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Rahul Balakavi (rahul.balakavi@thoughtspot.com)
 */
'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('status viewer controller', function () {
    var scope, $q, dialog;

    beforeEach(function() {
        module('blink.app');
        inject(function (_$q_,
                         _dialog_,
                         $rootScope,
                         $controller) {
            $q = _$q_;
            scope = $rootScope.$new();
            scope.tables = [
                {
                    name: 'mock-table1',
                    alreadyLoaded:true
                },
                {
                    name : 'mock-table2',
                    alreadyLoaded:false
                }
            ];

            $controller('TableTransformationsController', {
                $scope: scope
            });
            scope.$apply();
        });
    });

    it('Do not delete expression on already loaded tables', function () {
        var rows = [
            {
                value : 'mock-expression',
                table : {
                    name: 'mock-table1'
                }
            }
        ];
        scope.transformations = rows;
        // expression referencing already loaded table.It should be deleted.
        scope.actionItems[0].onClick(rows);
        expect(scope.transformations.length).toBe(0);

        // expression referencing a new table. So will be deleted.
        rows = [
            {
                value : 'mock-expression',
                table : {
                    name: 'mock-table2'
                }
            }
        ];
        scope.actionItems[0].onClick(rows);
        expect(scope.transformations.length).toBe(0);
    });
});
