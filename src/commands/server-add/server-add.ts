import {
  ActionRowBuilder,
  CacheType,
  ChatInputCommandInteraction,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { isServerNameTaken, saveServer } from "../../services/sqlrepo/server";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server-add")
    .setDescription("Links an existing minecraft server with this channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    const modalId = `LINK-SERVER-${interaction.user.id}`;

    const modal = new ModalBuilder()
      .setCustomId(modalId)
      .setTitle("Register a new minecraft server");

    populateModal(modal);
    await interaction.showModal(modal);

    const filter = (interaction: ModalSubmitInteraction) =>
      interaction.customId === modalId;

    interaction
      .awaitModalSubmit({ filter, time: 30_000 })
      .then((modalInteraction) => linkServer(modalInteraction));
  },
};

function populateModal(modal: ModalBuilder) {
  const inputs = [
    new TextInputBuilder()
      .setCustomId("serverNameInput")
      .setLabel("Server name")
      .setPlaceholder("My beautiful server!")
      .setStyle(TextInputStyle.Short),
    new TextInputBuilder()
      .setCustomId("ipAddressInput")
      .setLabel("Server ip address")
      .setPlaceholder("0.0.0.0")
      .setStyle(TextInputStyle.Short)
      .setRequired(false),
    new TextInputBuilder()
      .setCustomId("portInput")
      .setLabel("Server port")
      .setPlaceholder("1-65565")
      .setStyle(TextInputStyle.Short)
      .setRequired(true),
  ];

  modal.addComponents(
    inputs.map((input) =>
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        input
      )
    )
  );
}

async function linkServer(interaction: ModalSubmitInteraction<CacheType>) {
  const serverName = interaction.fields.getTextInputValue("serverNameInput");
  try {
    if (await isServerNameTaken(serverName)) {
      throw new Error(
        "The server name you inserted has already been taken. Please insert another name"
      );
    }
  } catch (err) {
    throw new Error(
      "An error has occured during the request. Please try again"
    );
  }

  const ipAddress = interaction.fields.getTextInputValue("ipAddressInput");
  if (!/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(ipAddress)) {
    throw new Error(
      "An invalid IP address for the server was provied. Please try again"
    );
  }

  const port = Number(interaction.fields.getTextInputValue("portInput"));
  if (Number.isNaN(port) || port < 1 || port > 65565) {
    throw new Error("An invalid port was provided. Please try again");
  }

  try {
    await saveServer(serverName, ipAddress, port.toString());
  } catch (err) {
    throw new Error(
      "An error has occurred during the request. Please try again"
    );
  }

  await interaction.reply({
    ephemeral: true,
    content: "Server added successfully!",
  });
}
