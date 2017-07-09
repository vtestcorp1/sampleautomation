/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Unit tests for embedding control
 */

'use strict';

describe('Embedding Control', function() {

    var $scope, elem;

    var dialogService = jasmine.createSpyObj('dialog', ['show']);

    beforeEach(function () {
        module('blink.app');

        module(function ($provide) {
            $provide.value('dialog', dialogService);
        });

        inject(function ($rootScope, $compile) {
            $scope = $rootScope.$new();

            $scope.vizModel = {
                getContainingAnswerModel: function () {
                    return {
                        getId: function() {
                            return 'answer-model-id';
                        }
                    };
                },
                getReferencingViz: function () {
                    return {
                        getId: function() {
                            return 'referencing-viz-id';
                        }
                    };
                }
            };

            var template = '<embedding-control viz-model="vizModel"></embedding-control>';
            elem = $compile(angular.element(template))($scope);
            $('body').append(elem);

            // directive's scope is the child of _$scope
            $scope = elem.scope();
            $rootScope.$digest();
        });
    });

    afterEach(function(){
        $('body').empty();
    });

    it('should open dialog with link on click', function(){
        elem.find('.bk-embedding-control').click();
        $scope.$root.$digest();
        expect(dialogService.show).toHaveBeenCalled();
        expect(dialogService.show.calls.mostRecent().args[0].customData.embedSnippet)
            .toMatch(/embed\/viz\/answer-model-id\/referencing-viz-id$/g);
    });

});
