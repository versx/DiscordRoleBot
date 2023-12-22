import chalk from 'chalk';
import {
  Colors,
  EmbedBuilder,
  Guild, GuildMember,
  Message,
  PermissionFlagsBits, PermissionResolvable,
  TextChannel,
} from 'discord.js';

import { RedCrossIcon } from '../consts';
import { ColorType, DiscordRoleBotConfig } from '../types';
const config: DiscordRoleBotConfig = require('../config.json');

export const substr = (text: string, maxChars: number = 30, addEllipsis: boolean = true) => {
  if (text.length <= maxChars) {
    return text;
  }
  const result = text.substring(0, Math.min(text.length, maxChars));
  return addEllipsis ? result + '...' : result;
};

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

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const replyEmbed = (text: string, color: number = Colors.Blurple, ephemeral: boolean = false) => ({
  ephemeral,
  embeds: [
    new EmbedBuilder()
      .setDescription(text)
      .setColor(color),
  ],
});

export const isDmSupported = async (interaction: any) => {
  const result = interaction.guild?.name;
  if (result) {
    return true;
  }

  await interaction.reply(
    replyEmbed(
      `${RedCrossIcon} Direct messages are not supported for this command.`,
      Colors.Red,
    ),
  );
  return false;
};