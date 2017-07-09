/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Marco (marco.albanhidalgo@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for runtime transformation.
 */
'use strict';

describe('Runtime Transformation', function() {
    var basePath = getBasePath(document.currentScript.src);
    var runtimeTransformationService;
    var mockPinboardVizCard = {
        contentCtrl: {
            sageClient: {
                getContext: () => {
                    let formatted = new sage.FormattedTokens();
                    formatted.token = [];
                    let table = new sage.ACTable();
                    table.formatted = formatted;
                    let context = new sage.ACContext();
                    context.table = [table];
                    return context;
                },
                getCurrentIndex: () => {
                    return 0;
                },
                editTable: jasmine.createSpy(),
            },
            onVizRendered: (resolve) => {}
        },
        vizModel: {
            getReferencedVisualization: function() {
                return {
                    getVisualizedColumns: () => {
                        return [];
                    },
                    getContainingAnswerModel: () => {
                        return {
                            getCurrentAnswerSheet: () => {
                                return {
                                    getChartVisualizations: () => {
                                        return [];
                                    }
                                }
                            }
                        };
                    }
                }
            }
        },
        contentType: 'DATA'
    };

    var transformTable;
    beforeEach(function (done) {
        module('blink.app');
        transformTable = jasmine.createSpy().and.callFake(() => {
            return {
                then: (context, index, queryTransformation) => {
                    return new sage.AnswerResponse();
                }
            };
        });
        ngRequireMock({
            'autoCompleteService' : {
                transformTable: transformTable
            }
        }).then(() => {
            ngRequireMock({
                'vizContextMenuUtil': {
                    createQueryTransformations: function () {
                    }
                }
            }).then(() => {
                return freshImport(basePath, './runtime-transformation-service').then(function (module) {
                    inject();
                    runtimeTransformationService = module;
                    done();
                })
            });
        });
    });

    it('should call editTable when there are only filter tokens', function () {
        let formattedTokens = new sage.FormattedTokens();
        formattedTokens.token = [new sage.RecognizedToken({
            token: 'filter'
        })];
        /* eslint-disable camelcase */
        formattedTokens.phrase = [new sage.PhraseDefinition({
            phrase_type: sage.PhraseType.FILTER_PHRASE
        })];
        /* eslint-enable camelcase */
        let serializedTransformation = sage.serialize(formattedTokens);
        runtimeTransformationService.applyTransformation(
            mockPinboardVizCard,
            serializedTransformation
        );
        expect(mockPinboardVizCard.contentCtrl.sageClient.editTable).toHaveBeenCalled();
    });

    it('should call transformTable when there are is a group by token', function() {
        let formattedTokens = new sage.FormattedTokens();
        formattedTokens.token = [new sage.RecognizedToken()];
        /* eslint-disable camelcase */
        formattedTokens.phrase = [new sage.PhraseDefinition({
            phrase_type: sage.PhraseType.GROUP_BY_COLUMN_PHRASE
        })];
        /* eslint-enable camelcase */
        let serializedTransformation = sage.serialize(formattedTokens);
        runtimeTransformationService.applyTransformation(
            mockPinboardVizCard,
            serializedTransformation
        );
        expect(transformTable).toHaveBeenCalled();
    });
});
