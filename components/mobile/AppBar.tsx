"use client";

import { useState } from "react";
import { Menu, Scissors, Plus, Share2 } from "lucide-react";
import Link from "next/link";
import { ConfigDrawer } from "./ConfigDrawer";

export function MobileAppBar({ businessName }: { businessName: string }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/reservar`;
    const shareData = {
      title: businessName,
      text: `Reservá tu turno en ${businessName}`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2 md:hidden">
        <button onClick={() => setDrawerOpen(true)} className="flex">
          <Menu size={22} color="#ADADB0" />
        </button>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-ap-border bg-ap-s1">
          <Scissors size={15} color="#2F6BFF" />
        </span>
        <span className="flex-1 truncate font-display text-base font-semibold">
          {businessName}
        </span>
        <button
          onClick={handleShare}
          className="flex items-center justify-center rounded-[10px] border border-ap-border bg-ap-s1 p-1.5"
          title={copied ? "Link copiado" : "Compartir link de reservas"}
        >
          <Share2 size={17} color={copied ? "#22D366" : "#ADADB0"} />
        </button>
        <Link
          href="/admin/turnos/nuevo"
          className="flex items-center gap-1.5 rounded-[10px] bg-ap-primary px-3 py-1.5 text-xs font-bold text-white"
        >
          <Plus size={15} />
          Turno
        </Link>
      </div>

      <ConfigDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} businessName={businessName} />
    </>
  );
}
