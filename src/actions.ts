import { CacheType, Client, Interaction, TextChannel } from "discord.js";
import { getPublicIP } from "./services";
import { GLOBAL_CONFIG } from "./globals";
import { Logger } from "./logger";

async function onReady(client: Client) {
  Logger.info("Searching for channel");
  const channel = (await client.channels.fetch(
    GLOBAL_CONFIG.commands.defaultChannelId
  )) as TextChannel;

  if (!channel) {
    Logger.fatal(
      `Could not find channel with id ${GLOBAL_CONFIG.commands.defaultChannelId}`
    );
  }
  Logger.info(`Main channel found: ${channel.name}`);

  if (
    GLOBAL_CONFIG.actions.onInit.sendMessage &&
    GLOBAL_CONFIG.actions.onInit.messageType === "PUBLIC_IP"
  ) {
    const ip = await getPublicIP();
    if (!ip) {
      channel.send("Could not retreive server's public ip :(");
      return;
    }

    channel.send(`The server's public ip is: \`${ip}\``);
  }

  if (
    GLOBAL_CONFIG.actions.onInit.sendMessage &&
    GLOBAL_CONFIG.actions.onInit.messageType === "GREETING"
  ) {
    channel.send("Bot ready to serve you!");
  }
}

async function onInteractionCreate(interaction: Interaction<CacheType>) {
  if (!interaction.isChatInputCommand()) return;

  const shouldListenAnywhere = GLOBAL_CONFIG.commands.listenEverywhere;
  const isOnListenedChannel = GLOBAL_CONFIG.commands.channelIds.includes(
    interaction.channelId
  );

  if (!shouldListenAnywhere && !isOnListenedChannel) {
    await interaction.reply("You can't use me here!");
    return;
  }

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    await interaction.reply(
      "Seems like this command is wrong... have you typed it correctly?"
    );
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(
      `ERROR: Error while trying to respond to interaction of type ${interaction.commandName}: ${error}`
    );

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "Sorry, but I couldn't perform this action.",
        ephemeral: true,
      });

      return;
    }

    await interaction.reply({
      content: "Sorry, but I couldn't perform this action.",
      ephemeral: true,
    });
  }
}

export { onReady, onInteractionCreate };
