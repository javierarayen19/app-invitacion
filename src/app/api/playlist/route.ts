import { getDb, initDb } from "@/lib/db";

export async function GET() {
  await initDb();
  const db = getDb();
  const result = await db.execute(
    "SELECT id, song_name, artist, suggested_by, created_at as createdAt FROM playlist ORDER BY created_at DESC"
  );
  return Response.json(result.rows);
}

export async function POST(request: Request) {
  await initDb();
  const db = getDb();
  const body = await request.json();
  const { song_name, artist = "", suggested_by = "" } = body;

  if (!song_name || !song_name.trim()) {
    return Response.json({ error: "El nombre de la cancion es requerido" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  await db.execute({
    sql: "INSERT INTO playlist (id, song_name, artist, suggested_by) VALUES (?, ?, ?, ?)",
    args: [id, song_name.trim(), artist.trim(), suggested_by.trim()],
  });

  return Response.json({ id, song_name: song_name.trim(), artist: artist.trim(), suggested_by: suggested_by.trim() }, { status: 201 });
}

export async function DELETE(request: Request) {
  await initDb();
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return Response.json({ error: "ID requerido" }, { status: 400 });

  await db.execute({ sql: "DELETE FROM playlist WHERE id = ?", args: [id] });
  return Response.json({ success: true });
}
