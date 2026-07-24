import nodemailer from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendEmail(payload: EmailPayload) {
  const from = process.env.EMAIL_FROM || "noreply@dentalsaas.com";
  const transport = getTransport();

  if (!transport) {
    console.log("[email:dev]", {
      from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
    });
    return { delivered: false, mode: "console" as const };
  }

  await transport.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  return { delivered: true, mode: "smtp" as const };
}

function appUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = appUrl(`/verify-email?token=${token}&email=${encodeURIComponent(email)}`);
  return sendEmail({
    to: email,
    subject: "Verify your DentalSaaS account",
    text: `Verify your email by visiting: ${url}`,
    html: `<p>Welcome to DentalSaaS!</p><p><a href="${url}">Verify your email address</a></p><p>This link expires in 24 hours.</p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = appUrl(`/reset-password?token=${token}&email=${encodeURIComponent(email)}`);
  return sendEmail({
    to: email,
    subject: "Reset your DentalSaaS password",
    text: `Reset your password by visiting: ${url}`,
    html: `<p>You requested a password reset.</p><p><a href="${url}">Reset your password</a></p><p>This link expires in 1 hour. If you did not request this, ignore this email.</p>`,
  });
}

export async function sendPatientCredentialsEmail(email: string, password: string, clinicName: string) {
  const url = appUrl(`/login`);
  return sendEmail({
    to: email,
    subject: `Your Patient Portal Account for ${clinicName}`,
    text: `Welcome to the Patient Portal for ${clinicName}. Login at ${url}. Email: ${email}, Password: ${password}. Please log in and change your password.`,
    html: `<p>Welcome to the Patient Portal for <strong>${clinicName}</strong>.</p>
           <p>Your account has been created by your clinic. You can log in here: <a href="${url}">Patient Portal</a></p>
           <p><strong>Email:</strong> ${email}<br/><strong>Temporary Password:</strong> ${password}</p>
           <p>Please log in and change your password immediately for security reasons.</p>`,
  });
}
