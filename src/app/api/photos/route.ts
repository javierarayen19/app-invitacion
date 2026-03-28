import { getDb, initDb } from "@/lib/db";

export async function GET() {
  await initDb();
  const db = getDb();
  const result = await db.execute(
    "SELECT id, image_data, caption, uploaded_by, created_at as createdAt FROM photos ORDER BY created_at DESC"
  );
  return Response.json(result.rows);
}

export async function POST(request: Request) {
  await initDb();
  const db = getDb();
  const body = await request.json();
  const { image_data, caption = "", uploaded_by = "" } = body;

  if (!image_data) {
    return Response.json({ error: "La imagen es requerida" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  await db.execute({
    sql: "INSERT INTO photos (id, image_data, caption, uploaded_by) VALUES (?, ?, ?, ?)",
    args: [id, image_data, caption.trim(), uploaded_by.trim()],
  });

  return Response.json({ id }, { status: 201 });
}

export async function DELETE(request: Request) {
  await initDb();
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return Response.json({ error: "ID requerido" }, { status: 400 });

  await db.execute({ sql: "DELETE FROM photos WHERE id = ?", args: [id] });
  return Response.json({ success: true });
}
