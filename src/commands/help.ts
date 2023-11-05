import { Colors, EmbedBuilder } from 'discord.js';

import { logWarn } from '../services';
import { Command, DiscordRoleBotConfig } from '../types';
const config: DiscordRoleBotConfig = require('../config.json');

type HelpCommands = {
  [cmd: string]: HelpCommand;
};

type HelpCommand = {
  text: string;
  args?: {
    [key: string]: {
      type: string;
      description: string;
    };
  };
  aliases?: string[];
  examples?: string[];
};

const command: Command = {
  name: 'help',
  execute: async (message, args) => {
    await message.channel.sendTyping();
    const prefix = config.prefix;

    const server = config.servers[message.guildId!];
    if (!server) {
      logWarn(`No config found for guild ${message.guildId}...`);
      return;
    }

    const helpCommands: HelpCommands = {
      help: {
        text: 'Shows this help page.',
      },
      feeds: {
        text: 'List all available roles.',
        examples: [
          `${prefix}feeds`,
          `${prefix}areas`,
          `${prefix}roles`,
        ],
        aliases: [
          'areas',
          'cities',
          'roles',
        ],
      },
      feedme: {
        text: 'Assign role(s).',
        args: {
          roleNames: {
            type: 'string | string[]',
            description: `The name of the role(s) you want to assign. Assign multiple roles by separating them with a comma or a space. You can also use the keyword 'All' to assign all roles or use the keyword '${server.freeRoleName}' to assign the free access role.`,
          },
        },
        aliases: [
          'add',
          'assign',
        ],
        examples: [
          `\`${prefix}feedme All\``,
          `\`${prefix}feedme ${server.freeRoleName}\``,
          `\`${prefix}feedme ${server.roleNames.slice(0, 2).join(',')}\``,
          `\`${prefix}feedme ${server.roleNames.slice(2, 4).join(' ')}\``,
        ],
      },
      feedmenot: {
        text: 'Unassign role(s).',
        args: {
          roleNames: {
            type: 'string | string[]',
            description: `The name of the role(s) you want to unassign. Unassign multiple roles by separating them with a comma or a space. You can also use the keyword 'All' to unassign all roles or use the keyword '${server.freeRoleName}' to unassign the free access role.`,
          },
        },
        examples: [
          `\`${prefix}feedmenot All\``,
          `\`${prefix}feedmenot ${server.freeRoleName}\``,
          `\`${prefix}feedmenot ${server.roleNames.slice(0, 2).join(',')}\``,
          `\`${prefix}feedmenot ${server.roleNames.slice(2, 4).join(' ')}\``,
        ],
        aliases: [
          'rm',
          'remove',
          'unassign',
        ],
      },
    };

    let title = '**Help**';
    let msg = '';
    switch (args.length) {
      case 1:
        msg = 
        '-------------------------------------------\n' +
        '- **' + prefix + 'help**\n\t- Shows this help page.\n' +
        '- **' + prefix + 'feeds**\n\t- List all available roles.\n' +
        '- **' + prefix + 'feedme**\n\t- Assign role(s).\n' +
        '- **' + prefix + 'feedmenot**\n\t- Unassign role(s).\n'
        ;
        break;
      case 2:
        const cmd = args[1].toLowerCase();
        if (!helpCommands[cmd]) {
          msg = 'Command not found.';
          break;
        }
        const helpCommand = helpCommands[cmd];
        title = `**Help** - **${prefix}${cmd}**`;
        msg = helpCommand.text;
        if (helpCommand.aliases) {
          msg += '\n\n**Aliases:**';
          for (const alias of helpCommand.aliases) {
            msg += '\n- **' + prefix + alias + '**';
          }
        }
        if (helpCommand.args) {
          msg += '\n\n**Arguments:**';
          for (const arg in helpCommand.args) {
            msg += '\n- **' + arg + '**\n\t- ' + helpCommand.args[arg].description;
          }
        }
        if (helpCommand.examples) {
          msg += '\n\n**Examples:**';//- ' + helpCommand.example;
          for (const example of helpCommand.examples) {
            msg += '\n- \t' + example;
          }
        }
        break;
    }
    await message.reply({
      embeds: [
        new EmbedBuilder({
          color: Colors.Blurple,
          title,
          description: msg,
        }),
      ],
    });
  },
  permissions: [],
  aliases: [],
};

export default command;