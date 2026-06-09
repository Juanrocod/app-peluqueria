import { prisma } from "@/lib/prisma";
import FormularioReserva from "@/components/booking/FormularioReserva";

export default async function ReservarPage() {
  const [servicios, productos, configRows] = await Promise.all([
    prisma.servicio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.producto.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.configuracionApp.findMany(),
  ]);

  const config = Object.fromEntries(configRows.map((r) => [r.clave, r.valor]));

  const marcaNombre = config.marca_nombre || "Tu Peluquería";
  const marcaDescripcion = config.marca_descripcion || "Reservá tu turno de forma rápida y sencilla.";
  const imagenFondo = config.marca_imagen_fondo || "";
  const marcaTelefono = config.marca_telefono || "";
  const marcaDireccion = config.marca_direccion || "";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50">
      {/* Hero */}
      <div
        className="relative flex flex-col items-center justify-center text-center px-6 py-24 min-h-[400px] border-b border-zinc-900"
        style={
          imagenFondo
            ? { backgroundImage: `url(${imagenFondo})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: "radial-gradient(circle at top, #27272a 0%, #09090b 100%)" }
        }
      >
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        <div className="relative z-10 max-w-xl flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
            {marcaNombre}
          </h1>
          <p className="text-zinc-300 mt-4 text-base sm:text-lg leading-relaxed max-w-md">
            {marcaDescripcion}
          </p>
          <a
            href="#reservar"
            className="mt-8 inline-flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-6 py-3 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.25)] transition-all duration-200 text-sm tracking-wide"
          >
            Reservar turno
          </a>
        </div>
      </div>

      {/* Formulario */}
      <div id="reservar" className="flex-1 flex items-start justify-center px-4 py-16 bg-zinc-950">
        <div className="w-full max-w-lg">
          <FormularioReserva
            servicios={servicios.map((s) => ({ id: s.id, nombre: s.nombre, duracion: s.duracion, precio: Number(s.precio) }))}
            productos={productos.map((p) => ({ id: p.id, nombre: p.nombre, descripcion: p.descripcion ?? "", precio: Number(p.precio), imagenUrl: p.imagenUrl ?? "" }))}
            marcaNombre={marcaNombre}
            marcaTelefono={marcaTelefono || undefined}
            marcaDireccion={marcaDireccion || undefined}
          />
        </div>
      </div>
    </div>
  );
}
