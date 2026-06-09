import { auth, signOut } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-gray-700">
          <h1 className="font-bold text-lg">Peluquería</h1>
          <p className="text-gray-400 text-xs mt-1">{session?.user?.email}</p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <NavLink href="/admin">Agenda</NavLink>
          <NavLink href="/admin/turnos">Turnos</NavLink>
          <NavLink href="/admin/servicios">Servicios</NavLink>
          <NavLink href="/admin/peluqueros">Peluqueros</NavLink>
          <NavLink href="/admin/horarios">Horarios</NavLink>
          <NavLink href="/admin/catalogo">Catálogo</NavLink>
          <NavLink href="/admin/ganancias">Ganancias</NavLink>
          <NavLink href="/admin/configuracion">Configuración</NavLink>
        </nav>
        <div className="px-3 py-4 border-t border-gray-700">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="w-full text-left text-sm text-gray-400 hover:text-white px-3 py-2 rounded transition">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
    >
      {children}
    </Link>
  );
}
