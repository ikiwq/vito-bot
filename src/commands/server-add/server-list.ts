import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { getServerList } from "../../services/sqlrepo/server";
import { getMinecraftServerInformation, getPublicIP } from "../../services/web";
import { capitalizeFirstLetter } from "../../utils/app-utils";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server-list")
    .setDescription(
      "Returns all the minecraft servers registered in this guild"
    ),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.deferReply();

    let servers;
    try {
      servers = await getServerList();
    } catch (err) {
      throw new Error(
        "An error has occurred during the request. Please try again"
      );
    }

    if (servers.length === 0) {
      interaction.editReply(
        "Hmm... there seems to be no server yet! Try the /server-add command to add a new Minecraft server"
      );

      return;
    }

    const serverEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(
        `${capitalizeFirstLetter(
          interaction.guild!.name
        )}'s Minecraft Server List`
      )
      .setThumbnail(interaction.guild!.iconURL())
      .setTimestamp()
      .setFooter({
        text: "Powered by VitoBot and McStatus api",
        iconURL:
          "https://cdn.discordapp.com/app-icons/1298309437366337610/4bedcddacee03429c43a451a9363a50d.png?size=256",
      });

    await Promise.all(
      servers.map(async (server) => {
        const serverAddress =
          server.ip_address === "0.0.0.0"
            ? await getPublicIP()
            : server.ip_address;

        const serverInfo = await getMinecraftServerInformation(
          serverAddress!,
          server.port
        );

        serverEmbed.addFields(
          { name: "🌐 Server name", value: server.name },
          {
            name: "🖥️ Address",
            value: `${serverAddress}:${server.port}`,
            inline: true,
          },
          {
            name: "👤 Active players",
            value: `${serverInfo?.players?.online || "Unknown"}/${
              serverInfo?.players?.max || "Unknown"
            }`,
            inline: true,
          },
          { name: "\u200B", value: "\u200B" }
        );
      })
    );

    await interaction.editReply({ content: "", embeds: [serverEmbed] });
  },
};
