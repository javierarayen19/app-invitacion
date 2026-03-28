import { NextRequest } from "next/server";
import { getDb, initDb } from "@/lib/db";

const VALID_KEYS = [
  "notification_email",
  "party_date",
  "party_time",
  "party_location",
  "birthday_person",
  "party_message",
  "party_safety_message",
  "admin_password",
];

export async function GET() {
  await initDb();
  const db = getDb();
  const result = await db.execute("SELECT key, value FROM settings");
  const settings = Object.fromEntries(
    result.rows.map((r) => [r.key, r.value])
  );
  return Response.json(settings);
}

export async function PUT(request: NextRequest) {
  await initDb();
  const body = await request.json();
  const db = getDb();

  for (const [key, value] of Object.entries(body)) {
    if (VALID_KEYS.includes(key) && typeof value === "string") {
      await db.execute({
        sql: "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
        args: [key, value],
      });
    }
  }

  const result = await db.execute("SELECT key, value FROM settings");
  const settings = Object.fromEntries(
    result.rows.map((r) => [r.key, r.value])
  );
  return Response.json(settings);
}
