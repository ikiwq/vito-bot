import { RunResult } from "sqlite3";
import { database } from "./db";
import { Logger } from "../../utils/logger";
import { Server } from "../../ts/interfaces/db.interfaces";

/**
 * Returns true if a server record with the same name exists, returns false if otherwise
 * @param serverName the server's name to fetch for
 */
async function isServerNameTaken(serverName: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    database.get(
      `SELECT EXISTS (SELECT 1 FROM server WHERE name = ?) AS isTaken`,
      [serverName],
      (err, row: { isTaken: number | undefined }) => {
        if (err) {
          Logger.error(
            "An error has occurred during fetching for a server with same name: ",
            err.message
          );
          reject(err);
        } else {
          resolve(row.isTaken === 1);
        }
      }
    );
  });
}

/**
 * Given the server params, saves a record inside the database
 * @param serverName the server's name
 * @param serverAddress the server's address. Can also be 0.0.0.0 if the server lives locally
 * @param port the server's port
 */
async function saveServer(
  serverName: string,
  serverAddress: string,
  port: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    database.run(
      `INSERT INTO server(name, ip_address, port) 
        VALUES($name, $ip_address, $port)`,
      {
        $name: serverName,
        $ip_address: serverAddress,
        $port: port,
      },
      (row: RunResult, err: Error | null) => {
        if (err) {
          Logger.error(
            "An error has occurred during the saving of a server record: ",
            err.message
          );
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

/**
 * Returns all the server records inside the database
 */
async function getServerList(): Promise<Server[]> {
  return new Promise((resolve, reject) => {
    database.all<Server>("SELECT * FROM server", (err, rows) => {
      if (err) {
        Logger.error(
          "An error has occurred during the fetching of all servers: ",
          err.message
        );
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Fetches and returns a server record by name
 * @param serverName
 */
async function getServerByName(serverName: string): Promise<Server> {
  return new Promise((resolve, reject) => {
    database.get<Server>(
      "SELECT * FROM server WHERE name = ? LIMIT 1",
      serverName,
      (err, row) => {
        if (err) {
          Logger.error(
            "An error has occurred during fetching servers by name: ",
            err.message
          );
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
}

/**
 * Deletes a server record by id
 * @param serverId the server's id
 */
async function deleteServerById(serverId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    database.run(
      "DELETE FROM server WHERE id = ?",
      serverId,
      (row: RunResult, err: Error | null) => {
        if (err) {
          Logger.error(
            "An error has occurred during deleting server by id: ",
            err.message
          );
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

export {
  isServerNameTaken,
  saveServer,
  getServerList,
  getServerByName,
  deleteServerById,
};
