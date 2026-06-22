import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import FormularioReserva from "@/components/booking/FormularioReserva";
import { BookingForm } from "@/components/mobile/booking/BookingForm";

export async function generateMetadata(): Promise<Metadata> {
  const { prisma } = await import("@/lib/prisma");
  const config = await prisma.configuracionApp.findMany();
  const configMap = Object.fromEntries(config.map((r) => [r.clave, r.valor]));
  const nombre = configMap.marca_nombre || "Tu Peluquería";
  const descripcion = configMap.marca_descripcion || "Reservá tu turno de forma rápida y sencilla.";

  return {
    title: `Reservar turno | ${nombre}`,
    description: descripcion,
    openGraph: {
      title: `Reservar turno | ${nombre}`,
      description: descripcion,
      type: "website",
    },
  };
}

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

  const serializedServicios = servicios.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    duracion: s.duracion,
    precio: Number(s.precio),
  }));

  return (
    <>
      {/* Mobile booking wizard */}
      <div className="md:hidden">
        <BookingForm
          servicios={serializedServicios}
          productos={productos.map((p) => ({ id: p.id, nombre: p.nombre, precio: Number(p.precio), imagenUrl: p.imagenUrl ?? "" }))}
        />
      </div>

      {/* Desktop booking (existing) */}
      <div className="hidden md:block">
        <div className="min-h-screen flex flex-col">
          {/* Hero */}
          <div
            className="relative flex flex-col items-center justify-center text-center px-6 py-20 min-h-[420px]"
            style={
              imagenFondo
                ? { backgroundImage: `url(${imagenFondo})`, backgroundSize: "cover", backgroundPosition: "center" }
                : { background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }
            }
          >
            {/* Overlay oscuro */}
            <div className="absolute inset-0 bg-black/55" />
            <div className="relative z-10 max-w-xl">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
                {marcaNombre}
              </h1>
              <p className="text-white/80 mt-4 text-lg leading-relaxed">{marcaDescripcion}</p>
              <a
                href="#reservar"
                className="mt-8 inline-block bg-white text-gray-900 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition text-base"
              >
                Reservar turno
              </a>
            </div>
          </div>

          {/* Formulario */}
          <div id="reservar" className="flex-1 flex items-start justify-center px-4 py-12 bg-gray-50">
            <div className="w-full max-w-lg">
              <FormularioReserva
                servicios={serializedServicios}
                productos={productos.map((p) => ({ id: p.id, nombre: p.nombre, descripcion: p.descripcion ?? "", precio: Number(p.precio), imagenUrl: p.imagenUrl ?? "" }))}
                marcaNombre={marcaNombre}
                marcaTelefono={marcaTelefono || undefined}
                marcaDireccion={marcaDireccion || undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
