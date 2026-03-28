import { getDb, initDb } from "@/lib/db";

export async function GET() {
  await initDb();
  const db = getDb();

  // Get pending guests (not confirmed and not declined)
  const result = await db.execute(
    "SELECT id, name FROM guests WHERE confirmed = 0 AND declined = 0 ORDER BY name"
  );

  const settings = await db.execute("SELECT key, value FROM settings");
  const settingsMap = Object.fromEntries(
    settings.rows.map((r) => [r.key, r.value])
  );

  const birthdayPerson = settingsMap.birthday_person || "la fiesta";

  const pendingGuests = (result.rows as Record<string, unknown>[]).map((r) => {
    const url = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/invitacion/${r.id}`;
    const message = `Hola ${r.name}! Te recordamos que aun no has confirmado tu asistencia al cumple de ${birthdayPerson}. Abre tu invitacion aqui: ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    return {
      id: r.id,
      name: r.name,
      message,
      whatsappUrl,
    };
  });

  return Response.json(pendingGuests);
}
