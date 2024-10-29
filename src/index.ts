import { Events } from "discord.js";
import {
  createClient,
  getCommands,
  getDiscordToken,
  loadDotEnv,
} from "./utils/app-utils";
import { Logger } from "./utils/logger";
import onReady from "./handlers/on-ready";
import onInteractionCreate from "./handlers/on-interaction-create";

loadDotEnv();

const DISCORD_TOKEN = getDiscordToken();
const client = createClient();

const commands = getCommands();
commands.forEach((command) => {
  client.commands.set(command.data.name, command);
});

client.once(Events.ClientReady, async () => await onReady(client));

client.on(Events.InteractionCreate, async (interaction) => {
  await onInteractionCreate(interaction);
});

client.login(DISCORD_TOKEN).catch((err) => {
  Logger.fatal("Discord login with Oauth2 token failed: ", err);
});
