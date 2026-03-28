import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

export function getDb(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

let initialized = false;

export async function initDb() {
  if (initialized) return;
  const db = getDb();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      confirmed INTEGER NOT NULL DEFAULT 0,
      declined INTEGER NOT NULL DEFAULT 0,
      decline_reason TEXT NOT NULL DEFAULT '',
      dietary TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Add columns if missing (existing DBs)
  const safeAlter = async (sql: string) => {
    try { await db.execute(sql); } catch { /* column exists */ }
  };
  await safeAlter("ALTER TABLE guests ADD COLUMN dietary TEXT NOT NULL DEFAULT ''");
  await safeAlter("ALTER TABLE guests ADD COLUMN declined INTEGER NOT NULL DEFAULT 0");
  await safeAlter("ALTER TABLE guests ADD COLUMN decline_reason TEXT NOT NULL DEFAULT ''");

  // Seed settings
  const seeds = [
    "notification_email", "party_date", "party_time",
    "party_location", "birthday_person", "party_message",
    "party_safety_message", "admin_password",
  ];
  for (const key of seeds) {
    await db.execute({
      sql: "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
      args: [key, ""],
    });
  }

  // Remove old whatsapp key
  await db.execute("DELETE FROM settings WHERE key = 'organizer_whatsapp'");

  initialized = true;
}
