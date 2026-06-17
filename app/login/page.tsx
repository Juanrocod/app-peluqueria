import { signIn } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    "use server";
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ap-bg px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3.5 flex h-[58px] w-[58px] items-center justify-center rounded-[18px] border-[1.5px] border-[#233556] bg-[#16203A]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2F6BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <path d="M20 4 8.12 15.88" />
              <path d="M14.47 14.48 20 20" />
              <path d="M8.12 8.12 12 12" />
            </svg>
          </div>
          <div className="font-display text-[26px] font-semibold tracking-tight">BarberFras</div>
          <div className="mt-1 text-[13px] text-ap-muted">Bienvenido de vuelta</div>
        </div>

        {/* Form */}
        <form action={handleLogin} className="flex flex-col gap-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="tu@email.com"
              className="w-full rounded-[13px] border-[1.5px] border-[#38383B] bg-[#1A1A1C] px-3.5 py-[13px] text-[15px] text-ap-text placeholder-[#4A4A4D] transition-all focus:border-ap-primary focus:outline-none focus:ring-[3px] focus:ring-[rgba(47,107,255,.18)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-[13px] border-[1.5px] border-[#38383B] bg-[#1A1A1C] px-3.5 py-[13px] text-[15px] text-ap-text placeholder-[#4A4A4D] transition-all focus:border-ap-primary focus:outline-none focus:ring-[3px] focus:ring-[rgba(47,107,255,.18)]"
            />
          </div>

          <Link
            href="#"
            className="-mt-1 self-end text-[13px] font-semibold text-ap-primary"
          >
            ¿Olvidaste tu contraseña?
          </Link>

          <button
            type="submit"
            className="mt-1 w-full rounded-[14px] bg-ap-primary py-[15px] text-[15px] font-bold text-white transition-colors hover:bg-ap-primary-dk"
          >
            Ingresar
          </button>
        </form>

        {/* Register link */}
        <div className="mt-7 text-center text-sm">
          <span className="text-ap-muted">¿No tenés cuenta? </span>
          <Link href="/registro" className="font-bold text-ap-primary">
            Registrate
          </Link>
        </div>
      </div>
    </div>
  );
}
