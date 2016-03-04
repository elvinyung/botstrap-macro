'use strict';

exports.evalAll = function evalAll(list, library) {
  return list.map(function(node) {
    return node.eval(library);
  });
};
