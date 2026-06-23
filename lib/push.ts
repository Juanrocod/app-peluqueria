import webpush from "web-push";
import { prisma } from "@/lib/prisma";

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:noreply@barberfras.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

export async function sendPushToAll(title: string, body: string, url?: string) {
  if (!process.env.VAPID_PRIVATE_KEY) return;

  const subs = await prisma.pushSubscription.findMany();

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({ title, body, url: url ?? "/admin/turnos" }),
      );
    } catch (err: unknown) {
      if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      }
    }
  }
}
