"use client";

import { Settings, Image, User, Tag, Phone, MapPin } from "lucide-react";
import FormularioMarca from "@/components/admin/FormularioMarca";
import FormularioDescuento from "@/components/admin/FormularioDescuento";

interface PerfilMobileProps {
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  codigoActivo: { codigo: string; descuento: number } | null;
}

export function PerfilMobile({ nombre, descripcion, imagenUrl, codigoActivo }: PerfilMobileProps) {
  return (
    <div className="pb-20">
      <div className="mb-4 flex items-center gap-2.5 px-4">
        <Settings size={19} color="#2F6BFF" />
        <span className="font-display text-xl font-semibold">Configuración</span>
      </div>

      <div className="px-4">
        {/* Marca form — reuse existing component */}
        <div className="mb-6 rounded-2xl border border-ap-border-soft bg-ap-s1 p-4">
          <FormularioMarca
            nombreInicial={nombre}
            descripcionInicial={descripcion}
            imagenUrlInicial={imagenUrl}
          />
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
