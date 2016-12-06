'use strict';

exports.load = (bot, datastore) => {
  let api = {};

  api.channels = (cb, args) => {
    cb(null, Object.keys(datastore.channels).map(id => `<#${id}>`).join(' '));
  };

  api.members = (cb, args) => {
    let memberList;

    let everyone = datastore.users;

    if (args[0]) {
      let channel = datastore.getChannelByName(args[0]);

      if (!channel) {
        cb(new Error(`#${args[0]}? Never heard of that!`));
        return;
      }

      if (!channel.is_member) {
        cb(new Error(`doge me into <#${channel.id}>`));
        return;
      }

      memberList = channel.members.map(id => `<@${id}>`);
    } else {
      memberList = Object.keys(datastore.users).map(id => `<@${id}>`);
    }

    cb(null, memberList.join(' '));
  };

  return api;
};
