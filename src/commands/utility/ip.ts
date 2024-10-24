import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { getPublicIP } from "../../services";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("public-ip")
    .setDescription("Returns the current ip address of the server"),
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
