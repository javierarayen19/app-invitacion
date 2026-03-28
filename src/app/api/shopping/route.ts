import { getDb, initDb } from "@/lib/db";
import { SHOPPING_CATEGORIES } from "@/types/shopping";

export async function GET() {
  await initDb();
  const db = getDb();

  const result = await db.execute(
    "SELECT id, name, quantity, price, category, bought, responsible, urgent, link, created_at as createdAt FROM shopping_items ORDER BY category, urgent DESC, created_at DESC"
  );

  const items = (result.rows as Record<string, unknown>[]).map((row) => ({
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    price: row.price,
    category: row.category,
    bought: Boolean(row.bought),
    responsible: row.responsible,
    urgent: Boolean(row.urgent),
    link: row.link || "",
    createdAt: row.createdAt,
  }));

  return Response.json(items);
}

export async function POST(request: Request) {
  await initDb();
  const db = getDb();

  const body = await request.json();
  const { name, category, quantity = 1, price = 0, responsible = "", urgent = false, link = "" } = body;

  if (!name || !name.trim()) {
    return Response.json({ error: "El nombre es requerido" }, { status: 400 });
  }

  if (!SHOPPING_CATEGORIES.includes(category)) {
    return Response.json({ error: "Categoria invalida" }, { status: 400 });
  }

  const id = crypto.randomUUID();

  await db.execute({
    sql: "INSERT INTO shopping_items (id, name, quantity, price, category, responsible, urgent, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    args: [id, name.trim(), quantity, price, category, responsible.trim(), urgent ? 1 : 0, link.trim()],
  });

  return Response.json({ id, name: name.trim(), quantity, price, category, bought: false, responsible: responsible.trim(), urgent, link: link.trim() }, { status: 201 });
}

export async function PATCH(request: Request) {
  await initDb();
  const db = getDb();

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return Response.json({ error: "ID requerido" }, { status: 400 });
  }

  // Full edit mode: update all fields
  if (body.name !== undefined) {
    const { name, quantity = 1, price = 0, category, responsible = "", urgent = false, link = "" } = body;

    if (!name || !name.trim()) {
      return Response.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    if (category && !SHOPPING_CATEGORIES.includes(category)) {
      return Response.json({ error: "Categoria invalida" }, { status: 400 });
    }

    const result = await db.execute({
      sql: "UPDATE shopping_items SET name = ?, quantity = ?, price = ?, category = ?, responsible = ?, urgent = ?, link = ? WHERE id = ?",
      args: [name.trim(), quantity, price, category, responsible.trim(), urgent ? 1 : 0, link.trim(), id],
    });

    if (result.rowsAffected === 0) {
      return Response.json({ error: "Item no encontrado" }, { status: 404 });
    }

    return Response.json({ success: true });
  }

  // Toggle bought mode
  const { bought } = body;
  const result = await db.execute({
    sql: "UPDATE shopping_items SET bought = ? WHERE id = ?",
    args: [bought ? 1 : 0, id],
  });

  if (result.rowsAffected === 0) {
    return Response.json({ error: "Item no encontrado" }, { status: 404 });
  }

  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  await initDb();
  const db = getDb();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID requerido" }, { status: 400 });
  }

  const result = await db.execute({
    sql: "DELETE FROM shopping_items WHERE id = ?",
    args: [id],
  });

  if (result.rowsAffected === 0) {
    return Response.json({ error: "Item no encontrado" }, { status: 404 });
  }

  return Response.json({ success: true });
}
