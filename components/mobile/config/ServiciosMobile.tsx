"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Scissors, Edit, ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface Servicio {
  id: string;
  nombre: string;
  duracion: number;
  precio: number;
}

const COLORS = ["#22D366", "#2F6BFF", "#B79CFF", "#E8A33D", "#F26157", "#6F6F73"];

export function ServiciosMobile({ servicios }: { servicios: Servicio[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const money = (n: number) => "$" + n.toLocaleString("es-AR");

  async function handleSave(form: FormData, id: string) {
    const { actualizarServicio } = await import("@/actions/servicios");
    startTransition(async () => {
      await actualizarServicio(id, {
        nombre: form.get("nombre") as string,
        duracion: Number(form.get("duracion")),
        precio: Number(form.get("precio")),
      });
      setEditingId(null);
      router.refresh();
    });
  }

  async function handleAdd(form: FormData) {
    const { crearServicio } = await import("@/actions/servicios");
    startTransition(async () => {
      await crearServicio({
        nombre: form.get("nombre") as string,
        duracion: Number(form.get("duracion")),
        precio: Number(form.get("precio")),
      });
      setShowAdd(false);
      router.refresh();
    });
  }

  async function handleDelete(id: string) {
    const { eliminarServicio } = await import("@/actions/servicios");
    startTransition(async () => {
      await eliminarServicio(id);
      setEditingId(null);
      router.refresh();
    });
  }

  return (
    <div className="pb-20">
      <div className="mb-4 flex items-center gap-2.5 px-4">
        <button onClick={() => router.back()} className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-ap-border-soft bg-ap-s1">
          <ChevronLeft size={17} color="#ADADB0" />
        </button>
        <Scissors size={19} color="#B79CFF" />
        <span className="font-display text-[28px] font-bold">Servicios</span>
      </div>

      <div className="px-4">
        {/* Add form */}
        {showAdd && (
          <form
            onSubmit={(e) => { e.preventDefault(); handleAdd(new FormData(e.currentTarget)); }}
            className="mb-3 rounded-2xl border border-[rgba(47,107,255,.35)] bg-ap-s1 p-3.5"
          >
            <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ap-primary">+ Nuevo servicio</div>
            <input name="nombre" placeholder="Ej: Corte + diseño" required className="mb-2 w-full rounded-[10px] border border-ap-border-soft bg-[#232325] px-3 py-2.5 text-sm text-ap-text outline-none placeholder-ap-muted focus:border-ap-primary" />
            <div className="mb-3 grid grid-cols-2 gap-2">
              <input name="precio" type="number" placeholder="Precio" required className="rounded-[10px] border border-ap-border-soft bg-[#232325] px-3 py-2.5 font-mono-num text-sm text-ap-text outline-none placeholder-ap-muted focus:border-ap-primary" />
              <input name="duracion" type="number" placeholder="Min" required className="rounded-[10px] border border-ap-border-soft bg-[#232325] px-3 py-2.5 font-mono-num text-sm text-ap-text outline-none placeholder-ap-muted focus:border-ap-primary" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-[10px] border border-ap-border-soft py-2.5 text-[13px] font-semibold text-ap-sub">Cancelar</button>
              <button type="submit" disabled={isPending} className="flex-[2] rounded-[10px] bg-[#22D366] py-2.5 text-[13px] font-bold text-[#08130D] disabled:opacity-50">✓ Guardar</button>
            </div>
          </form>
        )}

        {/* Service list */}
        {servicios.map((svc, i) => {
          const color = COLORS[i % COLORS.length];
          const isEditing = editingId === svc.id;
          return (
            <div
              key={svc.id}
              className="mb-2.5 overflow-hidden rounded-[14px] border bg-ap-s1"
              style={{ borderColor: isEditing ? `${color}55` : "#2A2A2C", borderLeft: `3px solid ${color}` }}
            >
              <button
                onClick={() => setEditingId(isEditing ? null : svc.id)}
                className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-[#232325]"
              >
                <div className="flex-1">
                  <div className="text-sm font-bold">{svc.nombre}</div>
                  <div className="mt-0.5 font-mono-num text-xs text-ap-sub">{svc.duracion} min · {money(svc.precio)}</div>
                </div>
                {isEditing ? <ChevronRight size={16} color="#6F6F73" className="rotate-90" /> : <Edit size={16} color="#6F6F73" />}
              </button>

              {isEditing && (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSave(new FormData(e.currentTarget), svc.id); }}
                  className="flex flex-col gap-2.5 border-t border-[#1E1E20] bg-[#161618] px-3.5 py-3"
                >
                  <input name="nombre" defaultValue={svc.nombre} className="w-full rounded-[10px] border border-ap-border-soft bg-ap-s1 px-3 py-2 text-sm font-bold text-ap-text outline-none focus:border-ap-primary" />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-ap-muted">Precio</div>
                      <input name="precio" type="number" defaultValue={svc.precio} className="w-full rounded-[10px] border border-ap-border-soft bg-ap-s1 px-3 py-2 font-mono-num text-sm font-bold text-ap-text outline-none focus:border-ap-primary" />
                    </div>
                    <div>
                      <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-ap-muted">Duración</div>
                      <input name="duracion" type="number" defaultValue={svc.duracion} className="w-full rounded-[10px] border border-ap-border-soft bg-ap-s1 px-3 py-2 font-mono-num text-sm font-bold text-ap-text outline-none focus:border-ap-primary" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleDelete(svc.id)} className="rounded-[9px] border border-[rgba(242,97,87,.35)] px-3 py-2 text-xs font-semibold text-ap-danger">Eliminar</button>
                    <button type="submit" disabled={isPending} className="flex-1 rounded-[9px] bg-[#22D366] py-2 text-[13px] font-bold text-[#08130D] disabled:opacity-50">✓ Guardar</button>
                  </div>
                </form>
              )}
            </div>
          );
        })}

        {/* Add button */}
        {!showAdd && (
          <button
            onClick={() => { setShowAdd(true); setEditingId(null); }}
            className="flex w-full items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[#38383B] py-3.5 text-[13px] font-semibold text-ap-sub"
          >
            <Plus size={16} color="#6F6F73" />
            Agregar servicio
          </button>
        )}
      </div>
    </div>
  );
}
