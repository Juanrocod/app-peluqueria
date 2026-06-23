"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelarTurnoPorCliente } from "@/actions/cancelar-turno";

export default function CancelButton({ token }: { token: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleCancel() {
    setLoading(true);
    setError("");
    try {
      const result = await cancelarTurnoPorCliente(token);
      if (result.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setError(result.error || "Error al cancelar el turno.");
        setConfirming(false);
      }
    } catch {
      setError("Error al cancelar el turno. Intentá de nuevo.");
      setConfirming(false);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div
        className="flex items-center justify-center gap-2 rounded-xl border px-3.5 py-3.5"
        style={{ borderColor: "rgba(34,211,102,.3)", background: "rgba(34,211,102,.08)" }}
      >
        <span className="text-sm font-semibold" style={{ color: "#22D366" }}>
          Turno cancelado correctamente
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div
          className="flex items-center justify-center gap-2 rounded-xl border px-3.5 py-3"
          style={{ borderColor: "rgba(242,97,87,.3)", background: "rgba(242,97,87,.08)" }}
        >
          <span className="text-sm font-semibold" style={{ color: "#F26157" }}>{error}</span>
        </div>
        <button
          onClick={() => { setError(""); setConfirming(false); }}
          className="w-full rounded-[13px] border py-3 text-sm font-semibold text-white"
          style={{ borderColor: "#2A3A5E", background: "#1A2742" }}
        >
          Volver
        </button>
      </div>
    );
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="w-full rounded-[14px] py-[15px] text-[15px] font-bold text-white transition-all"
        style={{ background: "#DC2626" }}
      >
        Cancelar turno
      </button>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="rounded-xl border px-3.5 py-3 text-center" style={{ borderColor: "rgba(232,163,61,.3)", background: "rgba(232,163,61,.08)" }}>
        <span className="text-sm font-semibold" style={{ color: "#E8A33D" }}>
          &iquest;Seguro que quer&eacute;s cancelar?
        </span>
      </div>
      <div className="flex gap-2.5">
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="flex-1 rounded-[13px] border py-3.5 text-sm font-semibold text-white transition-all"
          style={{ borderColor: "#2A3A5E", background: "#1A2742" }}
        >
          No, volver
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex-1 rounded-[13px] py-3.5 text-sm font-bold text-white transition-all disabled:opacity-60"
          style={{ background: "#DC2626" }}
        >
          {loading ? "Cancelando..." : "Si, cancelar"}
        </button>
      </div>
    </div>
  );
}
