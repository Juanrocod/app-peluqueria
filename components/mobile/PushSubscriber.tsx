"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, X } from "lucide-react";

export function PushSubscriber() {
  const [status, setStatus] = useState<"loading" | "prompt" | "subscribed" | "denied" | "unsupported">("loading");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    if (Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setStatus(sub ? "subscribed" : "prompt");
        });
      });
      return;
    }
    setStatus("prompt");
  }, []);

  async function handleSubscribe() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      await fetch("/api/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      setStatus("subscribed");
    } catch {
      setStatus("denied");
    }
  }

  if (status === "loading" || status === "subscribed" || status === "unsupported" || dismissed) {
    return null;
  }

  if (status === "denied") {
    return null;
  }

  return (
    <div className="fixed bottom-[90px] left-4 right-4 z-40 flex items-center gap-3 rounded-2xl border border-ap-border-soft bg-ap-s1 px-4 py-3 shadow-lg md:hidden">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(47,107,255,.1)]">
        <Bell size={20} color="#2F6BFF" />
      </span>
      <div className="flex-1">
        <div className="text-[13px] font-bold text-ap-text">Activar notificaciones</div>
        <div className="text-[11px] text-ap-muted">Recibí alertas cuando alguien reserve un turno</div>
      </div>
      <button
        onClick={handleSubscribe}
        className="shrink-0 rounded-lg bg-ap-primary px-3 py-1.5 text-xs font-bold text-white"
      >
        Activar
      </button>
      <button onClick={() => setDismissed(true)} className="shrink-0 text-ap-muted">
        <X size={16} />
      </button>
    </div>
  );
}
