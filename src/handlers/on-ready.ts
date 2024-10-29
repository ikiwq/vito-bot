import { Client, TextChannel } from "discord.js";
import { Logger } from "../utils/logger";
import { GLOBAL_CONFIG } from "../globals";
import { getPublicIP } from "../services/web";

export default async function onReady(client: Client) {
  Logger.info("Searching for channel");

  const channel = (await client.channels.fetch(
    GLOBAL_CONFIG.commands.generalTextChannel
  )) as TextChannel;

  if (!channel) {
    Logger.fatal(
      `Could not find channel with id ${GLOBAL_CONFIG.commands.generalTextChannel}`
    );
  }
  Logger.info(`Main channel found: ${channel.name}`);

  if (GLOBAL_CONFIG.actions.onInit.messageType === "PUBLIC_IP") {
    const ip = await getPublicIP();
    if (!ip) {
      channel.send("Could not retreive server's public ip :(");
      return;
    }

    channel.send(`The server's public ip is: \`${ip}\``);
  }

  if (GLOBAL_CONFIG.actions.onInit.messageType === "GREETING") {
    channel.send("Bot ready to serve you!");
  }
}
