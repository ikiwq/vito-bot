import { database } from "../services/sqlrepo/db";

database.exec(`
    CREATE TABLE IF NOT EXISTS server (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        ip_address TEXT,
        port INTEGER
    );
`);
