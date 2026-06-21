"use client";

import { Clock } from "lucide-react";

interface ProximoBannerProps {
  nombre: string;
  hora: string;
}

export function ProximoBanner({ nombre, hora }: ProximoBannerProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-[13px] border border-[#1D2E55] bg-[rgba(47,107,255,.08)] px-3.5 py-2.5">
      <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-[#16203A]">
        <Clock size={17} color="#2F6BFF" />
      </span>
      <div className="flex-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-ap-muted">
          Próximo turno
        </div>
        <div className="text-[13px] font-bold text-ap-text">
          {nombre} · {hora}
        </div>
      </div>
      <span className="rounded-lg bg-[rgba(34,211,102,.12)] px-2.5 py-1 font-mono-num text-[13px] font-bold text-[#34D399]">
        {hora}
      </span>
    </div>
  );
}
