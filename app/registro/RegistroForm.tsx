"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registrarPeluquero } from "@/actions/auth";

export default function RegistroForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }
    const result = await registrarPeluquero({
      nombreNegocio: fd.get("nombreNegocio") as string,
      nombre: fd.get("nombre") as string,
      email: fd.get("email") as string,
      password,
    });
    setLoading(false);
    if (result.ok) {
      router.push("/login");
    } else {
      setError(result.error ?? "Error al registrar.");
    }
  }

  const inputClass =
    "w-full rounded-[13px] border-[1.5px] border-[#38383B] bg-[#1A1A1C] px-3.5 py-[13px] text-[15px] text-ap-text placeholder-[#4A4A4D] transition-all focus:border-ap-primary focus:outline-none focus:ring-[3px] focus:ring-[rgba(47,107,255,.18)]";

  return (
    <div className="flex min-h-screen items-center justify-center bg-ap-bg px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ap-sub transition-colors hover:text-ap-text"
        >
          &larr; Volver
        </Link>

        <div className="mb-5">
          <div className="font-display text-[22px] font-semibold">Creá tu cuenta</div>
          <div className="mt-1 text-[13px] text-ap-muted">
            Empezá a gestionar tus turnos hoy.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
              Nombre de la peluquería
            </label>
            <input name="nombreNegocio" type="text" required placeholder="Ej: BarberFras" className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
              Tu nombre
            </label>
            <input name="nombre" type="text" required placeholder="Ej: Facundo" className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
              Email
            </label>
            <input name="email" type="email" required placeholder="tu@email.com" className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
              Contraseña
            </label>
            <input name="password" type="password" required placeholder="Mínimo 8 caracteres" className={inputClass} />
          </div>

          {error && <p className="text-sm text-ap-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-[14px] bg-ap-primary py-[15px] text-[15px] font-bold text-white transition-colors hover:bg-ap-primary-dk disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm">
          <span className="text-ap-muted">¿Ya tenés cuenta? </span>
          <Link href="/login" className="font-bold text-ap-primary">Ingresá</Link>
        </div>
      </div>
    </div>
  );
}
