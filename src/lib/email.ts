import tls from 'tls';

export interface AdminCredentialsEmailParams {
  toEmail: string;
  adminName: string;
  username: string;
  password: string;
  loginUrl: string;
}

export interface EmailSendResult {
  sentViaSmtp: boolean;
  recipient: string;
  subject: string;
  bodyText: string;
  gmailComposeUrl: string;
  mailtoUrl: string;
}

/**
 * Envía las credenciales de acceso al nuevo administrador (correo Gmail).
 * Si existen variables SMTP (SMTP_USER / GMAIL_USER y SMTP_PASS / GMAIL_APP_PASSWORD),
 * realiza el envío directo por SMTP TLS (smtp.gmail.com:465).
 * Además genera las URLs de respaldo y confirmación para el panel.
 */
export async function sendAdminCredentialsEmail(
  params: AdminCredentialsEmailParams
): Promise<EmailSendResult> {
  const { toEmail, adminName, username, password, loginUrl } = params;

  const subject = 'Tus credenciales de acceso como Administrador - Hobby Bolivia';
  const bodyText = [
    `Hola ${adminName},`,
    '',
    'Se ha creado tu cuenta de Administrador en el Panel de Control de Hobby Bolivia.',
    '',
    'Tus datos de acceso son:',
    `• Usuario (Gmail): ${username}`,
    `• Contraseña: ${password}`,
    `• Enlace de ingreso: ${loginUrl}`,
    '',
    'Por seguridad, te recomendamos mantener estas credenciales en reserva.',
    '',
    'Atentamente,',
    'Superadministración · Hobby Bolivia'
  ].join('\n');

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    toEmail
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

  const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(bodyText)}`;

  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || process.env.SUPERADMIN_USER || '';
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';

  if (smtpUser && smtpPass && smtpUser.includes('@')) {
    try {
      await sendViaGmailSmtp({
        from: smtpUser,
        pass: smtpPass,
        to: toEmail,
        subject,
        text: bodyText
      });
      return {
        sentViaSmtp: true,
        recipient: toEmail,
        subject,
        bodyText,
        gmailComposeUrl,
        mailtoUrl
      };
    } catch (err) {
      console.warn('[Email SMTP Warning]: No se pudo enviar por SMTP directo:', err);
    }
  }

  return {
    sentViaSmtp: false,
    recipient: toEmail,
    subject,
    bodyText,
    gmailComposeUrl,
    mailtoUrl
  };
}

function sendViaGmailSmtp(opts: {
  from: string;
  pass: string;
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(465, 'smtp.gmail.com', { rejectUnauthorized: false });
    let step = 0;
    let buffer = '';

    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error('SMTP timeout'));
    }, 8000);

    const sendLine = (line: string) => {
      socket.write(line + '\r\n');
    };

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\r\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.length >= 4 && line[3] === '-') continue;
        const code = parseInt(line.slice(0, 3), 10);
        if (code >= 400) {
          clearTimeout(timeout);
          socket.end();
          reject(new Error(`SMTP Error: ${line}`));
          return;
        }

        if (step === 0 && code === 220) {
          step = 1;
          sendLine('EHLO hobbybolivia.com');
        } else if (step === 1 && code === 250) {
          step = 2;
          const authPlain = Buffer.from(`\0${opts.from}\0${opts.pass}`, 'utf8').toString('base64');
          sendLine(`AUTH PLAIN ${authPlain}`);
        } else if (step === 2 && code === 235) {
          step = 3;
          sendLine(`MAIL FROM:<${opts.from}>`);
        } else if (step === 3 && code === 250) {
          step = 4;
          sendLine(`RCPT TO:<${opts.to}>`);
        } else if (step === 4 && code === 250) {
          step = 5;
          sendLine('DATA');
        } else if (step === 5 && code === 354) {
          step = 6;
          const emailPayload = [
            `From: "Hobby Bolivia" <${opts.from}>`,
            `To: <${opts.to}>`,
            `Subject: =?UTF-8?B?${Buffer.from(opts.subject, 'utf8').toString('base64')}?=`,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
            '',
            opts.text,
            '.'
          ].join('\r\n');
          sendLine(emailPayload);
        } else if (step === 6 && code === 250) {
          step = 7;
          sendLine('QUIT');
          clearTimeout(timeout);
          socket.end();
          resolve();
        }
      }
    });

    socket.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}
