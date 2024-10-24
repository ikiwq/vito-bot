import path from "path";
import fs from "fs";
import { BotCommand } from "../ts/interfaces/bot.interfaces";
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import { GLOBAL_CONFIG } from "../globals";
import dotenv from "dotenv";

dotenv.config();

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

const foldersPath = path.join(__dirname, "../commands");
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command: BotCommand = require(filePath);

    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.warn(
        `WARNING: Command at ${filePath} is missing properties. Check that both "data" and "execute" properties are defined.`
      );
    }
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data = await rest.put(
      Routes.applicationCommands(GLOBAL_CONFIG.clientId),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${
        (data as any[]).length
      } application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();
