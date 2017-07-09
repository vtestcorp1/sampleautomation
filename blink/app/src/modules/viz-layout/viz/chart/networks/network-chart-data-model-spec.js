/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Francois Chabbey(francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for network chart data model
 */
'use strict';

describe('Network chart data model', function () {

    var basePath = getBasePath(document.currentScript.src),
        Network,
        chartModel = {
            getXAxisColumns: function() { return []},
            getDataArray: function () {
                return [
                    {
                        getData: function () {
                            return [
                                ['a1', 'b1', 1],
                                ['a2', 'b2', 2],
                                ['a3', 'b3', 3],
                                ['a4', 'b4', 4]
                            ]
                        }
                    },
                    {
                        getData: function () {
                            return [['b2', 'c1', 1],
                                ['b2', 'c2', 2],
                                ['b2', 'c3', 3],
                                ['b3', 'c3', 4]]
                        }
                    }
                ]
            },
            getQueryDefinitions: function () {
                return [
                    {
                        xAxisColumns: [
                            {
                                getId: function()  { return 'a';},
                                getDataRowIndex: function() { return 0;}
                            }, {
                                getId: function()  { return 'b';},
                                getDataRowIndex: function() { return 1;}
                            }
                        ]
                        ,
                        yAxisColumns: [
                            {
                                getId: function()  { return 'd';},
                                getDataRowIndex: function() { return 2;}
                            }
                        ]
                    }, {
                        xAxisColumns: [
                            {
                                getId: function()  { return 'b';},
                                getDataRowIndex: function() { return 0;}
                            }, {
                                getId: function()  { return 'c';},
                                getDataRowIndex: function() { return 1;}
                            }
                        ],
                        yAxisColumns: [
                            {
                                getId: function()  { return 'd';},
                                getDataRowIndex: function() { return 2;}
                            }
                        ]
                    }
                ];
            }
        };

    beforeEach(function (done) {
        module('blink.app');
        freshImport(basePath, './network-chart-data-model')
            .then(function (module) {
                console.log(module);
                Network = module.NetworkChartDataModel;
                done();
            });
    });
    it('it should have correct links', function(){
        var model = new Network(chartModel);
        expect(model.links.length).toBe(8);
    });
    it('it should have correct nodes', function(){
        var model = new Network(chartModel);
        expect(model.nodes.length).toBe(11);
    });
    it('nodeById should return correct nodes', function(){
        var model = new Network(chartModel);
        model.nodes.forEach((node) => {
            expect(model.getNodeByKey(node.key)).toBe(node);
        })
    })
});
