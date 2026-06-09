import { auth, signOut } from "@/lib/auth";
import { NavLink } from "@/components/admin/NavLink";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Sidebar */}
      <aside className="w-56 bg-zinc-900 dark:bg-zinc-950 text-zinc-100 flex flex-col border-r border-zinc-800/60">
        <div className="px-6 py-5 border-b border-zinc-800/60">
          <h1 className="font-semibold text-base tracking-tight text-zinc-100">Peluquería</h1>
          <p className="text-zinc-500 text-xs mt-1 truncate" title={session?.user?.email ?? undefined}>
            {session?.user?.email}
          </p>
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
        <div className="px-3 py-4 border-t border-zinc-800/60">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="w-full text-left text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40 px-3 py-2 rounded-md transition-all duration-200">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-6">{children}</main>
    </div>
  );
}
