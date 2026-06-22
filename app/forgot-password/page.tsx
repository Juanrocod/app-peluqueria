"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/password-reset";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await requestPasswordReset(email);
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ap-bg px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 animate-[spring_0.5s_ease-out] items-center justify-center rounded-[16px] border border-[#1E4636] bg-[#10231B]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="font-display text-[24px] font-semibold">¡Link enviado!</div>
          <p className="mt-2 text-[14px] leading-relaxed text-ap-sub">
            Si el email está registrado, se generó un link de recuperación. Revisá con el administrador.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block w-full rounded-[14px] border border-[#38383B] bg-[#262628] py-[13px] text-center text-sm font-semibold text-ap-sub transition-colors hover:bg-[#2E2E30]"
          >
            Volver al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ap-bg px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ap-sub transition-colors hover:text-ap-text"
        >
          &larr; Volver al login
        </Link>

        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] border border-[#38383B] bg-[#1C1C1E]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ADADB0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <div className="mb-1 font-display text-[22px] font-semibold">Recuperá tu acceso</div>
        <p className="mb-5 text-[13px] leading-[1.55] text-ap-muted">
          Ingresá tu email y se generará un link para crear una nueva contraseña.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-[13px] border-[1.5px] border-[#38383B] bg-[#1A1A1C] px-3.5 py-[13px] text-[15px] text-ap-text placeholder-[#4A4A4D] transition-all focus:border-ap-primary focus:outline-none focus:ring-[3px] focus:ring-[rgba(47,107,255,.18)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-[14px] bg-ap-primary py-[15px] text-[15px] font-bold text-white transition-colors hover:bg-ap-primary-dk disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar link de recuperación"}
          </button>
        </form>
      </div>
    </div>
  );
}
