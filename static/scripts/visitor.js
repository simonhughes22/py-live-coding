function Visitor() {
    var self = this;

    var Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement'
    };

    // Executes visitor on the object and its children (recursively).
    function traverse(object, visitors, parent) {
        for (var i = 0; i < visitors.length; i++) {
            visitors[i].visit(object, parent);
        }

        var path;
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                var child = object[key];
                path = [object];
                path.push(parent);

                if (typeof child === 'object' && child !== null) {
                    traverse(child, visitors, path);
                }
            }
        }
    }

    function tagWithType(array, type) {
        for (var i = 0; i < array.length; i++) {
            array[i].type = type;
        }
        return array;
    }   

    function AssignmentVisitor() {
        var assignmentList = [];

        return {
            data: assignmentList,
            visit: function (node, path) {

                var leftLocn, rightNode;

                if (node.type === Syntax.VariableDeclarator && node.init) {
                    leftLocn = node.id.loc;
                    rightNode = node.init;
                }
                else if (node.type === Syntax.AssignmentExpression) {
                    leftLocn = node.left.loc;
                    rightNode = node.right;
                }
                else if (node.type === Syntax.Property) {
                    leftLocn = node.key.loc;
                    rightNode = node.value;
                }
                
                if (leftLocn && rightNode) {
                    if(rightNode.type === Syntax.ObjectExpression)
                    {
                        return;
                    }

                    assignmentList.push({
                        
                        leftLocn: { line: leftLocn.end.line, ch: leftLocn.end.column }, 

                        // insertion locations
                        start: rightNode.range[0],
                        end:   rightNode.range[1]                        
                    });
                }
            }
        }
    }

    function FunctionVisitor(code) {
        var functionList = [];

        return {
            data: functionList,
            visit: function (node, path) {

                var parent = path[0];
                var name = '[Anonymous]';

                if (node.type === Syntax.FunctionDeclaration) {
                    name = node.id.name;
                }
                else if (node.type === Syntax.FunctionExpression) {


                    if (parent.type === Syntax.AssignmentExpression) {
                        if (typeof parent.left.range !== 'undefined') {
                            name = code.slice(parent.left.range[0], parent.left.range[1] + 1);
                        }
                    } else if (parent.type === Syntax.VariableDeclarator) {
                        name = parent.id.name;
                    } else if (parent.type === Syntax.CallExpression) {
                        name = parent.id ? parent.id.name : '[Anonymous]';
                    } else if (typeof parent.length === 'number') {
                        name = parent.id ? parent.id.name : '[Anonymous]';
                    } else if (typeof parent.key !== 'undefined') {
                        if (parent.key.type === 'Identifier') {
                            if (parent.value === node && parent.key.name) {
                                name = parent.key.name;
                            }
                        }
                    }
                    else {
                        return;
                    }
                }
                else {
                    return;
                }

                var range = node.body.range;
                functionList.push({
                    name: name,
                    node: node,

                    start: range[0],
                    end:   range[1]
                });
            }
        }
    }

    self.visit = function (tree, code) {

        var fnVisitor = new FunctionVisitor(code);
        var assignmentVisitor = new AssignmentVisitor();
        var visitors = [fnVisitor, assignmentVisitor];

        traverse(tree, visitors, []);
        return {
            functions: tagWithType(fnVisitor.data, "function"),
            assignments: tagWithType(assignmentVisitor.data, "assignment"),
        };
    }

    return self;
}