/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Ashish shubham (ashish@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for pinboard answer
 */
'use strict';

describe('Pinboard answer', function() {
    var basePath = getBasePath(document.currentScript.src);
    var PinboardAnswerComponent;
    var $rootScope;
    var $timeout;

    beforeEach(function(done) {
        module('blink.app');
        mock(basePath, '../../sage-client/ad-hoc-sage-client', {
            AdHocSageClient: _.noop
        });
        mock(basePath, '../layout/layout-migration-service', {
            migrateLayoutTiles: jasmine.createSpy()
        });

        freshImport(basePath, './pinboard-answer').
        then(function(module) {
            inject(function(_$rootScope_, _$timeout_) {
                /* eslint camelcase: 1 */
                $rootScope = _$rootScope_;
                $timeout = _$timeout_;
            });
            PinboardAnswerComponent = module.PinboardAnswerComponent;
            done();
        });
    });

    it('render method should call layout service with appropriate tiles', function() {
        var pinboardAnswer = new PinboardAnswerComponent({
            vizIdsToShow: ['id1'],
            disallowLayoutChanges: false,
        });
        pinboardAnswer.isLinked = true;
        pinboardAnswer.layoutService = {
            redraw: jasmine.createSpy(),
            getTiles: () => []
        };
        var refViz1 = {
            isRenderReady: () => true,
            getReferencedVizIds: () => [],
            getVizType: () => 'chart',
            getId: () => 'id1'
        };
        var refViz2 = {
            getReferencedVizIds: () => [],
            getVizType: () => 'chart',
            getId: () => 'id2'
        };
        pinboardAnswer.render({
            getCompletionRatio: () => {return 1;},
            getCurrentAnswerSheet: () => {
                return {
                    getVisualizations: () => {
                        return {
                            id1: {
                                getReferencedAnswerBookId: () => 'answerid1',
                                getTitle: () => 'viz1',
                                getDescription: () => 'd1',
                                getId: () => 'id1',
                                getReferencedVisualization: () => refViz1
                            },
                            id2: {
                                getReferencedAnswerBookId: () => 'answerid2',
                                getTitle: () => 'viz2',
                                getDescription: () => 'd2',
                                getId: () => 'id2',
                                getReferencedVisualization: () => refViz2
                            }
                        }
                    },
                    getLayoutTiles: () => {
                        return [{id: 'id1'}, {id: 'id2'}]
                    }
                }
            },
            getVizIdToReferencedVizMap: () => {
                return {
                    id1: refViz1,
                    id2: refViz2
                }
            },
            getVizIdToApplicableQuestionMap: () => {
                return {
                    id1: {},
                    id2: {}
                }
            },
            hasNoData: () => false,
            getPermission: () => {
                return {
                    isLayoutAllowed: () => true,
                    answerDocumentPermissions: {
                        'answerid1': {
                            isMissingUnderlyingAccess: () => true
                        },
                        'answerid2': {
                            isMissingUnderlyingAccess: () => true
                        }
                    }
                };
            }
        });
        $timeout.flush();
        expect(pinboardAnswer.layoutService.redraw).toHaveBeenCalledWith({
            id1: {
                id: 'id1'
            }
        }, true);
    });

    it('should respect the eager loading flag', function() {
        var pinboardAnswer = new PinboardAnswerComponent({
            eagerLoadVizs: true,
        });
        pinboardAnswer.isLinked = true;
        pinboardAnswer.setScope(jasmine.createSpyObj(
            'scope',
            ['$on', '$broadcast']
        ));
        pinboardAnswer.layoutService = {
            redraw: jasmine.createSpy(),
            getTiles: jasmine.createSpy('getTiles').and.returnValue([]),
            getTilesInViewport: jasmine.createSpy('getTilesInViewport').and.returnValue([])
        };

        pinboardAnswer.onLayoutReflowDone(/*is dragged*/false);
        expect(pinboardAnswer.layoutService.getTilesInViewport).not.toHaveBeenCalled();

        pinboardAnswer.pinboardPageConfig.eagerLoadVizs = false;
        pinboardAnswer.onLayoutReflowDone(/*is dragged*/false);
        expect(pinboardAnswer.layoutService.getTilesInViewport).toHaveBeenCalled();
    });
});
