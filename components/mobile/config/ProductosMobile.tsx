"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Box, Edit, ChevronRight, Plus } from "lucide-react";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  ganancia: number | null;
  imagenUrl: string;
}

export function ProductosMobile({ productos }: { productos: Producto[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const money = (n: number) => "$" + n.toLocaleString("es-AR");

  return (
    <div className="pb-20">
      <div className="mb-4 flex items-center gap-2.5 px-4">
        <Box size={19} color="#E8A33D" />
        <span className="font-display text-xl font-semibold">Productos</span>
      </div>

      <div className="px-4">
        {productos.map((p) => {
          const neto = p.ganancia ?? 0;
          const isEditing = editingId === p.id;
          return (
            <div key={p.id} className="mb-2.5 overflow-hidden rounded-[14px] border border-ap-border-soft bg-ap-s1">
              <button
                onClick={() => setEditingId(isEditing ? null : p.id)}
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
                {isEditing ? <ChevronRight size={16} color="#6F6F73" className="rotate-90" /> : <Edit size={16} color="#6F6F73" />}
              </button>
            </div>
          );
        })}

        {productos.length === 0 && (
          <div className="py-8 text-center text-sm text-ap-muted">No hay productos cargados</div>
        )}
      </div>
    </div>
  );
}
