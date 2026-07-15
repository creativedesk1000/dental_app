import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_EXPIRY = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000,
  PASSWORD_RESET: 60 * 60 * 1000,
} as const;

export async function createVerificationToken(
  identifier: string,
  type: "email-verification" | "password-reset"
) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(
    Date.now() +
      (type === "email-verification"
        ? TOKEN_EXPIRY.EMAIL_VERIFICATION
        : TOKEN_EXPIRY.PASSWORD_RESET)
  );

  await prisma.verificationToken.deleteMany({ where: { identifier } });

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return { token, expires };
}

export async function verifyToken(identifier: string, token: string) {
  const record = await prisma.verificationToken.findFirst({
    where: { identifier, token },
  });

  if (!record) return null;
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: { identifier, token },
      },
    });
    return null;
  }

  return record;
}

export async function deleteVerificationToken(identifier: string, token: string) {
  await prisma.verificationToken.deleteMany({ where: { identifier, token } });
}
