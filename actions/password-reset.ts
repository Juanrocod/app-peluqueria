"use server";

import { prisma } from "@/lib/prisma";
import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(email: string): Promise<{ ok: true }> {
  try {
    const { resetLimiter } = await import("@/lib/rate-limit");
    const { success } = await resetLimiter.limit(email);
    if (!success) return { ok: true };
  } catch {}

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
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM || "BarberFras <onboarding@resend.dev>",
        to: email,
        subject: "Recuperá tu contraseña",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
            <h2 style="color:#1a1a1a;">Recuperar contraseña</h2>
            <p style="color:#555;line-height:1.6;">Recibimos tu solicitud para restablecer la contraseña. Hacé click en el botón para crear una nueva:</p>
            <a href="${resetUrl}" style="display:inline-block;background:#2F6BFF;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Restablecer contraseña</a>
            <p style="color:#999;font-size:13px;margin-top:24px;">Este link expira en 1 hora. Si no pediste esto, ignorá este email.</p>
          </div>
        `,
      });
    } else if (process.env.NODE_ENV !== "production") {
      console.log(`[RESET] ${resetUrl}`);
    }
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
