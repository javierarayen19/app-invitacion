import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const guests = db
    .prepare(
      `SELECT id, name, companions, confirmed, created_at as createdAt
       FROM guests ORDER BY created_at DESC`
    )
    .all()
    .map((g: Record<string, unknown>) => ({
      ...g,
      confirmed: Boolean(g.confirmed),
    }));

  return Response.json(guests);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, companions, confirmed } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json(
      { error: "El nombre es obligatorio" },
      { status: 400 }
    );
  }

  const db = getDb();
  const id = crypto.randomUUID();

  db.prepare(
    `INSERT INTO guests (id, name, companions, confirmed)
     VALUES (?, ?, ?, ?)`
  ).run(id, name.trim(), Math.max(0, Number(companions) || 0), confirmed ? 1 : 0);

  const guest = db
    .prepare(
      `SELECT id, name, companions, confirmed, created_at as createdAt
       FROM guests WHERE id = ?`
    )
    .get(id) as Record<string, unknown>;

  return Response.json(
    { ...guest, confirmed: Boolean(guest.confirmed) },
    { status: 201 }
  );
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Se requiere el ID" }, { status: 400 });
  }

  const db = getDb();
  const result = db.prepare("DELETE FROM guests WHERE id = ?").run(id);

  if (result.changes === 0) {
    return Response.json(
      { error: "Invitado no encontrado" },
      { status: 404 }
    );
  }

  return Response.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, confirmed } = body;

  if (!id) {
    return Response.json({ error: "Se requiere el ID" }, { status: 400 });
  }

  const db = getDb();
  const result = db
    .prepare("UPDATE guests SET confirmed = ? WHERE id = ?")
    .run(confirmed ? 1 : 0, id);

  if (result.changes === 0) {
    return Response.json(
      { error: "Invitado no encontrado" },
      { status: 404 }
    );
  }

  const guest = db
    .prepare(
      `SELECT id, name, companions, confirmed, created_at as createdAt
       FROM guests WHERE id = ?`
    )
    .get(id) as Record<string, unknown>;

  return Response.json({ ...guest, confirmed: Boolean(guest.confirmed) });
}
