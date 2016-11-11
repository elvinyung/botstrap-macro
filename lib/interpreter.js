'use strict';

var baseApplyMacro = exports.baseApplyMacro = function baseApplyMacro(callee, args, cb, macros, callStack) {
  var template = macros[callee];
  if (!template) {
    cb && cb(new Error('Macro not found'));
    return;
  }

  var result;
  if (typeof template === 'function') {
    template.call({
      stack: callStack
    }, cb, args);
  }
  else {
    // this converts it to valid macro source.
    var resultSrc = template
      .replace(/\$@/g, args.join(' '))
      .replace(/\$(\d+)/g, function(match, p1) {
        return (args[Number(p1)] || '');
      });

    // tokenize and parse this source
    var tokens = tokenizeExpr(resultSrc);
    if (tokens.some(function(token) { token.kind == TokenKinds.OPENBRK })) {
      parseTokens(tokens, 'echo', cb, callStack);
    } else {
      cb(null, resultSrc);
    }
  }
};

var parseTokens = exports.parseTokens = function parseTokens(tokens, callee, macros, cb, callStack) {
  // hack: if no cb, we don't have to do anything since everything we do
  // is invisible.
  if (!cb) {
    return;
  }

  // do call stack things
  callStack = callStack || [];
  callStack.push(callee);

  // initialize nesting stack
  var stack = [];
  var stackFrame = {
    callee: callee,
    args: []
  };

  callStack = callStack || [];

  // read tokens left to right
  while (tokens.length > 0) {
    var token = tokens.shift();
    if (token.kind === TokenKinds.OPENBRK) {
      var newCallee = tokens.shift();
      if (callStack.length > 500) {
        cb(new Error(errMsgs.cantBeRecursive));
        break;
      }
      else if (macros[newCallee] === undefined) {
        cb(new Error(errMsgs.noMacro));
        break;
      }
      else {
        stack.push(stackFrame);
        stackFrame = {
          callee: newCallee,
          args: []
        };
      }
    }
    else if (token.kind === TokenKinds.CLOSEBRK && stack.length > 0) {
      baseApplyMacro(stackFrame.callee, stackFrame.args, macros,
        function (err, result) {
          if (err) {
            cb(err);
            return;
          }
          stackFrame = stack.pop();
          stackFrame.args.push(result);
        });

    else if (token.kind === TokenKinds.REGEX) {
      stackFrame.args.push(token.lexeme);
    }
    else {
      stackFrame.args.push(token);
    }
  }

  baseApplyMacro(stackFrame.callee, stackFrame.args, cb);
};

var interpretExpr = exports.interpretExpr = function interpretExpr(expr, cb, macros) {
  var tokens = tokenizeExpr(expr);
  parseTokens(tokens, 'echo', cb, macros);
};

var evalMacro = exports.evalMacro = function evalMacro(expr) {

};
