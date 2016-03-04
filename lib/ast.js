'use strict';

class AstNode {}
exports.AstNode = AstNode;

class AstAtom extends AstNode {
  constructor(value) {
    super();
    this.value = value;
  }
}
exports.AstAtom = AstAtom;

class AstList extends AstNode {
  constructor(head, children) {
    super();
    this.head = head;
    this.children = children || [];
  }

  addChild(child) {
    this.children.push(child);
  }

  addChildren(children) {
    this.children = this.children.concat(child);
  }
}
exports.AstList = AstList;
