/**
* Copyright: ThoughtSpot Inc. 2012-2016
* Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
*
* @fileoverview Spec for context-menu-util
*/

'use strict';


describe('Context menu util', function() {
    let basePath = getBasePath(document.currentScript.src),
        getInputForNetworkContextMenu,
        missingAccess = false,
        menuItemsId = {
            leaf: 'LEAF_LEVEL',
            exclude: 'EXCLUDE',
            include: 'INCLUDE',
            drill: 'DRILL'
        },
        nodes = [
            {
                key: 'n1',
                name: 'n1',
                baseColumnIndex: 0,
                value: 12
            },
            {
                key: 'n2',
                name: 'n2',
                baseColumnIndex: 1,
                value: 12
            },
            {
                key: 'n3',
                name: 'n3',
                value: 12
            }
        ],
        links = [
            {
                key: 'a',
                name: 'a',
                value: 12,
                source: nodes[0],
                target: nodes[1]
            },
            {
                key: 'b',
                name: 'b',
                value: 14,
                source: nodes[0],
                target: nodes[1]
            },
            {
                key: 'c',
                name: 'c',
                value: 19,
                source: nodes[0],
                target: nodes[1]
            },
        ];

    let chartModel = {
        getDataModel: function() {
            return {
                links: links,
                nodes: nodes
            }
        },
        isMissingUnderlyingDataAccess: function() { return missingAccess; },
        getYAxisColumns: function() {
            return [
                {
                    getName: function () {
                        return 'measure'
                    },
                    isAttribute: function () {
                        return false;
                    },
                    isDateColumn: function () {
                        return false;
                    },
                    isGrowth: function() {
                        return false;
                    },
                    isFormula: function() {
                        return false;
                    }
                }
            ]
        },
        getXAxisColumns: function() {
            return [
                {
                    getName: function() {return 'a'},
                    isAttribute: function() { return true;},
                    isDateColumn: function() { return false;}
                },
                {
                    getName: function() {return 'b'},
                    isAttribute: function() { return true;},
                    isDateColumn: function() { return false;}
                }
            ];
        }
    };

    beforeEach(function (done) {
        module('blink.app');
        freshImport(basePath, './chart-context-menu-util')
            .then(function(module) {
                getInputForNetworkContextMenu = module.getInputForNetworkContextMenu;
                inject(function () {
                });
                done();
            }).catch(function (error) {
                done.fail(error);
            });
    });

    it('for netword data model, should return correct configuration for nodes', function(){
        // for node, drill down and underlying should be disabled
        let menuItems = getMenuItemsFromMenuConfig(
            getInputForNetworkContextMenu(chartModel, nodes[0])
        );
        expect(menuItems.exclude.enabled).toBe(true);
        expect(menuItems.include.enabled).toBe(true);
        expect(menuItems.leafLevel.enabled).toBe(false);
        expect(menuItems.drill.enabled).toBe(false);
    });

    it('for netword data model, should return correct configuration for links', function(){
        // for node, drill down and underlying should be disabled
        let menuItems = getMenuItemsFromMenuConfig(
            getInputForNetworkContextMenu(chartModel, links[0])
        );
        expect(menuItems.exclude.enabled).toBe(false);
        expect(menuItems.include.enabled).toBe(false);
        expect(menuItems.leafLevel.enabled).toBe(true);
        expect(menuItems.drill.enabled).toBe(true);
    });

    function getMenuItemsFromMenuConfig(menuConfig) {
        return {
            exclude:  menuConfig.menuItems.find((f) => f.id === menuItemsId.exclude),
            include: menuConfig.menuItems.find((f) => f.id === menuItemsId.include),
            leafLevel: menuConfig.menuItems.find((f) => f.id === menuItemsId.leaf),
            drill: menuConfig.menuItems.find((f) => f.id === menuItemsId.drill)
        }
    }
});
