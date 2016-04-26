// Builds an unbalanced, full binary tree
var BiTree = function(leafSet) {
    // Constructor
    var root = _bfsDigest(new __Node(), function(node) {
        if (node.parent.children.indexOf(node) === 0) {
            node.children = [new __Node(), new __Node(leafSet.pop(), [])];
            node.children[0].parent = node;
            node.children[1].parent = node;
        }
    },
    function(node) {
        return node.data || leafSet.length === 1;
    },
    function(node) {
        if (leafSet.length === 1) {
            node.data = leafSet.pop();
        }
        return;
    },
    function(node) {
        return node;
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
        action(node);
        if (evaluate(node)) {
            return complete(node);
        }
        else {
            return reduce(_dfsDigest(node.children[0]), _dfsDigest(node.children[1]),
                node);
        }
    }

    // Public methods
    this.prototype.getLeaves = function() {
        return _bfsDigest(this.root, function(node) {
            return node.isLeaf();
        }, function(node) {
            return [node];
        }, function(leaf1, leaf2) {
            return leaf1.concat(leaf2);
        });
    }
};

class __Node() {
    constructor(data, children) {
        this.data = data;
        this.children = children;
        this.parent = parent;
    }

    set parent(parent) {
        this.parent = parent;
        this.id = (parent.id << 1) + parent.children.indexOf(this);
    }

    isRoot() {
        return this.parent === null;
    }

    isLeaf() {
        return this.children.length === 0;
    }
}

module.exports = BiTree;
