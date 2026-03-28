import { getDb, initDb } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/email";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDb();
  const { id } = await params;
  const db = getDb();

  const result = await db.execute({
    sql: "SELECT id, name, confirmed, declined, decline_reason, dietary, created_at as createdAt FROM guests WHERE id = ?",
    args: [id],
  });

  const guest = result.rows[0];

  if (!guest) {
    return Response.json(
      { error: "Invitado no encontrado" },
      { status: 404 }
    );
  }

  const settingsResult = await db.execute("SELECT key, value FROM settings");
  const settings = Object.fromEntries(
    settingsResult.rows.map((r) => [r.key, r.value])
  );

  return Response.json({
    guest: { ...guest, confirmed: Boolean(guest.confirmed), declined: Boolean(guest.declined) },
    settings,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDb();
  const { id } = await params;
  const db = getDb();

  let dietary = "";
  let action = "confirm";
  let declineReason = "";

  try {
    const body = await request.json();
    dietary = body.dietary || "";
    action = body.action || "confirm";
    declineReason = body.decline_reason || "";
  } catch {
    // No body sent
  }

  if (action === "decline") {
    const result = await db.execute({
      sql: "UPDATE guests SET declined = 1, confirmed = 0, decline_reason = ? WHERE id = ?",
      args: [declineReason, id],
    });

    if (result.rowsAffected === 0) {
      return Response.json(
        { error: "Invitado no encontrado" },
        { status: 404 }
      );
    }

    // Send email about decline
    const guest = (await db.execute({
      sql: "SELECT name FROM guests WHERE id = ?",
      args: [id],
    })).rows[0];

    const birthdayPerson = (await db.execute(
      "SELECT value FROM settings WHERE key = 'birthday_person'"
    )).rows[0]?.value as string || "";

    if (guest) {
      sendConfirmationEmail(
        guest.name as string,
        birthdayPerson,
        "",
        true,
        declineReason
      ).catch(console.error);
    }

    return Response.json({ success: true });
  }

  // Confirm action
  const result = await db.execute({
    sql: "UPDATE guests SET confirmed = 1, declined = 0, decline_reason = '', dietary = ? WHERE id = ?",
    args: [dietary, id],
  });

  if (result.rowsAffected === 0) {
    return Response.json(
      { error: "Invitado no encontrado" },
      { status: 404 }
    );
  }

  const guest = (await db.execute({
    sql: "SELECT name, dietary FROM guests WHERE id = ?",
    args: [id],
  })).rows[0];

  const birthdayPerson = (await db.execute(
    "SELECT value FROM settings WHERE key = 'birthday_person'"
  )).rows[0]?.value as string || "";

  if (guest) {
    sendConfirmationEmail(
      guest.name as string,
      birthdayPerson,
      guest.dietary as string
    ).catch(console.error);
  }

  return Response.json({ success: true });
}
