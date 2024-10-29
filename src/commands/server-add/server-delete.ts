import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import {
  deleteServerById,
  getServerByName,
} from "../../services/sqlrepo/server";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server-delete")
    .setDescription("Deletes a server from VitoBot's servers list")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("server-name")
        .setDescription("The server's name")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.deferReply({ ephemeral: true });

    const serverName = interaction.options.getString("server-name");

    const server = await getServerByName(serverName!);
    if (!server || !serverName) {
      throw new Error(
        `Could not find a server with name ${serverName}. Have you typed it correctly?`
      );
    }

    await deleteServerById(server.id);

    interaction.editReply({
      content: "Server deleted successfully!",
    });
  },
};
