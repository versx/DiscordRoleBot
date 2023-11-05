import { Colors, EmbedBuilder, Message } from 'discord.js';

import { logDebug, sendMessage } from '../services';
import { Command, DiscordRoleBotConfig } from '../types';
const config: DiscordRoleBotConfig = require('../config.json');

const command: Command = {
  name: 'feeds',
  aliases: ['areas', 'cities', 'roles'],
  execute: async (message: Message, args: string[]) => {
    await message.delete();
    await message.channel.sendTyping();

    if (!config.servers[message.guildId!]) {
      logDebug(`No config found for guild ${message.guildId}...`);
      await sendMessage(message, Colors.Red, `:no_entry_sign: No config found for this server.`);
      return;
    }

    const server = config.servers[message.guildId!];
    let content = `**Available Roles:**\n- ${server.roleNames.join('\n- ')}`;
    if (server.allowFreeRole) {
      content += `\n\n- ${server.freeRoleName}`;
    }

    const embed = new EmbedBuilder()
      .setDescription(content)
      .setColor(Colors.Blurple)
      .setFooter({
        text: `${message.guild?.name} | ${new Date().toLocaleString()}`,
        iconURL: message.guild?.iconURL({ forceStatic: true})!,
      });
    await message.channel.sendTyping();
    await message.channel.send({ embeds: [embed] });
  },
  cooldown: 3,
  permissions: [],
};

export default command;