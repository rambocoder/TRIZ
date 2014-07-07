var triz = require("../triz");


describe("Basic functionality", function() {
    it("should add two nodes and link them", function() {
        var g = triz();
        g.addVertex("one", g.FunctionType.USEFUL);
        g.addVertex("two", g.FunctionType.HARMFUL);
        g.addEdge("one", "two", g.LinkType.PRODUCES);
        expect(g.addVertex("one").name).toBe("one");
        expect(g.addVertex("two").name).toBe("two");
    })
});

describe("Graph constraints", function() {
    it("Vertex should not allow reflexive link", function() {
        var g = triz();
        g.addVertex("one", g.FunctionType.USEFUL);
        g.addVertex("two", g.FunctionType.HARMFUL);
        g.addEdge("one", "one", g.LinkType.PRODUCES);

        expect(g.addVertex("one").hasOutgoing).toBe(false);
        expect(g.addVertex("two").hasOutgoing).toBe(false);
        expect(g.addVertex("one").incoming).toEqual({});
    });

    it("should not allow circles", function() {
        var g = triz();
        g.addVertex("one", g.FunctionType.USEFUL);
        g.addVertex("two", g.FunctionType.HARMFUL);
        g.addVertex("three", g.FunctionType.HARMFUL);
        g.addEdge("one", "two", g.LinkType.PRODUCES);
        g.addEdge("two", "three", g.LinkType.PRODUCES);
        expect(function() {
                g.addEdge("three", "one", g.LinkType.PRODUCES);
            }).toThrow("cycle detected: one <- three <-two <-one");
    })
});

describe("Classifications", function() {
    it("Useful function produces useful function", function(){
        var g = triz();
        g.addVertex("one", g.FunctionType.USEFUL);
        g.addVertex("two", g.FunctionType.USEFUL);
        g.addEdge("one", "two", g.LinkType.PRODUCES);
        var result = g.generateProblemStatementFor("two");
        expect(result[0]).toBe(
                "Find an alternative way (two), which does not require (one)");
    });

    it("Useful function produces harmful function", function(){
        var g = triz();
        g.addVertex("one", g.FunctionType.USEFUL);
        g.addVertex("two", g.FunctionType.HARMFUL);
        g.addEdge("one", "two", g.LinkType.PRODUCES);
        var result = g.generateProblemStatementFor("two");
        expect(result[0]).toBe(
            "Find the way to prevent (two), under the condition of (one)");
    });

    it("Useful function counteracts harmful function", function(){
        var g = triz();
        g.addVertex("one", g.FunctionType.USEFUL);
        g.addVertex("two", g.FunctionType.HARMFUL);
        g.addEdge("one", "two", g.LinkType.COUNTERACTS);
        var result = g.generateProblemStatementFor("two");
        expect(result.length).toBe(0);
    });

    it("Useful function counteracts useful function", function(){
        var g = triz();
        g.addVertex("one", g.FunctionType.USEFUL);
        g.addVertex("two", g.FunctionType.USEFUL);
        g.addEdge("one", "two", g.LinkType.COUNTERACTS);
        var result = g.generateProblemStatementFor("two");
        expect(result[0]).toBe(
            "Find the way to prevent (two), which does not require (one)");
    });
})
