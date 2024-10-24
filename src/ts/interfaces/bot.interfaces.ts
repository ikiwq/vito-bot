import { SlashCommandBuilder } from "discord.js";

interface BotConfig {
  clientId: string;
  guildId: string;
  minecraft: {
    servers: {
      name: string;
      aliases: string[];
      address: string;
      port: number;
    }[];
  };
  commands: {
    listenEverywhere: boolean;
    defaultChannelId: string;
    channelIds: string[];
  };
  actions: {
    onInit: {
      sendMessage: boolean;
      messageType: string;
    };
    searchServer: {
      automatic: boolean;
      timeInterval: number;
    };
  };
}

interface BotCommand {
  data: SlashCommandBuilder;
  execute: () => Promise<void> | void;
}

export { BotConfig, BotCommand };
