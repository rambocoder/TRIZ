// https://github.com/emberjs/ember.js/blob/62e52938f48278a6cb838016108f3e35c18c8b3f/packages/ember-application/lib/system/dag.js
var GraphMaker = function () {
    var graph = {
        names: [],
        vertices: {},
        FunctionType: {
            USEFUL : {value: 0, name: "Useful"},
            HARMFUL : {value: 1, name: "Harmful"}
        },
        LinkType: {
            PRODUCES: {value: 0, name: "Produces"},
            COUNTERACTS: {value: 1, name: "Counteracts"}
        },
        addVertex: function (name, functionType) {
            if (!name) {
                return;
            }
            if (graph.vertices.hasOwnProperty(name)) { // does the object have specified property
                return graph.vertices[name];
            }
            var vertex = {
                name: name, functionType: functionType, incoming: {}, incomingNames: [], hasOutgoing: false, value: null
            };
            graph.vertices[name] = vertex;
            graph.names.push(name);
            return vertex;
        },
        addEdge: function (fromName, toName, linkType) {
            if (!fromName || !toName || fromName === toName) {
                return; // validation check and reflexive link check
            }
            var from = graph.addVertex(fromName);
            var to = graph.addVertex(toName);
            if (to.incoming.hasOwnProperty(fromName)) {
                return; // link already exists
            }
            function checkCycle(vertex, path) {
                if (vertex.name == toName) {
                    throw new Error("cycle detected: " + toName + " <- " + path.join(" <-"));
                }
            }

            function checkCauses(vertex, path) {

            }

            graph.visit(from, checkCycle);
            from.hasOutgoing = true;
            var edge = {
                from: from, linkType: linkType
            };
            to.incoming[fromName] = edge;
            to.incomingNames.push(fromName);
        },
        visit: function (vertex, fn, visited, path) {
            var name = vertex.name,
                vertices = vertex.incoming,
                names = vertex.incomingNames,
                len = names.length,
                i;
            if (!visited) {
                visited = {};
            }
            if (!path) {
                path = [];
            }
            if (visited.hasOwnProperty(name)) {
                return;
            }
            path.push(name);
            visited[name] = true;
            for (i = 0; i < len; i++) {
                graph.visit(vertices[names[i]].from, fn, visited, path);
            }
            fn(vertex, path);
            path.pop();
        },
        generateProblemStatements: function() {
            var visited = {},
                vertices = this.vertices,
                names = this.names,
                len = names.length,
                i, vertex;
            for (i = 0; i < len; i++) {
                vertex = vertices[names[i]];
                if (vertex.hasOutgoing == false) {
                    visit(vertex, null, visited);
                }
            }
        },
        generateProblemStatementFor: function(name) {
            var vertex;
            var results = [];
            if (graph.vertices.hasOwnProperty(name)) { // does the object have specified property
                vertex = graph.vertices[name];
            }else{
                throw new Error("Vertex " + name + " does not exist");
            }
            switch(vertex.functionType)
            {
                case this.FunctionType.USEFUL:
                    for (var i in vertex.incoming) {

                        var edge = vertex.incoming[i];

                        switch(edge.linkType) {
                            case this.LinkType.PRODUCES:
                                // Find a way to improve name does not require edge.from.name
                                results.push("Find an alternative way (" + name
                                    + "), which does not require (" + edge.from.name  + ")");
                                break;
                            case this.LinkType.COUNTERACTS:
                                // Find a way to improve name is not influenced by edge.from.name
                                results.push("Find the way to prevent (" + name
                                    + "), which does not require (" + edge.from.name  + ")");
                                break;
                        }
                    }
                    break;
                case this.FunctionType.HARMFUL:
                    for (var i in vertex.incoming) {

                        var edge = vertex.incoming[i];

                        switch(edge.linkType) {
                            case this.LinkType.PRODUCES:
                                // Find a way to counteract name under the condition of edge.from.name
                                results.push("Find the way to prevent (" + name
                                    + "), under the condition of (" + edge.from.name  + ")");
                                break;
                            case this.LinkType.COUNTERACTS:
                                // Harmful function is eliminated
                                // Find a way to counteract one
                                break;
                        }
                    }
                    break;
            }

            return results;
        }
    };
    return graph;
};
/*
g = GraphMaker();
g.addVertex("one", g.FunctionType.USEFUL);
g.addVertex("two", g.FunctionType.HARMFUL);
g.addVertex("three", g.FunctionType.HARMFUL);
g.addEdge("one", "two", g.LinkType.PRODUCES);
g.addEdge("two", "three", g.LinkType.COUNTERACTS);
g.addEdge("three", "one");
console.log(g.addVertex("two"));
*/

// this doesnt work
//exports.graph = function() {return new GraphMaker()};

module.exports = function() {
    return new GraphMaker();
}
