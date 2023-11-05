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
  name: 'feedme',
  aliases: ['add', 'assign'],
  execute: async (message: Message, args: string[]) => {
    //await message.delete();
    await message.channel.sendTyping();

    if (!config.servers[message.guildId!]) {
      logDebug(`No config found for guild ${message.guildId}...`);
      await sendMessage(message, Colors.Red, `:no_entry_sign: No config found for this server.`);
      return;
    }

    const arg = args.slice(1);
    const member = message.member;
    const server = config.servers[message.guildId!];
    let rolesToAssign = arg[0].toLowerCase() === 'all'
      ? server.roleNames
      : arg[0]?.includes(',')
        ? arg[0].split(',')
        : arg;
    rolesToAssign = rolesToAssign.map(r => r.toLowerCase());

    // Check if user wants to assign Free role, if so assign it
    const hasFreeRole = server.allowFreeRole && rolesToAssign.includes(server.freeRoleName.toLowerCase());
    if (hasFreeRole) {
      const freeRole = getRoleByName(message.guild, server.freeRoleName);
      if (!freeRole) {
        logWarn(`Free role ${server.freeRoleName}' not found for guild ${message.guild?.name} (${message.guild?.id})...`);
        return;
      }
    
      await assignMemberRole(member!, freeRole);
      await sendMessage(message, Colors.Blurple, `:white_check_mark: ${member?.user.username} has been assigned the '${server.freeRoleName}' role.`);
      return;
    }

    // Check if user is allowed to assign Free role
    if (!server.allowFreeRole && rolesToAssign.includes(server.freeRoleName.toLowerCase())) {
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

    // Unassign roles to member
    const success = [];
    const failed = [];
    for (const roleName of rolesToAssign) {
      const role = getRoleByName(message.guild, roleName);
      if (!role) {
        failed.push(roleName);
        continue;
      }

      await assignMemberRole(member!, role);
      success.push(roleName);
    }

    // Send response message
    let content = '';
    if (success.length > 0) {
      const plural = isPlural(success.length);
      content += `:white_check_mark: ${member?.user.username} has been assigned the following role${plural}: ${success.join(', ')}`;
    }
    if (failed.length > 0) {
      const plural = isPlural(failed.length);
      content += `:x: Failed to assign the following role${plural}: ${failed.join(', ')}`;
    }
    await sendMessage(message, Colors.Blurple, content);
  },
  cooldown: 3,
  permissions: [],
};

const assignMemberRole = async (member: GuildMember, role: Role) => {
  if (member.roles.cache.has(role.id)) {
    return;
  }
  await member.roles.add(role, 'User assigned role via !feedme command');
};

export default command;