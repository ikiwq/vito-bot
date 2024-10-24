import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Logger } from "./logger";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { BotCommand } from "./ts/interfaces/bot.interfaces";

/**
 * Loads the dotenv file and logs the action
 */
function loadDotEnv() {
  Logger.info("Configuring dotenv");
  dotenv.config();
  Logger.info("Dotenv loaded!");
}

function getDiscordToken(): string {
  Logger.info("Retrieving Discord ");
  const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

  if (!DISCORD_TOKEN || DISCORD_TOKEN.length === 0) {
    Logger.fatal(
      "Could not get Discord Token from env variables. Have you se the token?"
    );
  }

  return DISCORD_TOKEN;
}

/**
 * Generates a discord client and assigns it a commands collection.
 */
function createClient(): Client {
  Logger.info("Creating discord client");
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  });
  client.commands = new Collection();

  Logger.info("Discord client created!");
  return client;
}

/**
 * Reads the command files inside the /src/commands/* folders and returns a list
 */
function getCommands(): BotCommand[] {
  Logger.info("Reading commands folder");

  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = fs.readdirSync(foldersPath);

  Logger.debug(
    `Located ${
      commandFolders.length
    } folders containing commands: ${commandFolders.toString()}`
  );

  const commands = commandFolders
    .map((folder) => {
      const commandsPath = path.join(foldersPath, folder);
      const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".ts"));

      Logger.debug(
        `Found a total of ${commandFiles.length} command files inside ${folder}`
      );
      return commandFiles
        .map((file) => {
          const filePath = path.join(commandsPath, file);
          const command: BotCommand = require(filePath);

          if ("data" in command && "execute" in command) {
            Logger.debug(
              `Individuated command ${command.data.name} inside ${folder}`
            );
            return command;
          } else {
            Logger.warn(
              `WARNING: Command at ${filePath} is missing properties. Check that both "data" and "execute" properties are defined.`
            );
            return null;
          }
        })
        .filter((c) => c !== null);
    })
    .flatMap((commands) => commands);

  Logger.info("Commands folder read successfully");
  return commands;
}

export { loadDotEnv, getDiscordToken, createClient, getCommands };
