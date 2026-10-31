import nodemailer from 'nodemailer';

export interface AdminCredentialsEmailParams {
  toEmail: string;
  adminName: string;
  username: string;
  password: string;
  loginUrl: string;
  phone?: string;
}

export interface EmailSendResult {
  sentViaSmtp: boolean;
  recipient: string;
  subject: string;
  bodyText: string;
  gmailComposeUrl: string;
  whatsappShareUrl?: string;
  mailtoUrl: string;
  errorMessage?: string;
}

/**
 * Envía las credenciales de acceso al nuevo administrador (correo Gmail).
 * Si existen variables SMTP (SMTP_USER / GMAIL_USER y SMTP_PASS / GMAIL_APP_PASSWORD),
 * realiza el envío directo por Nodemailer a través de smtp.gmail.com.
 * Además genera las URLs de respaldo para Gmail Web y WhatsApp directo.
 */
export async function sendAdminCredentialsEmail(
  params: AdminCredentialsEmailParams
): Promise<EmailSendResult> {
  const { toEmail, adminName, username, password, loginUrl, phone } = params;

  const subject = 'Tus credenciales de acceso como Administrador - Hobby Bolivia';
  
  const bodyText = [
    `Hola ${adminName},`,
    '',
    'Se ha creado tu cuenta de Administrador en el Panel de Control de Hobby Bolivia.',
    '',
    'Tus datos de acceso al sistema son:',
    `• Correo de Usuario: ${username}`,
    `• Contraseña de Ingreso: ${password}`,
    `• Enlace del Panel: ${loginUrl}`,
    '',
    'Por favor mantén estas credenciales en reserva para la seguridad de la tienda.',
    '',
    'Atentamente,',
    'Superadministración · Hobby Bolivia (Aeromodelismo & Modelismo)'
  ].join('\n');

  // Enlace para abrir Gmail Compose con los campos prellenados
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    toEmail
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

  // Enlace para WhatsApp si se registró número con código de país
  const cleanDigits = phone ? phone.replace(/[^\d]/g, '') : '';
  const whatsappShareUrl = cleanDigits
    ? `https://api.whatsapp.com/send?phone=${cleanDigits}&text=${encodeURIComponent(bodyText)}`
    : undefined;

  const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(bodyText)}`;

  const smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || process.env.SUPERADMIN_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '').trim().replace(/\s+/g, '');

  let sentViaSmtp = false;
  let errorMessage: string | undefined = undefined;

  if (smtpUser && smtpPass && smtpUser.includes('@')) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background-color: #FAF8F5; border: 1px solid #E2DCD3; border-radius: 20px; overflow: hidden; padding: 28px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #211E1C; color: #D4A359; padding: 8px 18px; border-radius: 12px; font-weight: 900; font-size: 14px; letter-spacing: 1px;">
              HOBBY BOLIVIA
            </div>
          </div>
          <h2 style="color: #1A1817; font-size: 20px; font-weight: 800; margin-bottom: 12px; text-align: center;">
            Credenciales de Acceso Administrador
          </h2>
          <p style="color: #5C5650; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Hola <strong>${adminName}</strong>, se ha habilitado tu cuenta para gestionar el catálogo, precios, pedidos y clientes en el panel de control de <strong>Hobby Bolivia</strong>.
          </p>
          <div style="background-color: #ffffff; border: 1px solid #E2DCD3; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
            <div style="margin-bottom: 10px; font-size: 13px;">
              <span style="color: #8C827A; font-weight: 700;">Usuario (Gmail):</span>
              <strong style="color: #1A1817; display: block; font-size: 14px; margin-top: 2px;">${username}</strong>
            </div>
            <div style="margin-bottom: 10px; font-size: 13px;">
              <span style="color: #8C827A; font-weight: 700;">Contraseña temporal:</span>
              <strong style="color: #1A1817; display: block; font-size: 14px; font-family: monospace; background: #FAF8F5; padding: 4px 8px; border-radius: 6px; display: inline-block; margin-top: 2px;">${password}</strong>
            </div>
            <div style="font-size: 13px;">
              <span style="color: #8C827A; font-weight: 700;">Rol del Sistema:</span>
              <span style="color: #3E7B44; font-weight: 800; display: block; margin-top: 2px;">ADMIN (Acceso a Catálogo, Pedidos y Métricas)</span>
            </div>
          </div>
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="${loginUrl}" style="background-color: #D4A359; color: #161311; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; text-decoration: none; padding: 12px 28px; border-radius: 30px; display: inline-block;">
              Ingresar al Panel de Control &rarr;
            </a>
          </div>
          <p style="color: #8C827A; font-size: 11px; text-align: center; margin: 0;">
            Hobby Bolivia · Aeromodelismo, Drones y Modelismo a Escala
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: `"Hobby Bolivia" <${smtpUser}>`,
        to: toEmail,
        subject,
        text: bodyText,
        html: htmlBody
      });

      sentViaSmtp = true;
    } catch (err: any) {
      console.warn('[Email SMTP Warning]: No se pudo despachar por Gmail SMTP:', err?.message || err);
      errorMessage = err?.message || 'Error al conectar con Gmail SMTP';
    }
  } else {
    errorMessage = 'Falta configurar GMAIL_APP_PASSWORD en .env para envío SMTP desatendido automático.';
  }

  return {
    sentViaSmtp,
    recipient: toEmail,
    subject,
    bodyText,
    gmailComposeUrl,
    whatsappShareUrl,
    mailtoUrl,
    errorMessage
  };
}
