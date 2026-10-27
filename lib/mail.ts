import "server-only";
import nodemailer from "nodemailer";

/**
 * Mail is SMTP through a mailbox the parish already owns (glaze.md), never a
 * hosted mail API. Nothing here runs until the five SMTP_* variables are set
 * in Vercel by Kevin. Until then `configured()` is false, the registration
 * form still succeeds for the visitor, and the full payload goes to the log.
 *
 * .env.example is the authority for the variable names.
 */
export function configured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.MAIL_TO);
}

export async function send(subject: string, text: string, replyTo?: string): Promise<void> {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_PORT === "465",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
    to: process.env.MAIL_TO,
    subject,
    text,
    ...(replyTo ? { replyTo } : {}),
  });
}
