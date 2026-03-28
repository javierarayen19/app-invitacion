import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";

const VALID_KEYS = [
  "notification_email",
  "party_date",
  "party_time",
  "party_location",
  "birthday_person",
  "party_message",
  "party_safety_message",
];

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare("SELECT key, value FROM settings")
    .all() as { key: string; value: string }[];

  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return Response.json(settings);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const db = getDb();

  const update = db.prepare("UPDATE settings SET value = ? WHERE key = ?");

  for (const [key, value] of Object.entries(body)) {
    if (VALID_KEYS.includes(key) && typeof value === "string") {
      update.run(value, key);
    }
  }

  const rows = db
    .prepare("SELECT key, value FROM settings")
    .all() as { key: string; value: string }[];

  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return Response.json(settings);
}
