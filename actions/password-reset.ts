"use server";

import { prisma } from "@/lib/prisma";
import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";
import { executeResetSchema } from "@/lib/validations";

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
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="display:inline-block;background:#131313;padding:10px 20px;border-radius:12px;">
                <span style="font-size:20px;font-weight:bold;color:#ffffff;">✂ BarberFras</span>
              </div>
            </div>
            <h2 style="color:#1a1a1a;font-size:22px;margin:0 0 12px;text-align:center;">Recuperá tu contraseña</h2>
            <p style="color:#555;font-size:15px;line-height:1.6;text-align:center;">Recibimos tu solicitud para restablecer la contraseña. Usá el siguiente link para crear una nueva:</p>
            <div style="background:#f0f4ff;border:1px solid #d0dbf0;border-radius:10px;padding:16px;margin:20px 0;word-break:break-all;text-align:center;">
              <span style="font-size:13px;color:#2F6BFF;font-weight:bold;">${resetUrl}</span>
            </div>
            <p style="color:#555;font-size:14px;line-height:1.6;text-align:center;">Copiá y pegá el link en tu navegador si no se abre automáticamente.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="color:#999;font-size:12px;text-align:center;">Este link expira en 1 hora. Si no pediste esto, ignorá este email.</p>
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
  const validated = executeResetSchema.parse(data);

  if (validated.password.length < 8) {
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const hashed = hashToken(validated.token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { hashedToken: hashed },
  });

  if (!record || record.expiresAt < new Date()) {
    if (record) {
      await prisma.passwordResetToken.delete({ where: { id: record.id } });
    }
    return { ok: false, error: "El link expiró o ya fue usado. Pedí uno nuevo." };
  }

  const passwordHash = await bcrypt.hash(validated.password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: passwordHash },
    }),
    prisma.passwordResetToken.delete({ where: { id: record.id } }),
  ]);

  return { ok: true };
}
