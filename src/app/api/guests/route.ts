import { NextRequest } from "next/server";
import { getDb, initDb } from "@/lib/db";

export async function GET() {
  await initDb();
  const db = getDb();
  const result = await db.execute(
    `SELECT id, name, confirmed, declined, decline_reason, dietary, plus_one, plus_one_name, created_at as createdAt
     FROM guests ORDER BY created_at DESC`
  );

  const guests = result.rows.map((g) => ({
    ...g,
    confirmed: Boolean(g.confirmed),
    declined: Boolean(g.declined),
    plus_one: Boolean(g.plus_one),
  }));

  return Response.json(guests);
}

export async function POST(request: NextRequest) {
  await initDb();
  const body = await request.json();
  const { name, confirmed, dietary } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json(
      { error: "El nombre es obligatorio" },
      { status: 400 }
    );
  }

  const db = getDb();
  const id = crypto.randomUUID();

  await db.execute({
    sql: `INSERT INTO guests (id, name, confirmed, dietary) VALUES (?, ?, ?, ?)`,
    args: [id, name.trim(), confirmed ? 1 : 0, dietary || ""],
  });

  const result = await db.execute({
    sql: `SELECT id, name, confirmed, declined, decline_reason, dietary, created_at as createdAt
          FROM guests WHERE id = ?`,
    args: [id],
  });

  const guest = result.rows[0];

  return Response.json(
    { ...guest, confirmed: Boolean(guest.confirmed), declined: Boolean(guest.declined) },
    { status: 201 }
  );
}

export async function DELETE(request: NextRequest) {
  await initDb();
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Se requiere el ID" }, { status: 400 });
  }

  const db = getDb();
  const result = await db.execute({
    sql: "DELETE FROM guests WHERE id = ?",
    args: [id],
  });

  if (result.rowsAffected === 0) {
    return Response.json(
      { error: "Invitado no encontrado" },
      { status: 404 }
    );
  }

  return Response.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  await initDb();
  const body = await request.json();
  const { id, confirmed } = body;

  if (!id) {
    return Response.json({ error: "Se requiere el ID" }, { status: 400 });
  }

  const db = getDb();
  const result = await db.execute({
    sql: "UPDATE guests SET confirmed = ?, declined = 0, decline_reason = '' WHERE id = ?",
    args: [confirmed ? 1 : 0, id],
  });

  if (result.rowsAffected === 0) {
    return Response.json(
      { error: "Invitado no encontrado" },
      { status: 404 }
    );
  }

  const guest = (await db.execute({
    sql: `SELECT id, name, confirmed, declined, decline_reason, dietary, created_at as createdAt
          FROM guests WHERE id = ?`,
    args: [id],
  })).rows[0];

  return Response.json({ ...guest, confirmed: Boolean(guest.confirmed), declined: Boolean(guest.declined) });
}
