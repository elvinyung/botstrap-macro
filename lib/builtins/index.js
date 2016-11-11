'use strict';
// TODO: split off into various different modules.

exports.echo = function(cb, args) {
  cb(null, args.join(' '));
};
exports.echo.description = 'returns the arguments';
exports.e = exports.echo;

exports.if = function(cb, args) {
  cb(null, args[0] ? args[1] : args[2]);
};
exports.if.description = 'if $0, then returns $1, else $2'

exports.random = function(cb, args) {
  cb(null, args[Math.floor(Math.random() * args.length)]);
};
exports.random.description = 'returns randomly from arguments';

exports.hmap = function(cb, args) {
  var valmap = {};
  var key = args.pop();
  while (args.length > 0) {
    valmap[args.shift()] = args.shift();
  };
  cb(null, valmap[key]);
};
exports.hmap.description = 'takes the last argument as a lookup key in a mapping of every first argument to every second argument.';

exports.map = function(cb, args) {
  var callee = args.shift();
  var aggResult = [];
  var stack = this.stack;
  Array.prototype.concat.apply([], args).forEach(function(arg) {
    baseApplyMacro(callee, [arg], function(err, result) {
      aggResult.push(result);
    }, stack);
  });
  cb(null, aggResult.join(' '));
};
exports.map.description = 'Returns the aggregate result of every argument passed through the same macro.';

exports.apply = function(cb, args) {
  baseApplyMacro(args[0], args[1].split(' '), cb, this.stack);
};
exports.apply.description = 'Applies the macro as given by $0, using $1 (split by spaces) as the arguments.';

exports.splitc = function(cb, args) {
  cb(null, args.join('').split('').join(' '));
};
exports.apply.description = 'Returns the arguments split into string-delmited characters';

exports.grid = function(cb, args) {
  var parts = args.join(' ').split(' ');
  var result = '';
  parts.forEach(function() {
    result += parts.join(' ') + '\n';
    parts.push(parts.shift());  // cycle first element to the end
  });
  cb(null, result);
};
exports.grid.description = 'Makes a grid out of word shifts';

exports.replace = function(cb, args) {
  var text = args[0] || '';
  var pattern = args[1];
  var replacement = args[2] || '';

  try {
    console.log(pattern);
    var matcher = Object.getPrototypeOf(pattern) == RegExp.prototype ?
      pattern : new RegExp(pattern, 'g');
    var result = text.replace(pattern, replacement);
    cb(null, result);
  }
  catch (e) {
    cb(e);
  }
};
exports.replace.description = 'Given $0 as text, replace all instances of $1 (regex) with $2';

var RandExp = require('randexp');

let ensureBounds = (num, lower, upper) => {
  if (num < lower) {
    return lower;
  }

  if (num > upper) {
    return upper;
  }

  return num;
}

exports.randexp = function(cb, args) {
  let pattern = Object.getPrototypeOf(args[0]) == RegExp.prototype ?
    args[0] : args.join(' ');

  let REP_LOWER_BOUND = 0;
  let REP_UPPER_BOUND = 100;

  try {
    let randexp = new RandExp(pattern);
    let result = randexp.gen();

    if (result.length > 4000) {
      throw new Error(`So long!`);
    }

    cb(null, result);
  }
  catch (e) {
    console.log(e.stack);
    cb(e);
  }
};
exports.randexp.description = 'Generate a random string that matches the given regex.';

exports['add'] = function(cb, args) {
  cb(null, args.map(Number).reduce((a, b) => a + b).toString());
}

exports['sub'] = function(cb, args) {
  cb(null, args.map(Number).reduce((a, b) => a - b).toString());
}

exports['mult'] = function(cb, args) {
  cb(null, args.map(Number).reduce((a, b) => a * b).toString());
}

exports['div'] = function(cb, args) {
  cb(null, args.map(Number).reduce((a, b) => a / b).toString());
}

exports['mod'] = function(cb, args) {
  cb(null, args.map(Number).reduce((a, b) => a % b).toString());
}
