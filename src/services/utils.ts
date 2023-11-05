import chalk from 'chalk';
import {
  EmbedBuilder,
  Guild, GuildMember,
  Message,
  PermissionFlagsBits, PermissionResolvable,
  TextChannel,
} from 'discord.js';

import { ColorType, DiscordRoleBotConfig } from '../types';
const config: DiscordRoleBotConfig = require('../config.json');

/**
 * 
 * @param color 
 * @param message 
 * @returns 
 */
export const color = (color: ColorType, message: any) => chalk.hex(config.logs.colors[color])(message);

/**
 * 
 * @param value 
 * @returns 
 */
export const isPlural = (value: number) => value > 1 ? 's' : '';

/**
 * 
 * @param member 
 * @param permissions 
 * @returns 
 */
export const checkPermissions = (member: GuildMember, permissions: Array<PermissionResolvable>) => {
  const neededPermissions: PermissionResolvable[] = [];
  permissions.forEach(permission => {
    if (!member.permissions.has(permission)) {
      neededPermissions.push(permission);
    }
  });

  if (neededPermissions.length === 0) return null;
  return neededPermissions.map((perm: PermissionResolvable) => {
    if (typeof perm === 'string') {
      return perm.split(/(?=[A-Z])/).join(' ');
    } else {
      return Object.keys(PermissionFlagsBits)
        .find((key: string) => Object(PermissionFlagsBits)[key] === perm)
        ?.split(/(?=[A-Z])/)
        .join(' ');
    }
  });
};

/**
 * 
 * @param message 
 * @param channel 
 * @param duration 
 * @returns 
 */
export const sendTimedMessage = (message: string, channel: TextChannel, duration: number) => {
  channel.send(message)
    .then(m => setTimeout(async () => (await channel.messages.fetch(m)).delete(), duration));
  return;
};

/**
 * 
 * @param message 
 * @param color 
 * @param content 
 */
export const sendMessage = async (message: Message, color: number, content: string, startTyping: boolean = false) => {
  if (startTyping) {
    await message.channel.sendTyping();
  }

  //await message.channel.send({
  await message.reply({
    embeds: [
      new EmbedBuilder({
        color,
        description: content,
      }),
    ],
  });
};

/**
 * 
 * @param guild 
 * @param name 
 * @returns 
 */
export const getRoleByName = (guild: Guild | null, name: string) => {
  const role = guild?.roles.cache.find(r => r.name.toLowerCase() === name.toLowerCase());
  if (!role) {
    return null;
  }
  return role;
};

/**
 * 
 * @param member 
 * @param upgradeRoleNames 
 * @returns 
 */
export const hasRolePermissions = (member: GuildMember, upgradeRoleNames: string[]) => {
  const memberRoleNames = member.roles.cache.map(r => r.name);
  for (const role of upgradeRoleNames) {
    if (memberRoleNames.includes(role)) {
      return true;
    }
  }
  return false;
};