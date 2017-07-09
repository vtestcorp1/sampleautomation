/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Unit test for graph model
 */

'use strict';


describe('graph-model ', function () {

    var graph,
        vertices = [],
        edges = [],
        graphVertices,
        GraphModel,
        Vertex;

    var basePath = getBasePath(document.currentScript.src);

    for (var i = 1; i < 10; i++) {
        var vertex = {
            id:  ''+i,
            value: ''+i
        };
        vertices.push(vertex);
    }

    edges.push({
        from: '1',
        to: '3',
        value:'a',
        key:'a'
    });

    edges.push({
        from: '1',
        to: '9',
        value:'b',
        key:'b'
    });

    edges.push({
        from: '2',
        to: '6',
        value:'c',
        key:'c'
    });

    edges.push({
        from: '3',
        to: '5',
        value:'d',
        key:'d'
    });

    edges.push({
        from: '3',
        to: '2',
        value:'e',
        key:'e'
    });

    edges.push({
        from: '5',
        to: '7',
        value:'f',
        key:'f'
    });

    edges.push({
        from: '5',
        to: '4',
        value: 'g',
        key: 'g'
    });

    edges.push({
        from: '6',
        to: '8',
        value: 'h',
        key: 'h'
    });

    edges.push({
        from: '7',
        to: '6',
        value: 'i',
        key: 'i'
    });

    edges.push({
        from: '7',
        to: '9',
        value: 'j',
        key: 'j'
    });


    // We use this graph
    // 1-3-5-7-9
    //   | | |
    //   2 4 6-8
    //   |___|
    /// / 1 -> 9
    // V1 has 2 edges
    // V2 has 1 edges
    // V3 has 2 edges
    // V4 has 0 edges
    // V5 has 2 edges
    // V6 has 1 edge
    // V7 has 2 edges
    // V8-9 have 0 edges

    var numberOfEdgesForVertex = [2,1,2,0,2,1,2,0,0];

    beforeEach(function(done) {
        module('blink.app');

        Promise.all([
            freshImport(basePath, './graph-model'),
            freshImport(basePath, './vertex-model')
        ]).then(function(modules) {
            GraphModel = modules[0].default;
            Vertex = modules[1].default;
            inject();

            graphVertices = vertices.map(function(item) {
                return new Vertex(item, item.id);
            });
            graph = new GraphModel(graphVertices);
            edges.forEach(function(edge) {
                graph.addEdge(edge, edge.from, edge.to);
            });
            done();
        }, function(err){
            console.error(err);
        });
    });

    it('should return a graph', function(){
        expect(typeof(graph.getNumberOfVertices)).toEqual('function');
    });

    it('should have correct number of vertices', function() {
        expect(graph.getNumberOfVertices()).toEqual(vertices.length);
    });

    it('should have correct number of edges', function() {
        expect(graph.getNumberOfEdges()).toEqual(edges.length);
    });

    it("shoud return no vertex if a non-existing id is given", function(){
        expect(graph.getVertex('_')).toBeUndefined();
    });

    it('should have correct lists for each vertices', function() {
        vertices.forEach(function (value){
            var list = graph.getVertex(value.id);
            var numberOfEdges = list.getEdges().length;
            expect(numberOfEdgesForVertex[value.id-1]).toBe(numberOfEdges);
        });
    });

    it('should return the correct source/target for a given edge', function(){
        var list = graph.getVertex('1').getEdges();
        var edge = list[0];

        expect(edge.sourceVertex).toEqual(graphVertices[0]);
        expect(edge.sourceVertex.data).toEqual(vertices[0]);
        expect(edge.destinationVertex).toEqual(graphVertices[2]);
        expect(edge.destinationVertex.data).toEqual(vertices[2]);

        edge = list[1];

        expect(edge.sourceVertex).toEqual(graphVertices[0]);
        expect(edge.sourceVertex.data).toEqual(vertices[0]);
        expect(edge.destinationVertex).toEqual(graphVertices[8]);
        expect(edge.destinationVertex.data).toEqual(vertices[8]);
    });

    it('should return an edge when correct values are provide', function() {
        var goodData = {
            from: '3',
            to: '4',
            value: 'dummyValue',
            key: 'dummyKey'
        };
        var edge = graph.addEdge(goodData, goodData.from, goodData.to);

        expect(edge.data.value).toBe('dummyValue');
        expect(graph.getNumberOfEdges()).toBe(edges.length+1);
        expect(graph.getVertex('3').getEdges().length).toBe(numberOfEdgesForVertex[2] + 1); // check what happends
    });


    it ('should return null when inserting an edge with no model', function() {
        var edge = graph.addEdge();

        expect(edge).toBeNull();
    });

    it('should return null when inserting an edge with no corresponding source vertex', function() {
        var failingEdge = {
            from : 'incorrectFrom',
            to: '4',
            value: 'dummyValue',
            key: 'dummyKey'
        };

        var edge = graph.addEdge(failingEdge, failingEdge.from, failingEdge.to);
        expect(edge).toBeNull();
    });
});
