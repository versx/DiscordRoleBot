import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  Collection,
  Colors,
  ComponentType,
  EmbedBuilder,
  Guild,
  GuildMember,
  Message,
  SlashCommandBuilder,
} from 'discord.js';

import { DiscordMaxMessageLength } from '../consts';
import { hasRolePermissions, isDmSupported, logDebug, replyEmbed, sleep, substr } from '../services';
import { DiscordRoleAssignmentType, DiscordRoleBotConfig, DiscordRoleResults, SlashCommand } from '../types';
const config: DiscordRoleBotConfig = require('../config.json');

const UseEphemeralMessages = true;
const MaxRolesPerPage = 20;

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('feeds')
    .setDescription('Assign and unassign yourself area roles in order to see different area sections of the feeds.')
  ,
  execute: async (interaction: ChatInputCommandInteraction) => {
    const { guild, guildId, member, user } = interaction;
    if (!await isDmSupported(interaction)) {
      return;
    }

    const server = config.servers[guildId!];
    if (!server) {
      await interaction.reply(replyEmbed(`:no_entry_sign: This server is not configured.`, Colors.Red, true));
      return;
    }

    // Check if user is allowed to unassign any other role
    const hasUpgradePerms = hasRolePermissions(member as GuildMember, server.upgradeRoleNames);
    const isNotAllowed = server.requiresUpgradeRole && !hasUpgradePerms;
    if (!server.allowFreeRole && isNotAllowed) {
      await interaction.reply(replyEmbed(`:no_entry_sign: You do not have permission to use this command.`, Colors.Red, true));
      return;
    }

    let page = 0;
    const roles = hasUpgradePerms ? server.roleNames : [server.freeRoleName];
    const maxPages = Math.ceil(roles.length / MaxRolesPerPage);
    const paginationButtons = createPaginationButtons(page, maxPages, hasUpgradePerms);
    const pages = getPages(page, MaxRolesPerPage, roles, server.freeRoleName);
  
    const embed = new EmbedBuilder()
      .setTitle('Select Your Area Roles')
      .setDescription([
        `- Click a button to assign yourself a role.`,
        `- If you already have the role, it will be removed.`,
      ].join('\n'),
      )
      .setColor(Colors.Blurple)
      .setFooter({
        text: `${guild?.name ?? guildId ?? '-'} | ${new Date().toLocaleString()}`,
        iconURL: guild?.iconURL()!,
      });
  
    const message = await interaction.reply({
      fetchReply: true,
      embeds: [embed],
      components: [
        ...pages,
        paginationButtons,
      ],
      ephemeral: UseEphemeralMessages,
    });

    startMessageCollector(interaction, message, user.id, page, maxPages, roles, hasUpgradePerms);
  },
};

const startMessageCollector = (
  interaction: ChatInputCommandInteraction,
  message: Message,
  userId: string,
  page: number,
  maxPages: number,
  roleNames: string[],
  hasUpgradePerms: boolean,
) => {
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    dispose: true,
    idle: 15 * 1000, // 30 seconds
    //maxUsers: 1,
    time: 60 * 1000, // 60 seconds    
    filter: i => i.user.id === userId,
  });

  collector.on('collect', async (buttonInteraction: ButtonInteraction) => {
    if (!buttonInteraction.isButton()) {
      return;
    }

    const { customId, guild, guildId } = buttonInteraction;
    if (!guild || !guildId) {
      return;
    }

    const server = config.servers[guildId!];
    const [action, roleName] = customId.split('|');

    switch (action) {
      // Handle pagination buttons
      case 'previous':
      case 'next':
        page = customId === 'previous'
          ? Math.max(0, page - 1)
          : Math.min(maxPages - 1, page + 1);
        const updatedPages = getPages(page, MaxRolesPerPage, roleNames, server.freeRoleName);        
        await buttonInteraction.update({
          components: [
            ...updatedPages,
            createPaginationButtons(page, maxPages, hasUpgradePerms),
          ],
        });
        break;
      // Handle assign/unassign all buttons
      case 'Assign All':
      case 'Unassign All':
        // Defer update, trigger typing indicator
        await buttonInteraction.deferReply({ ephemeral: UseEphemeralMessages });

        const assignmentType = action === 'Assign All' ? 'assign' : 'unassign';
        const results = await assignRoles(guild, userId, roleNames, assignmentType);
        const assigned = results.assigned.map(r => `Role @${r} was assigned`).join('\n');
        const unassigned = results.unassigned.map(r => `Role @${r} was unassigned`).join('\n');
        const failed = results.failed.map(r => `Role @${r} was not found`).join('\n');
        const content = substr(`${assigned}\n${unassigned}\n${failed}\n`, DiscordMaxMessageLength);

        // Delete original interaction reply
        try {
          await interaction.deleteReply();
        } catch (err) {
          console.error('error:', err.message);
        }
        await buttonInteraction.editReply(content);
        break;
      // Handle single area role assignment buttons
      case 'role':
        // Check if user is allowed to assign Free role
        if (!server.allowFreeRole && roleName.toLowerCase() === server.freeRoleName.toLowerCase()) {
          await buttonInteraction.reply(replyEmbed(`:no_entry_sign: Access to the '${server.freeRoleName}' role is currently unavailable.`, Colors.Red, true));
          return;
        }

        // Defer update, acknowledge button press
        await buttonInteraction.deferUpdate();
        const result = await assignRole(guild!, userId, roleName, 'toggle');
        await interaction.editReply({
          content: buttonInteraction.message.content + '\n' + (!result
            ? `Role @${roleName} not found`
            : `Role @${roleName} was ${result.wasUnassigned ? 'unassigned' : 'assigned'}`),
        });
        break;
    }
  });

  collector.on('end', async (collected: Collection<string, ButtonInteraction>, reason: string) => {
    console.log('end reason:', reason); // idle, userLimit, 
    if (!message.content || message.content === '') {
      await interaction.deleteReply();
      return;
    }

    await interaction.editReply({
      components: [],
      embeds: [],
    });
  });
};

const createPaginationButtons = (page: number, maxPages: number, showAssignButtons: boolean) => {
  const paginationRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('previous')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === maxPages - 1),
    );
  if (showAssignButtons) {
    paginationRow.addComponents(
      new ButtonBuilder()
        .setCustomId('Assign All')
        .setLabel('Assign All')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('Unassign All')
        .setLabel('Unassign All')
        .setStyle(ButtonStyle.Danger),
    );
  }
  return paginationRow;
};

const getPages = (page: number, maxPerPage: number, roleNames: string[], freeRoleName?: string) => {
  const pages = [];
  const start = page * maxPerPage;
  const end = start + maxPerPage;
  for (let i = start; i < end && i < roleNames.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    roleNames.slice(i, i + 5).forEach(roleName => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`role|${roleName}`)
          .setLabel(roleName)
          .setStyle(roleName === freeRoleName ? ButtonStyle.Success : ButtonStyle.Primary),
      );
    });
    pages.push(row);
  }
  return pages;
};

const assignRole = async (guild: Guild, userId: string, roleName: string, assignmentType: DiscordRoleAssignmentType) => {
  const member = guild.members.cache.get(userId);
  if (!member) {
    return false;
  }

  const role = guild.roles.cache.find(role => role.name === roleName);
  if (!role) {
    return false;
  }

  let skipped = false;
  const hasRole = member.roles.cache.has(role.id);
  switch (assignmentType) {
    case 'assign':
      if (hasRole) {
        skipped = true;
      }
      await member.roles.add(role.id);
      break;
    case 'unassign':
      if (!hasRole) {
        skipped = true;
      }
      await member.roles.remove(role.id);
      break;
    case 'toggle':
      hasRole
        ? await member.roles.remove(role.id)
        : await member.roles.add(role.id);
      break;
  }

  if (!skipped) {
    logDebug(`Role ${assignmentType}d: ${roleName} (${role.id}) from ${member.user.username} (${member.user.id})`);
  }

  return {
    wasUnassigned: !member.roles.cache.find(role => role.name === roleName),
    skipped,
    role,
  };
};

const assignRoles = async (guild: Guild, userId: string, roleNames: string[], assignmentType: DiscordRoleAssignmentType) => {
  const results: DiscordRoleResults = {
    assigned: [],
    unassigned: [],
    failed: [],
  };

  // Assign all available roles
  for (const roleName of roleNames) {
    const result = await assignRole(guild, userId, roleName, assignmentType);
    if (!result) {
      results.failed.push(roleName);
      continue;
    }

    // Skip if role was already assigned/unassigned
    if (result.skipped) {
      continue;
    }

    result.wasUnassigned
      ? results.unassigned.push(roleName)
      : results.assigned.push(roleName);

    // 1/4 second delay between each role assignment
    await sleep(250);
  }
  return results;
};

export default command;