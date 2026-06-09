import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function GananciasPage() {
  const turnos = await prisma.turno.findMany({
    where: { estado: "COMPLETADO" },
    include: {
      servicio: { select: { nombre: true, precio: true } },
      productos: {
        include: {
          producto: { select: { nombre: true, ganancia: true } },
        },
      },
    },
    orderBy: { fechaHora: "desc" },
  });

  type FilaTurno = {
    id: string;
    fechaHora: Date;
    clienteNombre: string;
    servicioNombre: string;
    precioServicio: number;
    productosNombres: string;
    gananciasProductos: number;
    totalGanancia: number;
  };

  const filas: FilaTurno[] = turnos.map((t) => {
    // Usar snapshot si existe, precio actual como fallback
    const precioServicio = Number(t.precioServicioFinal ?? t.servicio.precio);
    const nombreServicio = t.nombreServicioFinal ?? t.servicio.nombre;

    const gananciasProductos = t.productos.reduce((acc, tp) => {
      // Prioridad: gananciaFinal (snapshot) → ganancia actual del producto
      const g = tp.gananciaFinal ?? tp.producto.ganancia;
      return acc + (g ? Number(g) : 0);
    }, 0);

    const productosNombres = t.productos
      .map((tp) => tp.nombreProductoFinal ?? tp.producto.nombre)
      .join(", ");

    return {
      id: t.id,
      fechaHora: t.fechaHora,
      clienteNombre: t.clienteNombre,
      servicioNombre: nombreServicio,
      precioServicio,
      productosNombres,
      gananciasProductos,
      totalGanancia: precioServicio + gananciasProductos,
    };
  });

  // Agrupar por año-mes
  type MesData = {
    label: string;
    key: string;
    filas: FilaTurno[];
    totalServicio: number;
    totalProductos: number;
    total: number;
  };

  const meses = new Map<string, MesData>();
  for (const f of filas) {
    const key = format(f.fechaHora, "yyyy-MM");
    const label = format(f.fechaHora, "MMMM yyyy", { locale: es });
    if (!meses.has(key)) {
      meses.set(key, { key, label, filas: [], totalServicio: 0, totalProductos: 0, total: 0 });
    }
    const mes = meses.get(key)!;
    mes.filas.push(f);
    mes.totalServicio += f.precioServicio;
    mes.totalProductos += f.gananciasProductos;
    mes.total += f.totalGanancia;
  }

  const mesesOrdenados = Array.from(meses.values());
  const totalGeneral = mesesOrdenados.reduce((acc, m) => acc + m.total, 0);
  const totalServiciosGeneral = mesesOrdenados.reduce((acc, m) => acc + m.totalServicio, 0);
  const totalProductosGeneral = mesesOrdenados.reduce((acc, m) => acc + m.totalProductos, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Ganancias</h2>
        {filas.length > 0 && (
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total histórico</div>
            <div className="text-2xl font-bold text-green-600">${totalGeneral.toLocaleString("es-AR")}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              Servicios ${totalServiciosGeneral.toLocaleString("es-AR")}
              {totalProductosGeneral > 0 && <> + Productos ${totalProductosGeneral.toLocaleString("es-AR")}</>}
            </div>
          </div>
        )}
      </div>

      {filas.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
          <p>No hay turnos completados todavía.</p>
          <p className="text-sm mt-1">Marcá turnos como completados desde la pestaña Turnos.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {mesesOrdenados.map((mes) => (
            <div key={mes.key} className="bg-white rounded-xl border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b">
                <div>
                  <h3 className="font-semibold capitalize">{mes.label}</h3>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {mes.filas.length} turno{mes.filas.length !== 1 ? "s" : ""}
                    {" · "}Servicios ${mes.totalServicio.toLocaleString("es-AR")}
                    {mes.totalProductos > 0 && <> + Productos ${mes.totalProductos.toLocaleString("es-AR")}</>}
                  </div>
                </div>
                <span className="text-lg font-bold text-green-600">${mes.total.toLocaleString("es-AR")}</span>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-gray-400 uppercase tracking-wide">
                    <th className="text-left px-5 py-2 font-medium">Fecha</th>
                    <th className="text-left px-5 py-2 font-medium">Cliente</th>
                    <th className="text-left px-5 py-2 font-medium">Servicio</th>
                    <th className="text-left px-5 py-2 font-medium">Productos</th>
                    <th className="text-right px-5 py-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {mes.filas.map((f, i) => (
                    <tr key={f.id} className={`border-b last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                      <td className="px-5 py-2.5 text-gray-500 whitespace-nowrap">
                        {format(f.fechaHora, "d MMM", { locale: es })}
                        <span className="ml-1 text-gray-400 text-xs">{format(f.fechaHora, "HH:mm")}</span>
                      </td>
                      <td className="px-5 py-2.5 font-medium">{f.clienteNombre}</td>
                      <td className="px-5 py-2.5 text-gray-600">
                        {f.servicioNombre}
                        <span className="ml-2 text-green-700 font-medium">${f.precioServicio.toLocaleString("es-AR")}</span>
                      </td>
                      <td className="px-5 py-2.5 text-xs text-gray-500">
                        {f.productosNombres ? (
                          <>
                            {f.productosNombres}
                            {f.gananciasProductos > 0 && (
                              <span className="ml-2 text-green-700 font-medium text-sm">
                                +${f.gananciasProductos.toLocaleString("es-AR")}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-2.5 text-right font-bold text-green-700 whitespace-nowrap">
                        ${f.totalGanancia.toLocaleString("es-AR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-green-50">
                    <td colSpan={4} className="px-5 py-2.5 text-sm font-medium text-gray-600">
                      Subtotal {mes.label}
                    </td>
                    <td className="px-5 py-2.5 text-right font-bold text-green-700">
                      ${mes.total.toLocaleString("es-AR")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
