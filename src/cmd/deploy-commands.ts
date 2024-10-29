import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import { GLOBAL_CONFIG } from "../globals";
import dotenv from "dotenv";
import { getCommands } from "../utils/app-utils";
import { Logger } from "../utils/logger";

dotenv.config();

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
  getCommands().map((command) => command.data.toJSON());

if (!process.env.DISCORD_TOKEN) {
  Logger.fatal(
    "Invalid discord token! Have you set it inside the env variables"
  );
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    Logger.debug(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data = await rest.put(
      Routes.applicationCommands(GLOBAL_CONFIG.clientId),
      { body: commands }
    );

    Logger.debug(
      `Successfully reloaded ${
        (data as any[]).length
      } application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();
