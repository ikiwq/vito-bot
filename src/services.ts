import { PublicIpResponse } from "./ts/interfaces/ip.interfaces";
import { MinecraftServerStatusResponse } from "./ts/interfaces/minecraft.interfaces";

const IP_API = "https://api.ipify.org?format=json";
const MINECRAFT_SERVER_API = "https://api.mcstatus.io/v2/status/java/";

/**
 * Fetches the public ip of the machine hosting the bot.
 * Returns a string if an ip is found, null if not.
 */
async function getPublicIP(): Promise<string | null> {
  try {
    const response = await fetch(IP_API);
    const data: PublicIpResponse = await response.json();

    return data.ip;
  } catch (error) {
    return null;
  }
}

/**
 * Given the address and the port of a minecraft server, returns its status and additional information.
 * Returns an object if the fetch is successful, null if not.
 * @param address server address (numerical or alphanumerical domain)
 * @param port OPTIONAL. Port of the server address
 */
async function getMinecraftServerInformation(
  address: string,
  port?: number
): Promise<MinecraftServerStatusResponse | null> {
  try {
    let fetchUrl = MINECRAFT_SERVER_API + address;
    if (port) {
      fetchUrl += ":" + port.toString();
    }
    const response = await fetch(fetchUrl);
    const data: MinecraftServerStatusResponse = await response.json();

    return data;
  } catch (error) {
    return null;
  }
}

export { getPublicIP, getMinecraftServerInformation };
