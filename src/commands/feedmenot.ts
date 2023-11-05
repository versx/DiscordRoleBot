import { Colors, GuildMember, Message, Role } from 'discord.js';

import {
  getRoleByName, hasRolePermissions,
  isPlural,
  logDebug, logWarn,
  sendMessage,
} from '../services';
import { Command, DiscordRoleBotConfig } from '../types';
const config: DiscordRoleBotConfig = require('../config.json');

const command: Command = {
  name: 'feedmenot',
  aliases: ['rm', 'remove', 'unassign'],
  execute: async (message: Message, args: string[]) => {
    await message.delete();
    await message.channel.sendTyping();

    if (!config.servers[message.guildId!]) {
      logDebug(`No config found for guild ${message.guildId}...`);
      await sendMessage(message, Colors.Red, `:no_entry_sign: No config found for this server.`);
      return;
    }

    const arg = args.slice(1);
    const member = message.member;
    const server = config.servers[message.guildId!];
    let rolesToUnassign = arg[0].toLowerCase() === 'all'
      ? server.roleNames
      : arg[0]?.includes(',')
        ? arg[0].split(',')
        : arg;
        rolesToUnassign = rolesToUnassign.map(r => r.toLowerCase());

    // Check if user wants to unassign Free role, if so unassign it
    const hasFreeRole = server.allowFreeRole && rolesToUnassign.includes(server.freeRoleName.toLowerCase());
    if (hasFreeRole) {
      const freeRole = getRoleByName(message.guild, server.freeRoleName);
      if (!freeRole) {
        logWarn(`Free role ${server.freeRoleName} not found for guild ${message.guild?.name} (${message.guild?.id})...`);
        return;
      }
    
      await unassignMemberRole(member!, freeRole);
      await sendMessage(message, Colors.Blurple, `:white_check_mark: ${member?.user.username} has been unassigned the '${server.freeRoleName}' role.`);
      return;
    }

    // Check if user is allowed to unassign Free role
    if (!server.allowFreeRole && rolesToUnassign.includes(server.freeRoleName.toLowerCase())) {
      await sendMessage(message, Colors.Red, `:no_entry_sign: Access to the '${server.freeRoleName}' role is currently unavailable.`);
      return;
    }

    // Check if user is allowed to unassign any other role
    const hasUpgradePerms = hasRolePermissions(member!, server.upgradeRoleNames);
    const hasStrictRolePerms = server.requiresUpgradeRole && !hasUpgradePerms;
    if (!hasFreeRole && hasStrictRolePerms) {
      await sendMessage(message, Colors.Red, `:no_entry_sign: You do not have permission to use this command.`);
      return;
    }

    // Unassign roles from member
    const success = [];
    const failed = [];
    for (const roleName of rolesToUnassign) {
      const role = getRoleByName(message.guild, roleName);
      if (!role) {
        failed.push(roleName);
        continue;
      }

      await unassignMemberRole(member!, role);
      success.push(roleName);
    }

    // Send response message
    let content = '';
    if (success.length > 0) {
      const plural = isPlural(success.length);
      content += `:white_check_mark: ${member?.user.username} has been unassigned the following role${plural}: ${success.join(', ')}`;
    }
    if (failed.length > 0) {
      const plural = isPlural(failed.length);
      content += `:x: Failed to unassign the following role${plural}: ${failed.join(', ')}`;
    }
    await sendMessage(message, Colors.Blurple, content);
  },
  cooldown: 3,
  permissions: [],
};

const unassignMemberRole = async (member: GuildMember, role: Role) => {
  if (!member.roles.cache.has(role.id)) {
    return;
  }
  await member.roles.remove(role, 'User unassigned role via !feedmenot command');
};

export default command;