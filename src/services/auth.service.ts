import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiException } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import {
  createVerificationToken,
  deleteVerificationToken,
  verifyToken,
} from "@/lib/tokens";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/email";
import type { z } from "zod";
import type {
  changePasswordSchema,
  forgotPasswordSchema,
  registerClinicSchema,
  registerPatientSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@/lib/validations/auth";

type RegisterInput = z.infer<typeof registerClinicSchema>;
type RegisterPatientInput = z.infer<typeof registerPatientSchema>;

export async function registerClinic(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existingUser) {
    throw new ApiException("Email already exists", 409);
  }

  const existingClinic = await prisma.clinic.findUnique({
    where: { subdomain: input.subdomain },
  });
  if (existingClinic) {
    throw new ApiException("Subdomain already taken", 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const clinic = await tx.clinic.create({
      data: {
        name: input.clinicName,
        subdomain: input.subdomain,
        email: input.email,
        phone: input.phone,
        address: input.address,
      },
    });

    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: Role.CLINIC_ADMIN,
        clinicId: clinic.id,
      },
    });

    await tx.settings.create({
      data: { clinicId: clinic.id },
    });

    await tx.subscription.create({
      data: { clinicId: clinic.id },
    });

    return { clinic, user };
  });

  const { token } = await createVerificationToken(
    input.email,
    "email-verification"
  );
  await sendVerificationEmail(input.email, token);

  await createAuditLog({
    action: "CLINIC_REGISTERED",
    entity: "Clinic",
    entityId: result.clinic.id,
    userId: result.user.id,
    clinicId: result.clinic.id,
    details: { subdomain: result.clinic.subdomain },
  });

  return {
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      clinicId: result.user.clinicId,
    },
    clinic: {
      id: result.clinic.id,
      name: result.clinic.name,
      subdomain: result.clinic.subdomain,
    },
  };
}

export async function forgotPassword(
  input: z.infer<typeof forgotPasswordSchema>
) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    return { message: "If the email exists, a reset link has been sent" };
  }

  const { token } = await createVerificationToken(
    input.email,
    "password-reset"
  );
  await sendPasswordResetEmail(input.email, token);

  return { message: "If the email exists, a reset link has been sent" };
}

export async function resetPassword(
  input: z.infer<typeof resetPasswordSchema>
) {
  const record = await verifyToken(input.email, input.token);
  if (!record) {
    throw new ApiException("Invalid or expired reset token", 400);
  }

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new ApiException("User not found", 404);
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        sessionVersion: { increment: 1 },
      },
    }),
    prisma.userSession.deleteMany({ where: { userId: user.id } }),
  ]);

  await deleteVerificationToken(input.email, input.token);

  if (user.clinicId) {
    await createAuditLog({
      action: "PASSWORD_RESET",
      entity: "User",
      entityId: user.id,
      userId: user.id,
      clinicId: user.clinicId,
    });
  }

  return { message: "Password reset successful" };
}

export async function changePassword(
  userId: string,
  input: z.infer<typeof changePasswordSchema>,
  currentSessionTokenId?: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password) {
    throw new ApiException("User not found", 404);
  }

  const isValid = await bcrypt.compare(input.currentPassword, user.password);
  if (!isValid) {
    throw new ApiException("Current password is incorrect", 400);
  }

  const hashedPassword = await bcrypt.hash(input.newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        sessionVersion: { increment: 1 },
      },
    }),
    prisma.userSession.deleteMany({
      where: {
        userId,
        ...(currentSessionTokenId
          ? { tokenId: { not: currentSessionTokenId } }
          : {}),
      },
    }),
  ]);

  if (user.clinicId) {
    await createAuditLog({
      action: "PASSWORD_CHANGED",
      entity: "User",
      entityId: user.id,
      userId: user.id,
      clinicId: user.clinicId,
    });
  }

  return { message: "Password changed successfully" };
}

export async function verifyEmail(
  input: z.infer<typeof verifyEmailSchema>
) {
  const record = await verifyToken(input.email, input.token);
  if (!record) {
    throw new ApiException("Invalid or expired verification token", 400);
  }

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new ApiException("User not found", 404);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });

  await deleteVerificationToken(input.email, input.token);

  return { message: "Email verified successfully" };
}

export async function resendVerificationEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: "If the email exists, a verification link has been sent" };
  }

  if (user.emailVerified) {
    throw new ApiException("Email is already verified", 400);
  }

  const { token } = await createVerificationToken(
    email,
    "email-verification"
  );
  await sendVerificationEmail(email, token);

  return { message: "If the email exists, a verification link has been sent" };
}

export async function listUserSessions(userId: string) {
  await prisma.userSession.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  return prisma.userSession.findMany({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      tokenId: true,
      userAgent: true,
      ipAddress: true,
      expiresAt: true,
      createdAt: true,
    },
  });
}

export async function revokeUserSession(
  userId: string,
  sessionId: string,
  currentSessionTokenId?: string
) {
  const session = await prisma.userSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw new ApiException("Session not found", 404);
  }

  if (session.tokenId === currentSessionTokenId) {
    throw new ApiException("Cannot revoke the current session", 400);
  }

  await prisma.userSession.delete({ where: { id: sessionId } });
  return { message: "Session revoked" };
}

export async function revokeAllOtherSessions(
  userId: string,
  currentSessionTokenId?: string
) {
  await prisma.userSession.deleteMany({
    where: {
      userId,
      ...(currentSessionTokenId
        ? { tokenId: { not: currentSessionTokenId } }
        : {}),
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
  });

  return { message: "All other sessions revoked" };
}

export async function registerPatient(input: RegisterPatientInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existingUser) {
    throw new ApiException("Email already exists", 409);
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: input.clinicId },
  });
  if (!clinic) {
    throw new ApiException("Clinic not found", 404);
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: `${input.firstName} ${input.lastName}`,
        email: input.email,
        password: hashedPassword,
        role: Role.PATIENT,
        clinicId: clinic.id,
      },
    });

    // Check if patient record already exists (created by clinic before user registered)
    const existingPatientRecord = await tx.patient.findFirst({
      where: { email: input.email, clinicId: clinic.id },
    });

    let patientRecord;
    if (existingPatientRecord) {
      patientRecord = await tx.patient.update({
        where: { id: existingPatientRecord.id },
        data: { userId: user.id },
      });
    } else {
      patientRecord = await tx.patient.create({
        data: {
          userId: user.id,
          clinicId: clinic.id,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
        },
      });
    }

    return { user, patientRecord };
  });

  const { token } = await createVerificationToken(
    input.email,
    "email-verification",
    true // Generate OTP
  );
  await sendVerificationEmail(input.email, token);

  return {
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      clinicId: result.user.clinicId,
    },
    message: "Registration successful. Please verify your email.",
  };
}
