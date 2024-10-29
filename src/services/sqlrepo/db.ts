import { Database, OPEN_READWRITE, RunResult } from "sqlite3";
import { Logger } from "../../utils/logger";

const database = new Database("./db/vitobot.db", OPEN_READWRITE, (err) => {
  if (err) {
    Logger.error("An error occurred during a transaction: ", err.message);
  }
});

export { database };
