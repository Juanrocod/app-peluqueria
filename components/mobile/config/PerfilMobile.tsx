"use client";

import { useRouter } from "next/navigation";
import { Settings, ChevronLeft } from "lucide-react";
import FormularioMarca from "@/components/admin/FormularioMarca";
import FormularioDescuento from "@/components/admin/FormularioDescuento";
import FormularioCambiarPassword from "@/components/admin/FormularioCambiarPassword";

interface PerfilMobileProps {
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  telefono: string;
  direccion: string;
  codigoActivo: { codigo: string; descuento: number } | null;
}

export function PerfilMobile({ nombre, descripcion, imagenUrl, telefono, direccion, codigoActivo }: PerfilMobileProps) {
  const router = useRouter();
  return (
    <div className="pb-20">
      <div className="mb-4 flex items-center gap-2.5 px-4">
        <button onClick={() => router.back()} className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-ap-border-soft bg-ap-s1">
          <ChevronLeft size={17} color="#ADADB0" />
        </button>
        <Settings size={19} color="#2F6BFF" />
        <span className="font-display text-[28px] font-bold">Configuración</span>
      </div>

      <div className="px-4">
        {/* Marca form — reuse existing component */}
        <div className="mb-6 rounded-2xl border border-ap-border-soft bg-ap-s1 p-4">
          <FormularioMarca
            nombreInicial={nombre}
            descripcionInicial={descripcion}
            imagenUrlInicial={imagenUrl}
            telefonoInicial={telefono}
            direccionInicial={direccion}
          />
        </div>

        {/* Cambiar contraseña */}
        <div className="mb-6 rounded-2xl border border-ap-border-soft bg-ap-s1 p-4">
          <h3 className="mb-3 text-sm font-semibold">Cambiar contraseña</h3>
          <FormularioCambiarPassword />
        </div>

        {/* Descuento — reuse existing component (user likes this UI) */}
        <div className="rounded-2xl border border-ap-border-soft bg-ap-s1 p-4">
          <h3 className="mb-3 text-sm font-semibold">Código de descuento semanal</h3>
          <p className="mb-3 text-xs text-ap-sub leading-relaxed">
            Podés generar un nuevo código de 5 caracteres cada semana y compartirlo con tus clientes.
          </p>
          <FormularioDescuento codigoActivo={codigoActivo ? { id: "", codigo: codigoActivo.codigo, descuento: codigoActivo.descuento } : null} />
        </div>
      </div>
    </div>
  );
}
