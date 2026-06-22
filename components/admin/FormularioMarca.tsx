"use client";

import { useState } from "react";
import { User, Tag, Phone, MapPin, Image } from "lucide-react";
import { setConfiguracion } from "@/actions/configuracion";

export default function FormularioMarca({
  nombreInicial,
  descripcionInicial,
  imagenUrlInicial,
  telefonoInicial = "",
  direccionInicial = "",
}: {
  nombreInicial: string;
  descripcionInicial: string;
  imagenUrlInicial: string;
  telefonoInicial?: string;
  direccionInicial?: string;
}) {
  const [nombre, setNombre] = useState(nombreInicial);
  const [descripcion, setDescripcion] = useState(descripcionInicial);
  const [imagenUrl, setImagenUrl] = useState(imagenUrlInicial);
  const [telefono, setTelefono] = useState(telefonoInicial);
  const [direccion, setDireccion] = useState(direccionInicial);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    await setConfiguracion("marca_nombre", nombre);
    await setConfiguracion("marca_descripcion", descripcion);
    await setConfiguracion("marca_imagen_fondo", imagenUrl);
    await setConfiguracion("marca_telefono", telefono);
    await setConfiguracion("marca_direccion", direccion);
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  const fieldRow = (Icon: typeof User, label: string, value: string, onChange: (v: string) => void, placeholder: string) => (
    <div className="flex gap-3 border-b border-[#1E1E20] py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-ap-border-soft bg-[#1A1A1C]">
        <Icon size={16} color="#ADADB0" />
      </span>
      <div className="flex-1">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-ap-muted">{label}</div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-semibold text-ap-text outline-none placeholder:text-[#4A4A4D]"
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-0">
      {/* Image placeholder */}
      <div className="mb-3 flex flex-col items-center rounded-xl border border-dashed border-[#38383B] bg-[#1A1A1C] px-4 py-5">
        {imagenUrl ? (
          <div className="mb-2 h-24 w-full overflow-hidden rounded-lg">
            <img src={imagenUrl} alt="Portada" className="h-full w-full object-cover" />
          </div>
        ) : (
          <Image size={28} color="#6F6F73" className="mb-2" />
        )}
        <div className="text-[13px] font-semibold text-ap-sub">Foto de portada</div>
        <div className="text-[11px] text-ap-muted">La ven los clientes al entrar · 1080×720</div>
        <input
          value={imagenUrl}
          onChange={(e) => setImagenUrl(e.target.value)}
          placeholder="https://... URL de imagen"
          className="mt-2 w-full rounded-[10px] border border-ap-border-soft bg-[#232325] px-3 py-2 text-xs text-ap-text outline-none placeholder:text-[#4A4A4D] focus:border-ap-primary"
        />
      </div>

      {fieldRow(User, "Nombre del negocio", nombre, setNombre, "Ej: BarberFras")}
      {fieldRow(Tag, "Slogan / Descripción", descripcion, setDescripcion, "Tu mejor corte, siempre.")}
      {fieldRow(Phone, "Teléfono", telefono, setTelefono, "11 2345 6789")}
      {fieldRow(MapPin, "Dirección", direccion, setDireccion, "Av. Corrientes 1234, CABA")}

      <button
        type="submit"
        disabled={guardando}
        className="mt-4 w-full rounded-[13px] bg-ap-primary py-3 text-[14px] font-bold text-white transition-[filter] hover:brightness-110 disabled:opacity-50"
      >
        {guardado ? "¡Guardado!" : guardando ? "Guardando..." : "Guardar configuración"}
      </button>
    </form>
  );
}
