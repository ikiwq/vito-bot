import { CacheType, Interaction } from "discord.js";
import { Logger } from "../utils/logger";

export default async function onInteractionCreate(
  interaction: Interaction<CacheType>
) {
  if (!interaction.isChatInputCommand()) return;

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
    Logger.error(
      `Error while trying to respond to interaction of type ${interaction.commandName}: ${error}`
    );

    if (!(error instanceof Error)) return;

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: error.message,
        ephemeral: true,
      });

      return;
    }

    await interaction.reply({
      content: error.message,
      ephemeral: true,
    });
  }
}
