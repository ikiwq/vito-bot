import {
  CacheType,
  ChatInputCommandInteraction,
  Client,
  Collection,
  GatewayIntentBits,
  VoiceBasedChannel,
} from "discord.js";
import { Logger } from "./logger";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { BotCommand } from "../ts/interfaces/bot.interfaces";
import crypto from "crypto";

/**
 * Loads the dotenv file and logs the action
 */
function loadDotEnv() {
  Logger.info("Configuring dotenv");
  dotenv.config();
  Logger.info("Dotenv loaded!");
}

function getDiscordToken(): string {
  Logger.info("Retrieving Discord token");
  const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

  if (!DISCORD_TOKEN || DISCORD_TOKEN.length === 0) {
    Logger.fatal(
      "Could not get Discord token from env variables. Have you set the token?"
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
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
    ],
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

  const foldersPath = path.join(__dirname, "../commands");
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

/**
 * Given an interaction, tries to extract the voice channel where the user that wrote the command is.
 * @param interaction
 */
function getChannelConnectionFromInteraction(
  interaction: ChatInputCommandInteraction<CacheType>
): VoiceBasedChannel | null {
  const guild = interaction.guild;
  if (!guild || !interaction.member?.user) {
    return null;
  }

  const member = guild.members.cache.get(interaction.member.user.id);
  if (!member) {
    return null;
  }

  const voiceChannel = member.voice.channel;
  if (!voiceChannel || !voiceChannel.guild.id) {
    return null;
  }

  if (!voiceChannel?.joinable) {
    return null;
  }

  return voiceChannel;
}

/**
 * Given a string, capitalize first letter.
 * @param s the string to capitalize
 */
function capitalizeFirstLetter(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Given a string, encrypts it using the secret key and initialization vector inside the
 * env variables
 * @param s the string to encrypt
 */
function encrypt(s: string) {
  const algorithm = "aes-256-cbc";
  const secretKey = process.env.SECRET_KEY;
  const iv = process.env.IV;

  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(s, "utf-8", "hex");
  encrypted += cipher.final("hex");

  return encrypted;
}

/**
 * Given an encrypted string, decrypts it using the secret key and initialization vector
 * inside the env variables
 * @param s the string to decrypt
 */
function decrypt(s: string) {
  const secretKey = process.env.SECRET_KEY;
  const iv = process.env.IV;

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    secretKey,
    Buffer.from(iv, "hex")
  );

  let decrypted = decipher.update(s, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
}

export {
  loadDotEnv,
  getDiscordToken,
  createClient,
  getCommands,
  getChannelConnectionFromInteraction,
  encrypt,
  decrypt,
  capitalizeFirstLetter,
};
