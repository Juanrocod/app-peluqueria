"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Box, Edit, Plus, ChevronLeft } from "lucide-react";
import { crearProducto, actualizarProducto, eliminarProducto } from "@/actions/catalogo";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  ganancia: number | null;
  imagenUrl: string;
}

export function ProductosMobile({ productos }: { productos: Producto[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const money = (n: number) => "$" + n.toLocaleString("es-AR");

  function handleAdd(form: FormData) {
    const venta = Number(form.get("venta"));
    const compra = Number(form.get("compra"));
    startTransition(async () => {
      await crearProducto({
        nombre: form.get("nombre") as string,
        precio: venta,
        ganancia: venta - compra,
      });
      setShowAdd(false);
      router.refresh();
    });
  }

  function handleSave(form: FormData, id: string) {
    const venta = Number(form.get("venta"));
    const compra = Number(form.get("compra"));
    startTransition(async () => {
      await actualizarProducto(id, {
        nombre: form.get("nombre") as string,
        precio: venta,
        ganancia: venta - compra,
      });
      setEditingId(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await eliminarProducto(id);
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
        <Box size={19} color="#E8A33D" />
        <span className="font-display text-[28px] font-bold">Productos</span>
      </div>

      <div className="px-4">
        {/* Add form */}
        {showAdd && (
          <form
            onSubmit={(e) => { e.preventDefault(); handleAdd(new FormData(e.currentTarget)); }}
            className="mb-4 rounded-2xl border border-[rgba(47,107,255,.35)] bg-ap-s1 p-3.5"
          >
            <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ap-primary">+ Nuevo producto</div>
            <div className="mb-2">
              <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-ap-muted">Nombre</div>
              <input name="nombre" placeholder="Ej: Pomada mate" required className="w-full rounded-[10px] border border-ap-border-soft bg-[#232325] px-3 py-2.5 text-sm text-ap-text outline-none placeholder-ap-muted focus:border-ap-primary" />
            </div>
            <div className="mb-2 grid grid-cols-2 gap-2">
              <div>
                <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-ap-muted">Precio de venta</div>
                <input name="venta" type="number" placeholder="10.000" required id="add-venta" className="w-full rounded-[10px] border border-ap-border-soft bg-[#232325] px-3 py-2.5 font-mono-num text-sm text-ap-text outline-none placeholder-ap-muted focus:border-ap-primary" onChange={() => calcNeto("add")} />
              </div>
              <div>
                <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-ap-muted">Precio de compra</div>
                <input name="compra" type="number" placeholder="4.000" required id="add-compra" className="w-full rounded-[10px] border border-ap-border-soft bg-[#232325] px-3 py-2.5 font-mono-num text-sm text-ap-text outline-none placeholder-ap-muted focus:border-ap-primary" onChange={() => calcNeto("add")} />
              </div>
            </div>
            <div className="mb-3 flex items-center justify-between rounded-[10px] border border-[rgba(34,211,102,.2)] bg-[rgba(34,211,102,.08)] px-3 py-2.5">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-[#22D366]">Ganancia neta por unidad</div>
                <div className="text-[10px] text-ap-muted">Venta − Compra → migra a Ganancias</div>
              </div>
              <div id="add-neto" className="font-mono-num text-lg font-extrabold text-[#22D366]">$0</div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-[10px] border border-ap-border-soft py-2.5 text-[13px] font-semibold text-ap-sub">Cancelar</button>
              <button type="submit" disabled={isPending} className="flex-[2] rounded-[10px] bg-[#22D366] py-2.5 text-[13px] font-bold text-[#08130D] disabled:opacity-50">✓ Guardar producto</button>
            </div>
          </form>
        )}

        {/* Product list */}
        {productos.map((p) => {
          const neto = p.ganancia ?? 0;
          const isEditing = editingId === p.id;
          return (
            <div key={p.id} className="mb-2.5 overflow-hidden rounded-[14px] border border-ap-border-soft bg-ap-s1">
              <button
                onClick={() => { setEditingId(isEditing ? null : p.id); setShowAdd(false); }}
                className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-[#232325]"
              >
                <div className="flex-1">
                  <div className="text-sm font-bold">{p.nombre}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs">
                    <span className="font-mono-num text-ap-primary">Venta {money(p.precio)}</span>
                    <span className="text-ap-muted">·</span>
                    <span className="font-mono-num font-bold text-[#22D366]">+{money(neto)} neto</span>
                  </div>
                </div>
                <Edit size={16} color="#6F6F73" />
              </button>

              {isEditing && (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSave(new FormData(e.currentTarget), p.id); }}
                  className="flex flex-col gap-2.5 border-t border-[#1E1E20] bg-[#161618] px-3.5 py-3"
                >
                  <input name="nombre" defaultValue={p.nombre} className="w-full rounded-[10px] border border-ap-border-soft bg-ap-s1 px-3 py-2 text-sm font-bold text-ap-text outline-none focus:border-ap-primary" />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-ap-muted">Venta</div>
                      <input name="venta" type="number" defaultValue={p.precio} className="w-full rounded-[10px] border border-ap-border-soft bg-ap-s1 px-3 py-2 font-mono-num text-sm font-bold text-ap-primary outline-none focus:border-ap-primary" />
                    </div>
                    <div>
                      <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-ap-muted">Compra</div>
                      <input name="compra" type="number" defaultValue={p.precio - neto} className="w-full rounded-[10px] border border-ap-border-soft bg-ap-s1 px-3 py-2 font-mono-num text-sm font-bold text-ap-text outline-none focus:border-ap-primary" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleDelete(p.id)} className="rounded-[9px] border border-[rgba(242,97,87,.35)] px-3 py-2 text-xs font-semibold text-ap-danger">Eliminar</button>
                    <button type="submit" disabled={isPending} className="flex-1 rounded-[9px] bg-[#22D366] py-2 text-[13px] font-bold text-[#08130D] disabled:opacity-50">✓ Guardar</button>
                  </div>
                </form>
              )}
            </div>
          );
        })}

        {productos.length === 0 && !showAdd && (
          <div className="py-8 text-center text-sm text-ap-muted">No hay productos cargados</div>
        )}

        {/* Add button */}
        {!showAdd && (
          <button
            onClick={() => { setShowAdd(true); setEditingId(null); }}
            className="flex w-full items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[#38383B] py-3.5 text-[13px] font-semibold text-ap-sub"
          >
            <Plus size={16} color="#6F6F73" />
            Agregar producto
          </button>
        )}
      </div>
    </div>
  );
}

function calcNeto(prefix: string) {
  const venta = Number((document.getElementById(`${prefix}-venta`) as HTMLInputElement)?.value || 0);
  const compra = Number((document.getElementById(`${prefix}-compra`) as HTMLInputElement)?.value || 0);
  const netoEl = document.getElementById(`${prefix}-neto`);
  if (netoEl) netoEl.textContent = "$" + (venta - compra).toLocaleString("es-AR");
}
