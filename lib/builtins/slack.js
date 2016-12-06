'use strict';

exports.load = (bot, datastore) => {
  let api = {};

  let listChannelMembers = (chanArg) => {
    let memberList;

    if (chanArg) {
      let tryIdMatch = chanArg.match(/\<#(\w+)|.*>/);
      let channel = tryIdMatch ? datastore.getChannelById(tryIdMatch[1]) :
        datastore.getChannelByName(chanArg) ||
        datastore.getChannelById(chanArg);

      if (!channel) {
        throw new Error(`#${chanArg}? Never heard of that!`);
        return;
      }

      if (!channel.is_member) {
        throw new Error(`doge me into <#${channel.id}>`);
        return;
      }

        memberList = channel.members;
      } else {
        memberList = Object.keys(datastore.users);
      }

      return memberList;
    }

  let filterHumans = (memberList) => {
    return (memberList || [])
      .filter(member => !datastore.getUserById(member).is_bot);
  }

  let prettifyMemberList = (memberList) => {
    return memberList.map(id => `<@${id}>`)
      .join(' ');
  }

  api.channels = (cb, args) => {
    cb(null, Object.keys(datastore.channels).map(id => `<#${id}>`).join(' '));
  };

  api.members = (cb, args) => {
    try {
      cb(null, prettifyMemberList(listChannelMembers(args[0]).join(' ')));
    }
    catch (e) {
      cb(e);
    }
  };

  api.humans = (cb, args) => {
    try {
      cb(null, prettifyMemberList(filterHumans(listChannelMembers(args[0]))));
    }
    catch (e) {
      cb(e);
    }
  }

  api.here = (cb, args) => {
    if (message) {
      let message = args.props.message;
      cb(null, prettifyMemberList(listChannelMembers(message.channel.id)));
    }
    else {
      cb(new Error(`how did I get here?`))
    }
  }

  api.humanshere = (cb, args) => {
    try {
      let message = args.props.message;
      cb(null, prettifyMemberList(
        filterHumans(listChannelMembers(message.channel.id))));
    }
    catch (e) {
      cb(e);
    }
  }

  return api;
};
