"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { executePasswordReset } from "@/actions/password-reset";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ap-bg px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mb-2 font-display text-xl font-semibold">Link inválido</div>
          <p className="mb-5 text-sm text-ap-muted">Este link no contiene un token de recuperación.</p>
          <Link href="/login" className="font-bold text-ap-primary">Volver al login</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const result = await executePasswordReset({ token: token!, password });
    setLoading(false);

    if (result.ok) {
      setSuccess(true);
    } else {
      setError(result.error ?? "Error al actualizar la contraseña.");
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ap-bg px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 animate-[spring_0.5s_ease-out] items-center justify-center rounded-[16px] border border-[#1E4636] bg-[#10231B]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="font-display text-[24px] font-semibold">¡Contraseña actualizada!</div>
          <p className="mt-2 text-[14px] text-ap-sub">Ya podés ingresar con tu nueva contraseña.</p>
          <Link
            href="/login"
            className="mt-6 inline-block w-full rounded-[14px] bg-ap-primary py-[15px] text-center text-[15px] font-bold text-white transition-colors hover:bg-ap-primary-dk"
          >
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-[13px] border-[1.5px] border-[#38383B] bg-[#1A1A1C] px-3.5 py-[13px] text-[15px] text-ap-text placeholder-[#4A4A4D] transition-all focus:border-ap-primary focus:outline-none focus:ring-[3px] focus:ring-[rgba(47,107,255,.18)]";

  return (
    <div className="flex min-h-screen items-center justify-center bg-ap-bg px-6">
      <div className="w-full max-w-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] border border-[#38383B] bg-[#1C1C1E]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ADADB0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <div className="mb-1 font-display text-[22px] font-semibold">Nueva contraseña</div>
        <p className="mb-5 text-[13px] leading-[1.55] text-ap-muted">
          Elegí una nueva contraseña para tu cuenta.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-ap-danger/30 bg-ap-danger/10 px-4 py-3 text-center text-sm text-ap-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
              Nueva contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
              Confirmar contraseña
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repetí la contraseña"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-[14px] bg-ap-primary py-[15px] text-[15px] font-bold text-white transition-colors hover:bg-ap-primary-dk disabled:opacity-50"
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-ap-bg">
        <div className="text-ap-muted">Cargando...</div>
      </div>
    }>
      <ResetForm />
    </Suspense>
  );
}
