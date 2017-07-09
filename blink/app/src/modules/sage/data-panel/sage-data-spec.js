    /**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for sage data
 */

'use strict';

/* eslint camelcase: 1 */

describe('sage data', function () {

    var compile, scope, constants, $sageData, $httpBackend, jsonConstants;

    beforeEach(function () {
        module('blink.app');
    });

    beforeEach(inject(function ($compile, $rootScope, blinkConstants, strings, _jsonConstants_, _$httpBackend_) {
        compile = $compile;
        scope = $rootScope.$new();
        constants = blinkConstants;
        jsonConstants = _jsonConstants_;
        $httpBackend = _$httpBackend_;
    }));

    function compileSageDataDirective(config) {
        $sageData = $('<sage-data config="config"' +
            'on-header-click-callback="onHeaderClickCallback">' +
            '</sage-data>');
        scope.config = config;
        scope.collapseDataPanel = jasmine.createSpy('collapseDataPanel');
        scope.onHeaderClickCallback = jasmine.createSpy('onHeaderClickCallback');
        $sageData = compile($sageData)(scope);
        scope.$apply();
    }

    it('should initialize correct panel for new answer', function () {
        var config = {
            type: constants.ANSWER_TYPE
        };
        compileSageDataDirective(config);

        var $components = $sageData.find('.bk-sage-data-component');
        expect($components.length).toBe(2);

        expect($components.eq(0).hasClass('bk-sources-container')).toBeTruthy();
        expect($components.eq(1).hasClass('bk-columns-container')).toBeTruthy();
    });

    it('should initialize correct panel for new worksheet', function () {
        var config = {
            type: constants.WORKSHEET_TYPE
        };
        compileSageDataDirective(config);

        var $components = $sageData.find('.bk-sage-data-component');
        expect($components.length).toBe(3);

        expect($components.eq(0).hasClass('bk-sources-container')).toBeTruthy();
        expect($components.eq(1).hasClass('bk-columns-container')).toBeTruthy();
        expect($components.eq(2).hasClass('bk-formulae-container')).toBeTruthy();
    });

    function setupMockLogicalTableRequests(tableIds) {
        var logicalTableListRequestTpl = '/callosum/v1/metadata/list?showhidden=false&subtype={1}&type=LOGICAL_TABLE',
            subTypes = jsonConstants.metadataType.subType;
        $httpBackend.expectGET(logicalTableListRequestTpl.assign(subTypes.WORKSHEET)).respond({ headers: [] });
        $httpBackend.expectGET(logicalTableListRequestTpl.assign(subTypes.IMPORTED_DATA)).respond({ headers: [] });
        $httpBackend.expectGET(logicalTableListRequestTpl.assign(subTypes.SYSTEM_TABLE)).respond({
            headers: tableIds.map(function (id) {
                return {
                    name: id,
                    id: id
                };
            })
        });
        $httpBackend.expectGET(logicalTableListRequestTpl.assign(subTypes.AGGR_WORKSHEET)).respond({ headers: [] });
    }

    // TODO(Jasmeet): This test is not mocked correctly. Fix this with refectoring in 3.3
    //xit('should be able to collapse the data panel', function () {
    //    var config = {
    //        type: constants.ANSWER_TYPE,
    //        model: {
    //            getSageDataScope: function () {
    //                return ['source1', 'source2'];
    //            },
    //            isCorrupted: function() {
    //                return false;
    //            },
    //            getPermission: function () {
    //                return {
    //                    isReadOnly: function () {
    //                        return false;
    //                    },
    //                    isMissingUnderlyingAccess: function () {
    //                        return false;
    //                    }
    //                };
    //            }
    //        }
    //    };
    //
    //    setupMockLogicalTableRequests(['source1', 'source2']);
    //    compileSageDataDirective(config);
    //    $httpBackend.flush();
    //
    //    $sageData.find('.bk-header-container').click();
    //    expect(scope.collapseDataPanel).toHaveBeenCalled();
    //});

    it('should not be able to collapse the data panel in a worksheet', function () {
        var config = {
            type: constants.WORKSHEET_TYPE,
            model: {
                getSageDataScope: function () {
                    return ['source1', 'source2'];
                },
                isCorrupted: function() {
                    return false;
                },
                getPermission: function () {
                    return {
                        isReadOnly: function () {
                            return false;
                        },
                        isMissingUnderlyingAccess: function () {
                            return false;
                        }
                    };
                }
            }
        };

        compileSageDataDirective(config);

        $sageData.find('.bk-header-container').click();
        expect(scope.collapseDataPanel).not.toHaveBeenCalled();
    });

    it('should not be able to collapse the data panel when no data sources', function () {
        var config = {
            type: constants.ANSWER_TYPE,
            model: {
                getSageDataScope: function () {
                    return [];
                },
                getPermission: function () {
                    return {
                        isReadOnly: function () {
                            return false;
                        },
                        isMissingUnderlyingAccess: function () {
                            return false;
                        }
                    };
                },
                isCorrupted: function () {
                    return false;
                }
            }
        };

        compileSageDataDirective(config);
        $httpBackend.verifyNoOutstandingRequest();

        $sageData.find('.bk-header-container').click();
        expect(scope.collapseDataPanel).not.toHaveBeenCalled();
    });

    it('should be able to hide the data panel when no data sources', function () {
        var config = {
            type: constants.ANSWER_TYPE,
            model: {
                getSageDataScope: function () {
                    return [];
                },
                getPermission: function () {
                    return {
                        isReadOnly: function () {
                            return false;
                        },
                        isMissingUnderlyingAccess: function () {
                            return false;
                        }
                    };
                },
                isCorrupted: function () {
                    return false;
                }
            },
            leftPanelConfig: {
                hidePanelOnHeaderClick: true
            }
        };

        compileSageDataDirective(config);
        $httpBackend.verifyNoOutstandingRequest();

        $sageData.find('.bk-header-container').click();
        expect(scope.onHeaderClickCallback).toHaveBeenCalled();
    });
});
