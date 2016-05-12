'use strict';

// Builds an unbalanced, full binary tree
var BiTree = function(leafSet, emptyNodeClass) {
    // Constructor
    var _root = _bfsDigest(new __Node(emptyNodeClass ? new emptyNodeClass : undefined),
        function(node) {
            if (node.isRoot() || node.parent.children.indexOf(node) === 0) {
                node.children = [
                    new __Node(emptyNodeClass ? new emptyNodeClass : undefined),
                    new __Node(leafSet.pop(), [])
                ];
                node.children[0].parent = node;
                node.children[1].parent = node;
                if (leafSet.length === 1) {
                    node.children[0].data = leafSet.pop();
                }
            }
        },
    function(node) {
        return (node.parent && node.parent.children.indexOf(node) === 1) || leafSet.length === 0;
    },
    function(node) {
        return node;
    },
    function(node) {
        return node.parent;
    });


    // Constructor 2
    // This one builds a perfect, full BST
    /*
    var root = _bfsDigest(treeObj, function(node) {
        return treeObj.children.length > 0;
    }, function(treeObj) {
        return new __Node(treeObj.data, []);
    }, function(node0, node1, treeObj) {
        var node = new __Node(treeObj.data, [node0, node1]);
        node0.parent = node;
        node1.parent = node;
        return node;
    });
    */

    // Private methods
    function _bfsDigest(node, action, evaluate, complete, reduce) {
        // TODO: (wbjacks) close over callbacks
        action(node);
        if (evaluate(node)) {
            return complete(node);
        }
        else {
            return reduce(_bfsDigest(node.children[0], action, evaluate, complete, reduce),
                _bfsDigest(node.children[1], action, evaluate, complete, reduce), node);
        }
    }

    // Public methods
    this.getLeaves = function() {
        return _bfsDigest(_root, function() {}, function(node) {
            return node.isLeaf();
        }, function(node) {
            return [node];
        }, function(leaf1, leaf2) {
            return leaf1.concat(leaf2);
        });
    }

    // TODO: (wbjacks) could probably hash this but w/e
    this.getNodeAtId = function(id) {
        return _bfsDigest(_root, function(){},
        function(node) {
            return node.id === id || node.isLeaf();
        },
        function(node) {
            if (node !== null && node.id === id) {
                return node
            }
            return null;
        },
        function(node1, node2) {
            return node1 === null ? node2 : node1;
        })
    }

    this.serialize = function() {
        return _root.serialize();
    }

};

class __Node {
    constructor(data, children) {
        this.data = data;
        this.children = children ? children : [];
        this.id = 1;
    }

    set parent(parent) {
        this._parent = parent;
        this.id = (parent.id << 1) + parent.children.indexOf(this);
    }

    get parent() {
        return this._parent;
    }

    isRoot() {
        return !!!this.parent;
    }

    isLeaf() {
        return this.children.length === 0;
    }

    serialize() {
        return {
            id: this.id,
            data: this.data,
            children: this.children.map(function(child) {
                return child.serialize();
            })
        };
    }
}

module.exports = BiTree;
