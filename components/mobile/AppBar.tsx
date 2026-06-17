"use client";

import { useState } from "react";
import { Menu, Scissors, Plus } from "lucide-react";
import Link from "next/link";
import { ConfigDrawer } from "./ConfigDrawer";

export function MobileAppBar({ businessName }: { businessName: string }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

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
