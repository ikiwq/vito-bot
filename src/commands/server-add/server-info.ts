import {
  AttachmentBuilder,
  Base64Resolvable,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { MinecraftServerStatusResponse } from "../../ts/interfaces/minecraft.interfaces";
import { getMinecraftServerInformation, getPublicIP } from "../../services/web";
import { getServerByName } from "../../services/sqlrepo/server";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server-info")
    .setDescription(
      "I will fetch the server's information such as players, host and image."
    )
    .addStringOption((option) =>
      option
        .setName("server-name")
        .setDescription("The server's name")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.deferReply();

    const serverName = interaction.options.getString("server-name");

    const server = await getServerByName(serverName!);
    if (!server || !serverName) {
      throw new Error(
        `Could not find a server with name ${serverName}. Have you typed it correctly?`
      );
    }

    await interaction.editReply(`Fetching information for ${server}...`);

    let serverAddress =
      server.ip_address === "0.0.0.0" ? await getPublicIP() : server.ip_address;
    let serverPort = server.port;

    const info = await getMinecraftServerInformation(
      serverAddress!,
      serverPort
    );

    if (!info) {
      await interaction.editReply(
        "I couldn't get this server's information :("
      );
      return;
    }

    const [embed, attachment] = getMinecraftEmbed(serverName, info);

    await interaction.editReply({
      message: "",
      embeds: [embed],
      files: attachment ? [attachment] : [],
    });
  },
};

function getMinecraftEmbed(
  serverName: string,
  info: MinecraftServerStatusResponse
): [EmbedBuilder, AttachmentBuilder | null] {
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`${serverName}`)
    .setDescription(info.motd?.clean || "No description")
    .addFields(
      {
        name: "Host",
        value: info.host,
      },
      {
        name: "Ip address",
        value: `${info.ip_address}:${info.port.toString()}`,
      },
      {
        name: "Player online",
        value: `${info.players?.online?.toString() || "Unknown"}/${
          info.players?.max?.toString() || "Unknown"
        }`,
      }
    )
    .setTimestamp();

  let attachment = null;
  if (info.icon) {
    attachment = getMinecraftAttachment(info.icon);
    embed.setThumbnail(`attachment://${attachment.name}`);
  }

  return [embed, attachment];
}

function getMinecraftAttachment(base64Icon: string) {
  const fav = base64Icon.split(",").slice(1).join(",");
  const imageStream: Base64Resolvable = Buffer.from(fav, "base64");

  return new AttachmentBuilder(imageStream, {
    name: "servericon.png",
  });
}
