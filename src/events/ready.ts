import { Client } from 'discord.js';

import config from '../config.json';
import { color, isPlural, log } from '../services';
import { BotEvent } from '../types';

// Reference: https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584

const event: BotEvent = {
  name: 'ready',
  once: true,
  execute: async (client: Client) => {
    const user = client.user?.tag;
    const users = client.users.cache.size;
    const guilds = client.guilds.cache.size;
    const channels = client.channels.cache.size;
    
    log(color('text', `💪 Logged in as ${color('variable', user)}`));
    log(color('text', `🤖 Bot has started, with ${color('variable', users.toLocaleString())} user${isPlural(users)}, in ${color('variable', channels.toLocaleString())} channel${isPlural(channels)} of ${color('variable', guilds.toLocaleString())} guild${isPlural(guilds)}.`));
    console.log();

    if (config?.status) {
      client.user?.setActivity(config.status);
      //client.user?.setPresence({
      //  status: 'online',
      //  afk: false,
      //  activities: [{
      //    name: config.status,
      //    url: 'https://www.twitch.tv/versx',
      //    type: ActivityType.Streaming,
      //  }],
      //});
    }
  },
};

export default event;