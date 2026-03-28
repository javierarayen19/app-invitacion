import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(
  guestName: string,
  birthdayPerson: string,
  dietary: string = "",
  isDecline: boolean = false,
  declineReason: string = ""
) {
  const toEmail = process.env.NOTIFICATION_EMAIL;
  if (!toEmail) {
    console.error("NOTIFICATION_EMAIL no esta configurado");
    return;
  }

  if (isDecline) {
    const reasonLine = declineReason
      ? `<div style="text-align: center; padding: 12px; background: #fef2f2; border-radius: 12px; color: #991b1b; margin-top: 12px;">
          <strong>Motivo:</strong> ${declineReason}
        </div>`
      : "";

    await resend.emails.send({
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
    return;
  }

  const dietaryLine = dietary
    ? `<div style="text-align: center; padding: 12px; background: #fef3c7; border-radius: 12px; color: #92400e; margin-top: 12px;">
        <strong>Restriccion alimentaria:</strong> ${dietary}
      </div>`
    : "";

  await resend.emails.send({
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
}
