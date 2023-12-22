import { Client, Routes, SlashCommandBuilder } from 'discord.js';
import { REST } from '@discordjs/rest'
import { readdirSync } from 'fs';
import { join } from 'path';

import { color, log, logError, logWarn } from '../services';
import { Command, DiscordRoleBotConfig, SlashCommand } from '../types';
const config: DiscordRoleBotConfig = require('../config.json');

module.exports = async (client: Client) => {
  const slashCommands: SlashCommandBuilder[] = [];
  const commands: Command[] = [];

  const slashCommandsDir = join(__dirname,'../slashCommands');
  const commandsDir = join(__dirname,'../commands');

  readdirSync(slashCommandsDir).forEach(file => {
    if (!file.endsWith('.js')) {
      logWarn(`Skipping slash command file: ${file}`);
      return;
    }
    const command: SlashCommand = require(`${slashCommandsDir}/${file}`).default;
    slashCommands.push(command.command);
    client.slashCommands.set(command.command.name, command);
  });

  readdirSync(commandsDir).forEach(file => {
    if (!file.endsWith('.js')) {
      logWarn(`Skipping command file: ${file}`);
      return;
    }
    const command: Command = require(`${commandsDir}/${file}`).default;
    commands.push(command);
    client.commands.set(command.name, command);
  });

  try {
    const rest = new REST({version: '10'}).setToken(config.token);
    const response: any = await rest.put(Routes.applicationCommands(config.clientId), {
      body: slashCommands.map(command => command.toJSON()),
    });
    log(color('text', `🔥 Successfully loaded ${color('variable', response.length)} slash command(s)`));
    log(color('text', `🔥 Successfully loaded ${color('variable', commands.length)} command(s)`));
  } catch (err) {
    logError(err);
  }
};