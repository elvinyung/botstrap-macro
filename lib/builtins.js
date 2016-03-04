'use strict';

let util = require('./util');

exports.echo = function(args) {
  return util.evalAll(args).join(' ');
};
exports.echo.description = 'returns the arguments';
exports.e = exports.echo;

exports.if = function(args) {
  return args[0].valueOf() ? args[1].valueOf() : args[2].valueOf();
};
exports.if.description = 'if $0, then returns $1, else $2'

exports.random = function(args) {
  return args[Math.floor(Math.random() * args.length)].valueOf();
};
exports.random.description = 'returns randomly from arguments';

exports.hmap = function(args) {
  let valmap = {};
  let key = args.pop().valueOf();
  while (args.length > 0) {
    valmap[args.shift().valueOf()] = args.shift();
  };
  return valmap[key] && valmap[key].valueOf();
};
exports.hmap.description = `takes the last argument as a lookup key in a mapping
of every first argument to every second argument.`;

exports.list = function(args) {
  return args;
};
exports.list.description = `builds a list structure from the arguments.`;

exports.listget = function(args) {
  let index = parseInt(args[1].valueOf());
  return args[0][index];
};
exports.listget.description = `Gets the element from the list at the specified index.`;

exports.map = function(args) {
  let callee = args.shift();
  let aggResult = [];
  let stack = this.stack;
  Array.prototype.concat.apply([], args).forEach(function(arg) {
    baseApplyMacro(callee, [arg], function(err, result) {
      aggResult.push(result);
    }, stack);
  });
  return aggResult.join(' ');;

  let callee = args
};
exports.map.description = `Returns the aggregate result of every argument passed
through the same macro.`;

exports.apply = function(args) {
  baseApplyMacro(args[0], args[1].split(' '), cb, this.stack);
};
exports.apply.description = `Applies the macro as given by $0, using $1 (split
by spaces) as the arguments.`;

exports.splitc = function(args) {
  return args.join('').split('').join(' ');
};
exports.apply.description = `Returns the arguments split into string-delimited
characters`;

exports.grid = function(args) {
  let parts = util.evalAll(args).join(' ').split(' ');
  let result = '';
  parts.forEach(function() {
    result += parts.join(' ') + '\n';
    parts.push(parts.shift());  // cycle first element to the end
  });
  return result;
};
exports.grid.description = 'Makes a grid out of word shifts';

exports.replace = function(args) {
  let text = args[0] || '';
  let pattern = args[1];
  let replacement = args[2];

  try {
    let result = text.replace(new RegExp(pattern, 'g'), replacement);
    return result;
  }
  catch (e) {
    cb(new Error('Bad regex `' + pattern + '`'));
  }
};
exports.replace.description = 'Given $0 as text, replace all instances of $1 (regex) with $2';

let ADD = '+';
let SUB = '-';
let MULT = '*';
let DIV = '/';
let MOD = '%';
let EQ = '=';

exports[ADD] = function(args) {
  let result = util.evalAll(args)
    .map(parseFloat)
    .reduce(function(sum, item) {
      return sum + item;
  }, 0);
  return result;
};
exports[ADD].description = 'Sums up all the arguments.';

exports[SUB] = function(args) {
  let args = util.evalAll(args).map(parseFloat);
  let first = args.shift();
  if (args.length <= 0) {
    return -first;
  }

  let result = args.reduce(function(sum, item) {
    return sum - item;
  }, first);

  return result;
};
exports[SUB].description = `If only one argument is supplied, then returns the
negative of that arg. Otherwise returns the result of the first argument
successively subtracted by the other arguments.`.replace(/\n/g, ' ');

exports[MULT] = function(args) {
  let result = util.evalAll(args)
    .map(parseFloat)
    .reduce(function(product, item) {
      return product * item;
  }, 0);
  return result;
};
exports[MULT].description = 'Returns the product of all the arguments.';

exports[DIV] = function(args) {
  let args = util.evalAll(args).map(parseFloat);
  let first = args.shift();
  if (args.length <= 0) {
    return 1.0 / first;
  }

  let result = args.reduce(function(quotient, item) {
    return quotient / item;
  }, first);
  return result;
};
exports[DIV].description = `If only one argument is supplied, then returns the
result of (1/arg). Otherwise returns the result of the first argument
successively divided by the other arguments.`.replace(/\n/g, ' ');

exports[MOD] = function(args) {
  let args = util.evalAll(args).map(parseFloat);
  return (args[0] % args[1]);
};
exports[MOD].description = `Returns $0 mod $1.`.replace(/\n/g, ' ');

exports[EQ] = function(args) {
  let args = util.evalAll(args);
  return args[0] == args[1] ? '1' : '';
};
exports[EQ].description = `Returns '1' if $0 is equal to $1, otherwise empty.`;
