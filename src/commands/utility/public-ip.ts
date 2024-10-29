import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { getPublicIP } from "../../services/web";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("public-ip")
    .setDescription("Returns the current ip address of the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.reply("Searching for the server's IP address...");
    const ip = await getPublicIP();
    if (!ip) {
      await interaction.editReply("I'm sorry, but I couldn't find anything :(");
      return;
    }
    await interaction.editReply(`Here's the IP address: \`${ip}\``);
  },
};
