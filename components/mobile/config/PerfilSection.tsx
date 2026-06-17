"use client";

import { useState } from "react";
import { ChevronLeft, Image, User, Tag, Phone, MapPin, Copy, Settings } from "lucide-react";

interface PerfilSectionProps {
  onBack: () => void;
}

export function PerfilSection({ onBack }: PerfilSectionProps) {
  const [code, setCode] = useState<string | null>(null);

  function generateCode() {
    const words = ["FRAS", "CORTE", "BIENVE", "VIP", "PROMO"];
    const nums = Math.floor(Math.random() * 90 + 10);
    setCode(words[Math.floor(Math.random() * words.length)] + nums);
  }

  const infoRow = (Icon: typeof User, label: string, value: string, color: string) => (
    <div className="flex items-center gap-3 border-b border-[#1A1A1C] px-4 py-3">
      <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-ap-border-soft bg-ap-s1">
        <Icon size={16} color={color} />
      </span>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-ap-muted">{label}</div>
        <div className="mt-0.5 text-sm font-semibold text-ap-text">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-[#1A1A1C] px-4 py-3">
        <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-ap-border-soft bg-ap-s1">
          <ChevronLeft size={16} color="#ADADB0" />
        </button>
        <Settings size={19} color="#2F6BFF" />
        <span className="font-display text-xl font-semibold">Configuración</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Photo upload placeholder */}
        <div className="mx-4 mt-3.5 cursor-pointer rounded-2xl border-[1.5px] border-dashed border-[#38383B] px-5 py-5 text-center" style={{ background: "linear-gradient(135deg, #1A1A1C, #232325)" }}>
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-[#2A2A2C]">
            <Image size={22} color="#6F6F73" />
          </div>
          <div className="text-[13px] font-semibold text-ap-sub">Foto de portada</div>
          <div className="mt-0.5 text-[11px] text-ap-muted">La ven los clientes al entrar · 1080×720</div>
        </div>

        {/* Data rows */}
        <div className="mt-3">
          {infoRow(User, "NOMBRE DEL NEGOCIO", "BarberFras", "#2F6BFF")}
          {infoRow(Tag, "SLOGAN / DESCRIPCIÓN", "Tu mejor corte, siempre.", "#B79CFF")}
          {infoRow(Phone, "TELÉFONO", "11 2345 6789", "#34D399")}
          {infoRow(MapPin, "DIRECCIÓN", "Av. Corrientes 1234, CABA", "#E8A33D")}
        </div>

        {/* Discount code */}
        <div className="mx-4 mt-4 rounded-2xl border border-ap-border-soft bg-ap-s1 p-3.5">
          <div className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-ap-muted">Código de descuento</div>
          {code ? (
            <>
              <div className="mb-2.5 flex items-center gap-2 rounded-[11px] border border-[#1B3D28] bg-[rgba(34,211,102,.08)] px-3.5 py-2.5">
                <span className="flex-1 font-mono-num text-lg font-extrabold tracking-wide text-[#22D366]">{code}</span>
                <button onClick={() => navigator.clipboard?.writeText(code)} className="flex">
                  <Copy size={17} color="#22D366" />
                </button>
              </div>
              <button onClick={generateCode} className="w-full rounded-[10px] border border-ap-border-soft bg-[#232325] py-2.5 text-[13px] font-semibold text-ap-sub">
                Generar otro
              </button>
            </>
          ) : (
            <button onClick={generateCode} className="w-full rounded-[11px] bg-[#22D366] py-3 text-sm font-bold text-[#08130D]">
              Generar código
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
