[![Node.js CI](https://github.com/versx/DiscordRoleBot/actions/workflows/node.js.yml/badge.svg)](https://github.com/versx/DiscordRoleBot/actions/workflows/node.js.yml)
![ts](https://badgen.net/badge/Built%20With/TypeScript/blue)
[![GitHub Release](https://img.shields.io/github/release/versx/DiscordRoleBot.svg)](https://github.com/versx/DiscordRoleBot/releases/)
[![GitHub Contributors](https://img.shields.io/github/contributors/versx/DiscordRoleBot.svg)](https://github.com/versx/DiscordRoleBot/graphs/contributors/)
[![Discord](https://img.shields.io/discord/552003258000998401.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/zZ9h9Xa)  

# Discord Role Bot  

Allow users to assign and unassign roles based on predetermined settings.  

## Features  
- Allow users to display a list of available roles.  
- Allow users to assign or unassign roles from a list of available roles.  
- Configure whether to allow users to assign roles if already assigned an 'upgrade' role.  
- Allow users to assign or unassign a 'Free' access role.  

## Prerequisites
- [Node.js v16 or higher](https://nodejs.org/en/download)  

## Installation
1. Clone repository: `git clone https://github.com/versx/DiscordRoleBot rolebot`  
1. Change directories: `cd rolebot`  
1. Install packages: `npm install`  
1. Copy example config: `cp src/config.example.json src/config.json`  
1. Fill out config options.  
1. Build project in root folder: `npm run build`  
1. Run: `npm run start`  

## Updating  
1. Pull latest changes in root folder `git pull`  
1. Build project in root folder: `npm run build`  
1. Run `npm run start`  

## Configuration  
```json
{
  // Logging configuration.
  "logs": {
    // Log level to filter logs by.
    // Available values:
    //  - trace (log everything)
    //  - debug (only log debug, info, warnings, and errors)
    //  - info (only log info, warnings, and errors)
    //  - warn (only log warnings and errors)
    //  - error (only log errors)
    //  - none (disable logging)
    "level": "info",
    // Log color dictionary.
    "colors": {
      // Normal text
      "text": "#ffffff",
      // Variables
      "variable": "#ff624d",
      // Dates
      "date": "#4287f5",
      // Errors
      "error": "#ff0000"
    }
  },
  // Prefix for Discord commands.
  "prefix": "!",
  // Discord bot activity status.
  "status": "Managing access...",
  // Discord bot token.
  "token": "<DISCORD_BOT_TOKEN>",
  // Discord servers to configure role management.
  "servers": {
    // Discord guild ID
    "<DISCORD_GUILD1_ID>": {
      // Descriptive name for Discord guild. (not actually used, just for your reference.)
      "name": "<DESCRIPTIVE_NAME>",
      // Determines whether assigning and unassigning roles requires
      // an upgrade role to be assigned to user.
      "requiresUpgradeRole": true,
      // List of roles a user must be assigned at least one, if required.
      "upgradeRoleNames": [],
      // List of available role names users can assign or unassign.
      "roleNames": [],
      // Determines whether to allow users to assign or unassign a free access role.
      "allowFreeRole": false,
      // Name of the free access role.
      "freeRoleName": "Free"
    }
  }
}
```