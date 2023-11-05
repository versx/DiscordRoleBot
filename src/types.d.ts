import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Collection,
  CommandInteraction,
  Message,
  PermissionResolvable,
  SlashCommandBuilder,
  Snowflake,
} from 'discord.js';

declare module 'discord.js' {
  export interface Client {
    slashCommands: Collection<string, SlashCommand>
    commands: Collection<string, Command>,
    cooldowns: Collection<string, number>,
  };
};

export interface Command {
  name: string,
  execute: (message: Message, args: Array<string>) => void,
  permissions: Array<PermissionResolvable>,
  aliases: Array<string>,
  cooldown?: number,
};

export interface BotEvent {
  name: string,
  once?: boolean | false,
  execute: (...args?) => void,
};

export type DiscordRoleBotConfig = {
  logs: {
    level: LogLevel;
    colors: LogColorsConfig;
  };
  prefix: string;
  servers: {
    [guildId: Snowflake]: DiscordGuildConfig;
  };
  status?: string | null;
  token: string;
};

export type DiscordGuildConfig = {
  name?: string;
  requiresUpgradeRole?: boolean;
  upgradeRoleNames: string[];
  roleNames: string[];
  allowFreeRole: boolean;
  freeRoleName: string;
};

export type LogColorsConfig = {
  //[type: ColorType]: string;
  [type: string]: string;
};

export type ColorType = 'text' | 'variable' | 'warn' | 'error' | 'date';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'none';