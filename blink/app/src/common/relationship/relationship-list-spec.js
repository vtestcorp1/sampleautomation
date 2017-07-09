/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Unit tests for the relationships list
 */

'use strict';

/* eslint camelcase: 1 */
describe('Relationship', function() {

    var $scope,
        elem,
        mockWorksheetUtilService = {},
        $q,
        sessionService,
        isAdmin = false,
        canUpload = false;

    var isAdminFunction = function() {
        return isAdmin;
    };

    var canUploadFunction = function() {
        return canUpload;
    };

    function mockWorksheetUtil() {
        mockWorksheetUtilService.getLogicalTableModel = function () {
            return $q.when({ data : {
                getId: function() {
                    return 'a';
                },
                getName: function() {
                    return 'a';
                },
                getColumns: function() {
                    return [];
                },
                getRelationships: function() {
                    return [
                        {
                            getDestinationTableId: function() {
                                return 'b';
                            },
                            getName: function() {
                                return 'testRelationship';
                            },
                            getDescription: function() {
                                return 'testRelationship';
                            },
                            getMetadataType: function() {
                                return "USER_DEFINED";
                            },
                            getAuthor: angular.noop
                        }
                    ];
                }
            }});
        };

        mockWorksheetUtilService.getLogicalTableModels = function () {
            return $q.when({ data : [
                {
                    getId: function() {
                        return 'b';
                    },
                    getName: function() {
                        return 'b';
                    },
                    getColumns: function() {
                        return [];
                    }
                }
            ]});
        };
    }

    describe('List', function () {
        beforeEach(function () {
            module('blink.app');
            module(function ($provide) {
                $provide.value('worksheetUtil', mockWorksheetUtilService);
            });
            inject(function ($rootScope,
                             $compile,
                             _$q_,
                             _sessionService_) {
                mockWorksheetUtil();
                sessionService = _sessionService_;
                $q = _$q_;
                $scope = $rootScope.$new();
                $scope.tableId = 'a';
                $scope.isReadOnly = false;
                $scope.isAdHocRelationshipBuilder = false;
                $scope.canEditOnlyOwnRelationships = false;
                spyOn(sessionService, 'hasAdminPrivileges').and.callFake(isAdminFunction);
                spyOn(sessionService, 'hasDataManagementPrivileges').and.callFake(canUploadFunction);

                var template = '<relationship-list table-id="tableId"' +
                    'is-read-only="isReadOnly" can-edit-only-own-relationships="canEditOnlyOwnRelationships">'+
                    '</relationship-list>';
                elem = $compile(angular.element(template))($scope);

                //directive's  scope is the child of _$scope
                $scope = elem.scope();
                $rootScope.$digest();

            });
        });

        it("should render a list with one item", function(){
            expect(elem.find('.bk-relationship-viewer').length).toBe(1);
        });

        it("should have correct relationship name", function(){
            expect(elem.find('.bk-relationship-title input').val()).toBe('testRelationship');
        });

        it("should have correct destination table name", function(){
            expect(elem.find('.key-value-pair:eq(1) .value').text()).toBe('b');
        });

        it("should show delete button if user is admin and relation is user defined", function(){
            isAdmin = true;
            $scope.$digest();
            expect(elem.find('.bk-secondary-button:contains("Delete")').length).toBe(1);

            isAdmin = false;
            $scope.$digest();
            expect(elem.find('.bk-secondary-button:contains("Delete")').length).toBe(0);
        });

        it("should show add relationship", function() {
            isAdmin = false;
            canUpload = false;
            $scope.$digest();
            expect(elem.find('.bk-add-mode-btn').length).toBe(0);

            isAdmin = true;
            canUpload = true;
            $scope.$digest();
            expect(elem.find('.bk-add-mode-btn').length).toBe(1);

            isAdmin = false;
            $scope.$digest();
            expect(elem.find('.bk-add-mode-btn').length).toBe(1);

            canUpload = false;
            $scope.$digest();
            expect(elem.find('.bk-add-mode-btn').length).toBe(0);
        });
    });
});
