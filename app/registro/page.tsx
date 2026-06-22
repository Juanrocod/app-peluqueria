import { prisma } from "@/lib/prisma";
import Link from "next/link";
import RegistroForm from "./RegistroForm";

export const dynamic = "force-dynamic";

export default async function RegistroPage() {
  const adminExists = await prisma.user.findFirst({ where: { rol: "ADMIN" } });

  if (adminExists) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ap-bg px-6">
        <div className="w-full max-w-sm text-center">
          <div className="font-display text-[22px] font-semibold">Registro no disponible</div>
          <p className="mt-3 text-sm text-ap-muted">
            Ya existe una cuenta de administrador registrada.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-[14px] bg-ap-primary px-8 py-3 text-[15px] font-bold text-white"
          >
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  return <RegistroForm />;
}
