import { getDb, initDb } from "@/lib/db";

export async function GET() {
  await initDb();
  const db = getDb();

  const result = await db.execute(
    "SELECT name, confirmed, declined, decline_reason, dietary, plus_one, plus_one_name, created_at FROM guests ORDER BY name"
  );

  const rows = result.rows as Record<string, unknown>[];

  // Build CSV
  const headers = ["Nombre", "Estado", "Restriccion Alimentaria", "Acompanante", "Nombre Acompanante", "Motivo Rechazo", "Fecha Registro"];
  const csvRows = rows.map((r) => {
    const estado = r.declined ? "No asistira" : r.confirmed ? "Confirmado" : "Pendiente";
    const plusOne = r.plus_one ? "Si" : "No";
    return [
      `"${r.name}"`,
      estado,
      `"${r.dietary || ""}"`,
      plusOne,
      `"${r.plus_one_name || ""}"`,
      `"${r.decline_reason || ""}"`,
      `"${r.created_at}"`,
    ].join(",");
  });

  const csv = [headers.join(","), ...csvRows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invitados-fiesta.csv"`,
    },
  });
}
