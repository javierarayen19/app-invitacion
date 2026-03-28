import { getDb } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/email";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const guest = db
    .prepare(
      "SELECT id, name, confirmed, dietary, created_at as createdAt FROM guests WHERE id = ?"
    )
    .get(id) as Record<string, unknown> | undefined;

  if (!guest) {
    return Response.json(
      { error: "Invitado no encontrado" },
      { status: 404 }
    );
  }

  const rows = db
    .prepare("SELECT key, value FROM settings")
    .all() as { key: string; value: string }[];

  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return Response.json({
    guest: { ...guest, confirmed: Boolean(guest.confirmed) },
    settings,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  let dietary = "";
  try {
    const body = await request.json();
    dietary = body.dietary || "";
  } catch {
    // No body sent
  }

  const result = db
    .prepare("UPDATE guests SET confirmed = 1, dietary = ? WHERE id = ?")
    .run(dietary, id);

  if (result.changes === 0) {
    return Response.json(
      { error: "Invitado no encontrado" },
      { status: 404 }
    );
  }

  // Send email notification
  const guest = db
    .prepare("SELECT name, dietary FROM guests WHERE id = ?")
    .get(id) as { name: string; dietary: string } | undefined;

  const birthdayPerson = (
    db
      .prepare("SELECT value FROM settings WHERE key = 'birthday_person'")
      .get() as { value: string } | undefined
  )?.value || "";

  if (guest) {
    sendConfirmationEmail(guest.name, birthdayPerson, guest.dietary).catch(console.error);
  }

  return Response.json({ success: true });
}
