import { NextRequest } from "next/server";
import { getDb, initDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  await initDb();
  const { password } = await request.json();
  const db = getDb();

  const result = await db.execute(
    "SELECT value FROM settings WHERE key = 'admin_password'"
  );

  const storedPassword = result.rows[0]?.value as string;

  // If no password is set, allow any access (first time setup)
  if (!storedPassword) {
    return Response.json({ success: true, needsSetup: true });
  }

  if (password === storedPassword) {
    return Response.json({ success: true });
  }

  return Response.json(
    { error: "Contraseña incorrecta" },
    { status: 401 }
  );
}
