import "server-only";
import nodemailer from "nodemailer";

/**
 * Mail is SMTP through a mailbox the studio or the parish owns (glaze.md),
 * never a hosted mail API. Nothing here runs until the SMTP_* variables are
 * set in Vercel. Until then `configured()` is false, the forms still
 * succeed for the visitor, and the full payload goes to the log.
 *
 * One SMTP account serves every parish on the platform; the recipient is
 * the parish's own `mailTo`, falling back to MAIL_TO. .env.example is the
 * authority for the variable names.
 */
export function configured(to?: string): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && (to || process.env.MAIL_TO));
}

/** A plain address or nothing. The form's type="email" is only enforced by the browser. */
export function cleanAddress(s?: string): string | undefined {
  const v = s?.trim();
  return v && /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(v) ? v : undefined;
}

export async function send(subject: string, text: string, replyTo?: string, to?: string): Promise<void> {
  replyTo = cleanAddress(replyTo);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_PORT === "465",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
    to: to ?? process.env.MAIL_TO,
    subject,
    text,
    ...(replyTo ? { replyTo } : {}),
  });
}
