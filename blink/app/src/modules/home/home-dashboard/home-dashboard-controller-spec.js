/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Unit test for HomeDashboardController
 */

'use strict';

describe('Home Dashboard Controller', function () {

    var scope,
        events,
        $q,
        $timeout,

        MockPinboardSelectorComponent,
        MockDocumentLoader,
        mockMetadataService,
        mockSessionService;

    function getMockAnswerModel(forEmptyPinboard) {
        return {
            getCurrentAnswerSheet: function () {
                return {
                    isEmpty: function () {
                        return forEmptyPinboard;
                    }
                };
            },
            getHeaderJson: function () {
                return {
                    name: 'PB',
                    owner: 'owner'
                };
            }
        };
    }

    beforeEach(function () {
        module('blink.app');

        /* eslint camelcase: 1 */
        inject(function ($rootScope, $controller, _$q_, _$timeout_, _events_) {
            scope = $rootScope.$new();
            events = _events_;
            $q = _$q_;
            $timeout = _$timeout_;

            mockMetadataService = jasmine.createSpyObj('metadataService', ['getMetadataList']);
            mockSessionService = {
                getHomePinboardId: angular.noop,
                setHomePinboardId: angular.noop
            };

            MockPinboardSelectorComponent = function (selectionHandler) {};
            MockPinboardSelectorComponent.prototype.setSelectedItem = angular.noop;

            // Instantiate the controller
            $controller('HomeDashboardController', {
                $scope: scope,
                PinboardSelectorComponent: MockPinboardSelectorComponent,
                metadataService: mockMetadataService,
                sessionService: mockSessionService
            });
        });
    });

    it('should set the homeDashboardState to NO_PINBOARDS if no pinboards are available', function () {
        mockMetadataService.getMetadataList.and.returnValue($q.when({data: {headers: []}}));
        scope.init();
        scope.$apply();
        expect(scope.homeDashboardState).toBe('NO_PINBOARDS');
    });

    it('should set the homeDashboardState to NON_EMPTY_PINBOARD if the selected pinboard contains some' +
        ' visualizations', function () {
        mockMetadataService.getMetadataList.and.returnValue($q.when({data: {headers: [{}]}}));
        scope.init();
        scope.onPinboardModelUpdateSuccess(getMockAnswerModel(false));
        scope.$apply();
        expect(scope.homeDashboardState).toBe('NON_EMPTY_PINBOARD');
    });

    it('should set the homeDashboardState to EMPTY_PINBOARD if the selected pinboard is empty', function () {
        mockMetadataService.getMetadataList.and.returnValue($q.when({data: {headers: [{}]}}));
        scope.init();
        scope.onPinboardModelUpdateSuccess(getMockAnswerModel(true));
        scope.$apply();

        expect(scope.homeDashboardState).toBe('EMPTY_PINBOARD');
    });

    it('should load the saved pinboard when available', function () {
        var savedPinboardId = 'saved-pinboard-id';

        mockSessionService.getHomePinboardId = function () {
            return savedPinboardId;
        };
        scope.init();
        scope.$apply();
        expect(scope.getSelectedPinboardId()).toBe(savedPinboardId);
    });

});
