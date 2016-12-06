'use strict';

exports.load = function(bot, _datastore) {
  return Object.assign(
    require('./builtins/'),
    require('./builtins/slack').load(bot, _datastore)
  );
};
