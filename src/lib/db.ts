import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "guests.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    db.exec(`
      CREATE TABLE IF NOT EXISTS guests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        confirmed INTEGER NOT NULL DEFAULT 1,
        dietary TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Add dietary column if missing (existing DBs)
    try {
      db.exec("ALTER TABLE guests ADD COLUMN dietary TEXT NOT NULL DEFAULT ''");
    } catch {
      // Column already exists
    }

    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    const seedSetting = db.prepare(
      "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)"
    );
    seedSetting.run("notification_email", "");
    seedSetting.run("party_date", "");
    seedSetting.run("party_time", "");
    seedSetting.run("party_location", "");
    seedSetting.run("birthday_person", "");
    seedSetting.run("party_message", "");
    seedSetting.run("party_safety_message", "");

    // Remove old whatsapp key if present
    db.prepare("DELETE FROM settings WHERE key = 'organizer_whatsapp'").run();
  }

  return db;
}
