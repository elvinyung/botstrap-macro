'use strict';


let ast = require('./ast');
let TokenKinds = require('./tokenizer').TokenKinds;
let AstList = ast.AstList;
let AstAtom = ast.AstAtom;


// given a list of tokens, return an AstNode representing the entire AST.
let parseTokens = function parseTokens(tokens, rootCall) {
  let root = new AstList(rootCall || 'echo');
  let stack = [];
  let currentNode = root;
  while (tokens.length) {
    let token = tokens.shift();
    if (token.kind === TokenKinds.OPENBRK) {
      stack.push(currentNode);
      let nodeName = tokens.shift().lexeme;
      currentNode = new AstList(nodeName);
    }
    else if (token.kind === TokenKinds.CLOSEBRK) {
      let newChild = currentNode;
      currentNode = stack.pop();
      currentNode.addChild(newChild);
    }
    else if (token.kind === TokenKinds.LITERAL) {
      currentNode.addChild(new AstAtom(token.lexeme));
    }
  }
  return currentNode;
};

exports.parseTokens = parseTokens;
