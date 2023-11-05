import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import config from './config.json';
import { logError } from './services';
import { Command } from './types';

const loadHandlers = (client: Client) => {
  const handlersDir = join(__dirname, './handlers');
  readdirSync(handlersDir).forEach((handler: string) => {
    if (!handler.endsWith('.js')) {
      return;
    }
    require(`${handlersDir}/${handler}`)(client);
  });
};

const client = new Client({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
  ],
});
client.commands = new Collection<string, Command>();
client.cooldowns = new Collection<string, number>();
loadHandlers(client);
client.login(config.token);

process.on('exit', (code: number) => logError(`Process exiting with exit code: ${code}`));