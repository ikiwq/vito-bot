import { SlashCommandBuilder } from "discord.js";

interface BotCommand {
  data: SlashCommandBuilder;
  execute: () => Promise<void> | void;
}

export { BotCommand };
