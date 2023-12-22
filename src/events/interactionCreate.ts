import { Interaction } from 'discord.js';

import { BotEvent } from '../types';

const event : BotEvent = {
  name: 'interactionCreate',
  execute: async (interaction: Interaction) => {
    const { client, user } = interaction;
    if (interaction.isChatInputCommand()) {
      const { commandName } = interaction;
      const command = client.slashCommands.get(commandName);
      const cooldownKey = `${commandName}-${user.username}`;
      const cooldown = client.cooldowns.get(cooldownKey);
      if (!command) {
        return;
      }

      if (command.cooldown) {
        const cooldownTime = Date.now() + command.cooldown * 1000;
        if (!cooldown) {
          client.cooldowns.set(cooldownKey, cooldownTime);
        }

        if (Date.now() < cooldown!) {
          const seconds = ((Date.now() - cooldown!) / 1000).toFixed(2);
          await interaction.reply(`You need to wait ${seconds} second(s) to use this command again.`);
          setTimeout(() => interaction.deleteReply(), 5000);
          return;
        }

        setTimeout(() => client.cooldowns.delete(cooldownKey), command.cooldown * 1000);
        //if (cooldown) {
        //  if (Date.now() < cooldown) {
        //    const seconds = (Math.abs(Date.now() - cooldown) / 1000).toFixed(2);
        //    await interaction.reply(`You need to wait ${seconds} second(s) to use this command again.`);
        //    setTimeout(() => interaction.deleteReply(), 5000);
        //    return;
        //  }
        //  client.cooldowns.set(cooldownKey, cooldownTime);
        //  setTimeout(() =>
        //    client.cooldowns.delete(cooldownKey),
        //    command.cooldown * 1000,
        //  );
        //} else {
        //  client.cooldowns.set(cooldownKey, cooldownTime);
        //}
      }

      command.execute(interaction);
    } else if (interaction.isAutocomplete()) {
      const { commandName } = interaction;
      const command = client.slashCommands.get(commandName);
      if (!command) {
        console.error(`No command matching ${commandName} was found.`);
        return;
      }
      try {
        if (!command.autocomplete) return;
        command.autocomplete(interaction);
      } catch (err) {
        console.error(`Error: ${err.message}`);
      }
    } else if (interaction.isModalSubmit()) {
      const { customId } = interaction;
      const commandName = customId.split('|')[1];
      const command = client.slashCommands.get(commandName);
      if (!command) {
        await interaction.reply(`No command matching ${commandName} was found.`);
        return;
      }

      try {
        if (!command.modal) {
          console.error('no modal:', commandName, command);
          return;
        }
        command.modal!(interaction);
      } catch (err) {
        await interaction.reply(`Error: ${err.message}`);
      }
    } else if (interaction.isButton()) {
      //const { customId } = interaction;
    } else if (interaction.isStringSelectMenu()) {
      console.log('isStringSelectMenu:', interaction.customId);
      const { customId } = interaction;
      const commandName = customId.split('|')[1];
      const command = client.slashCommands.get(commandName);
      if (!command) {
        await interaction.reply(`No command matching ${commandName} was found.`);
        return;
      }

      try {
        if (!command.selectMenu) {
          console.error('no selectMenu');
          return;
        }
        command.selectMenu!(interaction);
      } catch (err) {
        await interaction.reply(`Error: ${err.message}`);
      }
    } else if (interaction.isUserContextMenuCommand()) {
      console.log('isUserContextMenuCommand');
      const { username } = interaction.targetUser;
      interaction.reply(`Username: ${username}`);
	    console.log(username);
    }
  },
};

export default event;