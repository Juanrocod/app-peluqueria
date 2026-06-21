"use server";

import { prisma } from "@/lib/prisma";
import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(email: string): Promise<{ ok: true }> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const rawToken = randomBytes(32).toString("hex");
    const hashed = hashToken(rawToken);

    await prisma.passwordResetToken.create({
      data: {
        hashedToken: hashed,
        userId: user.id,
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL || "http://localhost:3000";
    console.log(`[RESET] ${baseUrl}/reset-password?token=${rawToken}`);
  }

  return { ok: true };
}

export async function executePasswordReset(data: {
  token: string;
  password: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (data.password.length < 8) {
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const hashed = hashToken(data.token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { hashedToken: hashed },
  });

  if (!record || record.expiresAt < new Date()) {
    if (record) {
      await prisma.passwordResetToken.delete({ where: { id: record.id } });
    }
    return { ok: false, error: "El link expiró o ya fue usado. Pedí uno nuevo." };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: passwordHash },
    }),
    prisma.passwordResetToken.delete({ where: { id: record.id } }),
  ]);

  return { ok: true };
}
