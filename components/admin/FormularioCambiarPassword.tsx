"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { cambiarPassword } from "@/actions/cambiar-password";

export default function FormularioCambiarPassword() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);

    if (nueva !== confirmar) {
      setMensaje({ ok: false, text: "Las contraseñas no coinciden." });
      return;
    }

    setGuardando(true);
    const res = await cambiarPassword({ actual, nueva });
    setGuardando(false);

    if (res.ok) {
      setMensaje({ ok: true, text: "¡Contraseña actualizada!" });
      setActual("");
      setNueva("");
      setConfirmar("");
      setTimeout(() => setMensaje(null), 3000);
    } else {
      setMensaje({ ok: false, text: res.error ?? "Error al cambiar contraseña." });
    }
  }

  const inputClass = "w-full bg-transparent text-sm font-semibold text-ap-text outline-none placeholder:text-[#4A4A4D]";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-3 border-b border-[#1E1E20] py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-ap-border-soft bg-[#1A1A1C]">
          <Lock size={16} color="#ADADB0" />
        </span>
        <div className="flex-1">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-ap-muted">Contraseña actual</div>
          <div className="flex items-center gap-2">
            <input
              type={showActual ? "text" : "password"}
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="Tu contraseña actual"
              required
              className={inputClass}
            />
            <button type="button" onClick={() => setShowActual(!showActual)} className="shrink-0 text-ap-muted">
              {showActual ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 border-b border-[#1E1E20] py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-ap-border-soft bg-[#1A1A1C]">
          <Lock size={16} color="#2F6BFF" />
        </span>
        <div className="flex-1">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-ap-muted">Contraseña nueva</div>
          <div className="flex items-center gap-2">
            <input
              type={showNueva ? "text" : "password"}
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              className={inputClass}
            />
            <button type="button" onClick={() => setShowNueva(!showNueva)} className="shrink-0 text-ap-muted">
              {showNueva ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-ap-border-soft bg-[#1A1A1C]">
          <Lock size={16} color="#2F6BFF" />
        </span>
        <div className="flex-1">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-ap-muted">Confirmar contraseña</div>
          <input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            placeholder="Repetí la nueva contraseña"
            required
            className={inputClass}
          />
        </div>
      </div>

      {mensaje && (
        <div className={`rounded-[10px] px-3 py-2.5 text-xs font-semibold ${mensaje.ok ? "border border-[rgba(34,211,102,.2)] bg-[rgba(34,211,102,.08)] text-[#22D366]" : "border border-[rgba(242,97,87,.2)] bg-[rgba(242,97,87,.08)] text-[#F26157]"}`}>
          {mensaje.text}
        </div>
      )}

      <button
        type="submit"
        disabled={guardando}
        className="w-full rounded-[13px] bg-ap-primary py-3 text-[14px] font-bold text-white transition-[filter] hover:brightness-110 disabled:opacity-50"
      >
        {guardando ? "Guardando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
}
