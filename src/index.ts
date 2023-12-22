import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import config from './config.json';
import { log, logError } from './services';
import { Command, SlashCommand } from './types';

const loadHandlers = (client: Client) => {
  log(`Loading Discord bot handlers...`);
  const handlersDir = join(__dirname, './handlers');
  readdirSync(handlersDir).forEach((handler: string) => {
    if (!handler.endsWith('.js')) {
      return;
    }
    require(`${handlersDir}/${handler}`)(client);
    log(`Loaded Discord bot ${handler} handler...`);
  });
};

log(`Starting Discord bot...`);
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
client.cooldowns = new Collection<string, number>();
client.commands = new Collection<string, Command>();
client.slashCommands = new Collection<string, SlashCommand>();
loadHandlers(client);

log(`Logging Discord bot in...`);
client.login(config.token);

process.on('exit', (code: number) => logError(`Process exiting with exit code: ${code}`));