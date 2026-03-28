import { Resend } from "resend";
import { getDb } from "./db";

const resend = new Resend(process.env.RESEND_API_KEY);

async function getNotificationEmail(): Promise<string | null> {
  // Primero intenta variable de entorno
  if (process.env.NOTIFICATION_EMAIL) return process.env.NOTIFICATION_EMAIL;
  // Si no, busca en la base de datos
  try {
    const db = getDb();
    const result = await db.execute(
      "SELECT value FROM settings WHERE key = 'notification_email'"
    );
    const email = result.rows[0]?.value as string;
    return email || null;
  } catch {
    return null;
  }
}

export async function sendConfirmationEmail(
  guestName: string,
  birthdayPerson: string,
  dietary: string = "",
  isDecline: boolean = false,
  declineReason: string = ""
) {
  const toEmail = await getNotificationEmail();
  if (!toEmail) {
    console.error("NOTIFICATION_EMAIL no esta configurado (ni en env ni en settings)");
    return;
  }

  console.log(`[Email] Enviando a ${toEmail} - ${isDecline ? "rechazo" : "confirmacion"} de ${guestName}`);

  if (isDecline) {
    const reasonLine = declineReason
      ? `<div style="text-align: center; padding: 12px; background: #fef2f2; border-radius: 12px; color: #991b1b; margin-top: 12px;">
          <strong>Motivo:</strong> ${declineReason}
        </div>`
      : "";

    const declineResult = await resend.emails.send({
      from: "Fiesta Invitados <onboarding@resend.dev>",
      to: toEmail,
      subject: `${guestName} no podra asistir al cumple de ${birthdayPerson}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fffbf5; border-radius: 16px;">
          <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">😔</div>
          <h1 style="text-align: center; color: #92400e; font-size: 24px; margin-bottom: 8px;">
            No podra asistir
          </h1>
          <p style="text-align: center; color: #b45309; font-size: 18px; margin-bottom: 24px;">
            <strong>${guestName}</strong> no podra asistir al cumple de <strong>${birthdayPerson}</strong>.
          </p>
          <div style="text-align: center; padding: 16px; background: #fef2f2; border-radius: 12px; color: #991b1b;">
            <strong>Estado:</strong> No asistira
          </div>
          ${reasonLine}
          <p style="text-align: center; color: #d97706; font-size: 14px; margin-top: 24px;">
            Enviado desde tu app Fiesta Invitados
          </p>
        </div>
      `,
    });
    console.log("[Email] Resultado rechazo:", JSON.stringify(declineResult));
    return;
  }

  const dietaryLine = dietary
    ? `<div style="text-align: center; padding: 12px; background: #fef3c7; border-radius: 12px; color: #92400e; margin-top: 12px;">
        <strong>Restriccion alimentaria:</strong> ${dietary}
      </div>`
    : "";

  const confirmResult = await resend.emails.send({
    from: "Fiesta Invitados <onboarding@resend.dev>",
    to: toEmail,
    subject: `${guestName} confirmo asistencia al cumple de ${birthdayPerson}!`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fffbf5; border-radius: 16px;">
        <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">🎉</div>
        <h1 style="text-align: center; color: #92400e; font-size: 24px; margin-bottom: 8px;">
          Nueva confirmacion!
        </h1>
        <p style="text-align: center; color: #b45309; font-size: 18px; margin-bottom: 24px;">
          <strong>${guestName}</strong> confirmo su asistencia al cumple de <strong>${birthdayPerson}</strong>.
        </p>
        <div style="text-align: center; padding: 16px; background: #ecfdf5; border-radius: 12px; color: #065f46;">
          <strong>Estado:</strong> Confirmado
        </div>
        ${dietaryLine}
        <p style="text-align: center; color: #d97706; font-size: 14px; margin-top: 24px;">
          Enviado desde tu app Fiesta Invitados
        </p>
      </div>
    `,
  });
  console.log("[Email] Resultado confirmacion:", JSON.stringify(confirmResult));
}
