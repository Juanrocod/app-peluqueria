export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import FormularioMarca from "@/components/admin/FormularioMarca";
import FormularioDescuento from "@/components/admin/FormularioDescuento";
import { PerfilMobile } from "@/components/mobile/config/PerfilMobile";

export default async function ConfiguracionPage() {
  const [configRows, codigoActivo] = await Promise.all([
    prisma.configuracionApp.findMany(),
    prisma.codigoDescuento.findFirst({ where: { activo: true } }),
  ]);

  const config = Object.fromEntries(configRows.map((r) => [r.clave, r.valor]));

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <PerfilMobile
          nombre={config.marca_nombre ?? ""}
          descripcion={config.marca_descripcion ?? ""}
          imagenUrl={config.marca_imagen_fondo ?? ""}
          telefono={config.marca_telefono ?? ""}
          direccion={config.marca_direccion ?? ""}
          codigoActivo={codigoActivo ? { codigo: codigoActivo.codigo, descuento: codigoActivo.descuento } : null}
        />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <div className="flex flex-col gap-8 max-w-2xl">
          <div>
            <h2 className="text-2xl font-bold mb-1">Configuración</h2>
            <p className="text-zinc-400 text-sm mb-6">Configurá la identidad de tu peluquería y los códigos de descuento.</p>
          </div>

          <section>
            <h3 className="font-semibold text-lg mb-3">Identidad de marca</h3>
            <FormularioMarca
              nombreInicial={config.marca_nombre ?? ""}
              descripcionInicial={config.marca_descripcion ?? ""}
              imagenUrlInicial={config.marca_imagen_fondo ?? ""}
            />
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3">Código de descuento semanal</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Podés generar un nuevo código de 5 caracteres cada semana y compartirlo con tus clientes.
              El código anterior se desactiva automáticamente.
            </p>
            <FormularioDescuento codigoActivo={codigoActivo} />
          </section>
        </div>
      </div>
    </>
  );
}
