# Calendario Visual en Formulario de Reserva — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el `<input type="date">` del Paso 2 con un calendario visual dark touch-friendly, y aplicar un tema dark homogéneo a todo el formulario de reserva.

**Architecture:** Crear `CalendarioMes.tsx` como componente controlado que usa solo `date-fns` (ya instalado). Modificar `FormularioReserva.tsx` para importarlo y reemplazar el input, y actualizar todas las clases de color a la paleta dark slate/indigo.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS v4, date-fns v4. No hay framework de tests configurado en el proyecto — la verificación automática se hace con `npx tsc --noEmit` + `npm run lint`.

---

## Mapa de archivos

| Archivo | Operación | Responsabilidad |
|---|---|---|
| `components/booking/CalendarioMes.tsx` | **Crear** | Grilla mensual controlada, sin estado externo, solo date-fns |
| `components/booking/FormularioReserva.tsx` | **Reemplazar completo** | Integra CalendarioMes + tema dark en todos los pasos |

---

### Task 1: Crear `CalendarioMes.tsx`

**Files:**
- Create: `components/booking/CalendarioMes.tsx`

- [ ] **Step 1: Crear el archivo con la implementación completa**

```tsx
"use client";

import { useState } from "react";
import {
  startOfMonth,
  eachDayOfMonth,
  getDay,
  isBefore,
  isToday,
  isSameDay,
  format,
  addMonths,
  subMonths,
  parseISO,
  startOfToday,
} from "date-fns";
import { es } from "date-fns/locale";

const DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"];

type Props = {
  value: string;
  onChange: (fecha: string) => void;
};

export default function CalendarioMes({ value, onChange }: Props) {
  const [mesActual, setMesActual] = useState<Date>(() => startOfMonth(new Date()));

  const hoy = startOfToday();
  const primerDia = startOfMonth(mesActual);
  const diasDelMes = eachDayOfMonth(mesActual);
  const offset = (getDay(primerDia) + 6) % 7;
  const mesEsActual =
    mesActual.getFullYear() === hoy.getFullYear() &&
    mesActual.getMonth() === hoy.getMonth();
  const diaSeleccionado = value ? parseISO(value) : null;

  function handlePrevMes() {
    if (mesEsActual) return;
    setMesActual((m) => subMonths(m, 1));
  }

  function handleNextMes() {
    setMesActual((m) => addMonths(m, 1));
  }

  function handleSelectDia(dia: Date) {
    if (isBefore(dia, hoy)) return;
    onChange(format(dia, "yyyy-MM-dd"));
  }

  const mesLabel = format(mesActual, "MMMM yyyy", { locale: es });
  const mesLabelCapitalized = mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1);

  return (
    <div>
      {/* Navegación de meses */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrevMes}
          disabled={mesEsActual}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-500 disabled:opacity-30 hover:bg-slate-700 hover:text-slate-200 transition text-lg"
        >
          ‹
        </button>
        <span className="text-sm font-bold text-slate-200 tracking-tight">
          {mesLabelCapitalized}
        </span>
        <button
          type="button"
          onClick={handleNextMes}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-200 transition text-lg"
        >
          ›
        </button>
      </div>

      {/* Grilla del calendario */}
      <div className="grid grid-cols-7 gap-1">
        {/* Etiquetas de días */}
        {DIAS_SEMANA.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-semibold uppercase tracking-widest text-slate-600 pb-2"
          >
            {d}
          </div>
        ))}

        {/* Celdas vacías de padding */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {/* Días del mes */}
        {diasDelMes.map((dia) => {
          const pasado = isBefore(dia, hoy);
          const esHoy = isToday(dia);
          const seleccionado = diaSeleccionado
            ? isSameDay(dia, diaSeleccionado)
            : false;

          let clases =
            "flex items-center justify-center rounded-lg min-h-[40px] text-[13px] font-medium transition select-none ";

          if (pasado) {
            clases += "text-[#1e3a5f] cursor-not-allowed";
          } else if (seleccionado) {
            clases +=
              "bg-gradient-to-br from-blue-500 to-violet-600 text-white font-bold shadow-[0_3px_12px_rgba(99,102,241,0.5)]";
          } else if (esHoy) {
            clases +=
              "text-sky-400 font-bold outline outline-[1.5px] outline-sky-500 outline-offset-[-1.5px] cursor-pointer";
          } else {
            clases +=
              "text-slate-400 hover:bg-slate-800 hover:text-sky-300 cursor-pointer";
          }

          return (
            <button
              key={dia.toISOString()}
              type="button"
              disabled={pasado}
              onClick={() => handleSelectDia(dia)}
              className={clases}
            >
              {format(dia, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos con TypeScript**

```bash
npx tsc --noEmit
```

Resultado esperado: 0 errores. Si aparece `Cannot find module 'date-fns/locale'`, verificar que `date-fns` v4 esté instalado correctamente con `npm list date-fns`.

- [ ] **Step 3: Commit**

```bash
git add components/booking/CalendarioMes.tsx
git commit -m "feat: add CalendarioMes visual date picker component"
```

---

### Task 2: Reemplazar `FormularioReserva.tsx` con tema dark + integración de CalendarioMes

**Files:**
- Modify: `components/booking/FormularioReserva.tsx`

- [ ] **Step 1: Reemplazar el archivo completo con la versión actualizada**

Sobreescribir `components/booking/FormularioReserva.tsx` con el siguiente contenido:

```tsx
"use client";

import { useState } from "react";
import { crearTurno } from "@/actions/turnos";
import CalendarioMes from "./CalendarioMes";

type Servicio = { id: string; nombre: string; duracion: number; precio: number };
type Producto = { id: string; nombre: string; descripcion: string; precio: number; imagenUrl: string };

const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const DIAS_SEMANA = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];

function formatearFecha(iso: string) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  const dow = new Date(anio, mes - 1, dia).getDay();
  return `${DIAS_SEMANA[dow]} ${dia} de ${MESES[mes - 1]}`;
}

function tieneEspecial(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  const dow = new Date(a, m - 1, d).getDay();
  return dow === 5 || dow === 6;
}

type Paso = "servicio" | "fechaHora" | "modalidad" | "datos" | "productos" | "confirmado";

export default function FormularioReserva({ servicios, productos }: { servicios: Servicio[]; productos: Producto[] }) {
  const [paso, setPaso] = useState<Paso>("servicio");
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [fecha, setFecha] = useState("");
  const [especial, setEspecial] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [hora, setHora] = useState("");
  const [modalidad, setModalidad] = useState<"PRESENCIAL" | "DOMICILIO">("PRESENCIAL");
  const [direccion, setDireccion] = useState("");

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [codigoInput, setCodigoInput] = useState("");
  const [descuento, setDescuento] = useState<{ porcentaje: number } | null>(null);
  const [errorCodigo, setErrorCodigo] = useState("");
  const [validandoCodigo, setValidandoCodigo] = useState(false);

  const [productosSeleccionados, setProductosSeleccionados] = useState<Set<string>>(new Set());

  const [enviando, setEnviando] = useState(false);
  const [errorReserva, setErrorReserva] = useState("");

  async function cargarSlots(f: string, e: boolean, m: "PRESENCIAL" | "DOMICILIO") {
    if (!servicio || !f) return;
    const [anio] = f.split("-").map(Number);
    if (!anio || anio < 2020 || anio > 2100) return;
    setCargandoSlots(true);
    setHora("");
    const res = await fetch(`/api/disponibilidad?fecha=${f}&servicioId=${servicio.id}&especial=${e ? "1" : "0"}&modalidad=${m}`);
    const data = await res.json();
    setSlots(data.slots ?? []);
    setCargandoSlots(false);
  }

  async function validarCodigo() {
    if (codigoInput.length !== 5) return;
    setValidandoCodigo(true);
    setErrorCodigo("");
    const res = await fetch(`/api/validar-descuento?codigo=${codigoInput}`);
    const data = await res.json();
    if (data.valido) {
      setDescuento({ porcentaje: data.porcentaje });
    } else {
      setDescuento(null);
      setErrorCodigo("Código inválido o vencido.");
    }
    setValidandoCodigo(false);
  }

  function toggleProducto(id: string) {
    setProductosSeleccionados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function precioFinal() {
    const base = servicio?.precio ?? 0;
    const productosTotal = [...productosSeleccionados].reduce((acc, id) => {
      const p = productos.find((p) => p.id === id);
      return acc + (p?.precio ?? 0);
    }, 0);
    const subtotal = base + productosTotal;
    if (descuento) return subtotal * (1 - descuento.porcentaje / 100);
    return subtotal;
  }

  async function confirmarReserva() {
    if (!servicio || !fecha || !hora) {
      setErrorReserva("Falta seleccionar servicio, fecha u horario. Revisá los pasos anteriores.");
      return;
    }
    setEnviando(true);
    setErrorReserva("");
    try {
      const [a, m, d] = fecha.split("-").map(Number);
      const [hh, mm] = hora.split(":").map(Number);
      await crearTurno({
        fechaHora: new Date(a, m - 1, d, hh, mm),
        clienteNombre: nombre,
        clienteTelefono: telefono,
        clienteEmail: email || undefined,
        observaciones: observaciones || undefined,
        modalidad,
        direccion: modalidad === "DOMICILIO" ? direccion : undefined,
        servicioId: servicio.id,
        descuentoAplicado: descuento?.porcentaje,
        productoIds: [...productosSeleccionados],
      });
      setPaso("confirmado");
    } catch (e) {
      console.error("[confirmarReserva]", e);
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setErrorReserva(`No se pudo guardar el turno: ${msg}`);
    } finally {
      setEnviando(false);
    }
  }

  // ── Confirmación ─────────────────────────────────────────────────────────

  if (paso === "confirmado") {
    return (
      <div className="bg-slate-900 rounded-2xl shadow-2xl p-8 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-xl font-bold mb-2 text-slate-100">¡Turno reservado!</h2>
        <p className="text-slate-400 text-sm">
          <strong>{servicio?.nombre}</strong> · {formatearFecha(fecha)} a las <strong>{hora}</strong>
          {modalidad === "DOMICILIO" && <span> · A domicilio en {direccion}</span>}
        </p>
        {productosSeleccionados.size > 0 && (
          <p className="text-slate-400 text-sm mt-1">
            + {productosSeleccionados.size} producto{productosSeleccionados.size > 1 ? "s" : ""} solicitado{productosSeleccionados.size > 1 ? "s" : ""}
          </p>
        )}
        <button
          onClick={() => { setPaso("servicio"); setServicio(null); setFecha(""); setHora(""); setDescuento(null); setCodigoInput(""); setProductosSeleccionados(new Set()); }}
          className="mt-6 text-blue-400 hover:underline text-sm"
        >
          Reservar otro turno
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl shadow-2xl p-6 flex flex-col gap-6">

      {/* ── Paso 1: Servicio ───────────────────────────────────────────── */}
      <StepHeader n={1} titulo="Elegí el servicio" activo={paso === "servicio"} completado={!!servicio && paso !== "servicio"} resumen={servicio ? `${servicio.nombre} · ${servicio.duracion} min · $${servicio.precio.toLocaleString("es-AR")}` : ""} onEdit={() => setPaso("servicio")} />
      {paso === "servicio" && (
        <div className="grid gap-2">
          {servicios.map((s) => (
            <button key={s.id} type="button" onClick={() => { setServicio(s); setPaso("fechaHora"); }} className={`text-left border rounded-xl px-4 py-3 transition ${servicio?.id === s.id ? "border-indigo-500 bg-indigo-950" : "border-slate-700 bg-slate-800 hover:border-slate-500"}`}>
              <div className="font-medium text-slate-200">{s.nombre}</div>
              <div className="text-sm text-slate-500">{s.duracion} min · ${s.precio.toLocaleString("es-AR")}</div>
            </button>
          ))}
        </div>
      )}

      {/* ── Paso 2: Fecha y hora ───────────────────────────────────────── */}
      {(paso === "fechaHora" || (!!servicio && paso !== "servicio")) && (
        <>
          <StepHeader n={2} titulo="Elegí fecha y horario" activo={paso === "fechaHora"} completado={!!hora && paso !== "fechaHora"} resumen={hora ? `${formatearFecha(fecha)} a las ${hora}` : ""} onEdit={() => { setPaso("fechaHora"); setHora(""); }} />
          {paso === "fechaHora" && (
            <div className="flex flex-col gap-3">
              <CalendarioMes
                value={fecha}
                onChange={(f) => { setFecha(f); setEspecial(false); setHora(""); cargarSlots(f, false, modalidad); }}
              />
              {fecha && tieneEspecial(fecha) && (
                <div className="flex items-center gap-3 bg-[#1e1040] border border-[#4c1d95] rounded-lg px-4 py-3">
                  <div className="flex-1">
                    <div className="font-medium text-violet-300 text-sm">Horario nocturno especial</div>
                    <div className="text-violet-500 text-xs">20:00 – 23:00 · Salís directo a bailar</div>
                  </div>
                  <button type="button" onClick={() => { const next = !especial; setEspecial(next); cargarSlots(fecha, next, modalidad); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${especial ? "bg-violet-600" : "bg-slate-700"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${especial ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              )}
              {fecha && (
                <div>
                  <div className="text-sm font-medium mb-2 text-slate-500">Horarios disponibles — <span className="font-normal text-slate-600">{formatearFecha(fecha)}</span></div>
                  {cargandoSlots ? (
                    <p className="text-slate-600 text-sm">Cargando horarios...</p>
                  ) : slots.length === 0 ? (
                    <p className="text-slate-600 text-sm">Sin horarios disponibles para este día.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {slots.map((s) => (
                        <button key={s} type="button" onClick={() => { setHora(s); setPaso("modalidad"); }} className={`border rounded-lg py-2 text-sm font-medium transition ${hora === s ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white border-transparent shadow-[0_2px_8px_rgba(99,102,241,0.4)]" : "border-slate-700 bg-slate-800 text-slate-400 hover:border-sky-500 hover:text-sky-300"}`}>{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Paso 3: Modalidad ──────────────────────────────────────────── */}
      {(paso === "modalidad" || paso === "datos" || paso === "productos") && (
        <>
          <StepHeader n={3} titulo="¿Cómo querés el turno?" activo={paso === "modalidad"} completado={paso === "datos" || paso === "productos"} resumen={modalidad === "PRESENCIAL" ? "Presencial en el local" : `A domicilio · ${direccion}`} onEdit={() => setPaso("modalidad")} />
          {paso === "modalidad" && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                {(["PRESENCIAL", "DOMICILIO"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setModalidad(m)} className={`border rounded-xl px-4 py-4 text-sm font-medium transition flex flex-col items-center gap-1 ${modalidad === m ? "border-indigo-500 bg-indigo-950 text-indigo-300" : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500"}`}>
                    <span className="text-2xl">{m === "PRESENCIAL" ? "🏪" : "🏠"}</span>
                    {m === "PRESENCIAL" ? "En el local" : "A domicilio"}
                  </button>
                ))}
              </div>
              {modalidad === "DOMICILIO" && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-amber-400 bg-amber-950/40 border border-amber-800 rounded-lg px-3 py-2">
                    ⚠️ Tené en cuenta que puede haber un adicional según la distancia.
                  </div>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ingresá tu dirección completa"
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
              <button
                type="button"
                disabled={modalidad === "DOMICILIO" && !direccion.trim()}
                onClick={() => setPaso("datos")}
                className="bg-gradient-to-r from-blue-500 to-violet-600 text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Paso 4: Datos personales ───────────────────────────────────── */}
      {(paso === "datos" || paso === "productos") && (
        <>
          <StepHeader n={4} titulo="Tus datos" activo={paso === "datos"} completado={paso === "productos"} resumen={nombre ? `${nombre} · ${telefono}` : ""} onEdit={() => setPaso("datos")} />
          {paso === "datos" && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Nombre completo *</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Teléfono *</label>
                <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Email (opcional)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Observaciones (opcional)</label>
                <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={2} placeholder="Algo que quieras aclarar..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>

              {/* Código de descuento */}
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Código de descuento (opcional)</label>
                <div className="flex gap-2">
                  <input value={codigoInput} onChange={(e) => { setCodigoInput(e.target.value.toUpperCase().slice(0, 5)); setDescuento(null); setErrorCodigo(""); }} placeholder="XXXXX" maxLength={5} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono uppercase tracking-widest text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <button type="button" onClick={validarCodigo} disabled={codigoInput.length !== 5 || validandoCodigo} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400 hover:bg-slate-700 disabled:opacity-50 transition">
                    {validandoCodigo ? "..." : "Aplicar"}
                  </button>
                </div>
                {descuento && <p className="text-green-400 text-xs mt-1">✓ {descuento.porcentaje}% de descuento aplicado</p>}
                {errorCodigo && <p className="text-red-400 text-xs mt-1">{errorCodigo}</p>}
              </div>

              <button
                type="button"
                disabled={!nombre.trim() || !telefono.trim()}
                onClick={() => setPaso("productos")}
                className="bg-gradient-to-r from-blue-500 to-violet-600 text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Paso 5: Productos ──────────────────────────────────────────── */}
      {paso === "productos" && (
        <div className="flex flex-col gap-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-100">💈 ¿Querés agregar productos de peinado?</div>
            <div className="text-sm text-slate-500 mt-1">Llevate algo para mantener tu estilo en casa.</div>
          </div>
          {productos.length > 0 ? (
            <div className="flex flex-col gap-2">
              {productos.map((p) => (
                <button key={p.id} type="button" onClick={() => toggleProducto(p.id)} className={`flex items-center gap-3 border rounded-xl px-3 py-3 text-left transition ${productosSeleccionados.has(p.id) ? "border-indigo-500 bg-indigo-950" : "border-slate-700 bg-slate-800 hover:border-slate-500"}`}>
                  {p.imagenUrl ? (
                    <img src={p.imagenUrl} alt={p.nombre} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-xl flex-shrink-0">📦</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-200">{p.nombre}</div>
                    {p.descripcion && <div className="text-xs text-slate-500 truncate">{p.descripcion}</div>}
                    <div className="text-sm font-semibold text-green-400 mt-0.5">${p.precio.toLocaleString("es-AR")}</div>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${productosSeleccionados.has(p.id) ? "border-indigo-500 bg-indigo-500" : "border-slate-600"}`}>
                    {productosSeleccionados.has(p.id) && <span className="text-white text-xs">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-sm text-center">No hay productos disponibles por el momento.</p>
          )}

          {/* Resumen de precio */}
          <div className="border-t border-slate-700 pt-3 mt-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Servicio</span>
              <span className="text-slate-300">${servicio?.precio.toLocaleString("es-AR")}</span>
            </div>
            {productosSeleccionados.size > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Productos ({productosSeleccionados.size})</span>
                <span className="text-slate-300">${[...productosSeleccionados].reduce((acc, id) => acc + (productos.find((p) => p.id === id)?.precio ?? 0), 0).toLocaleString("es-AR")}</span>
              </div>
            )}
            {descuento && (
              <div className="flex justify-between text-sm text-green-400">
                <span>Descuento ({descuento.porcentaje}%)</span>
                <span>-${((servicio?.precio ?? 0 + [...productosSeleccionados].reduce((acc, id) => acc + (productos.find((p) => p.id === id)?.precio ?? 0), 0)) * descuento.porcentaje / 100).toLocaleString("es-AR")}</span>
              </div>
            )}
            <div className="flex justify-between font-bold mt-1 text-slate-100">
              <span>Total estimado</span>
              <span>${precioFinal().toLocaleString("es-AR")}</span>
            </div>
          </div>

          {errorReserva && (
            <div className="bg-red-950/50 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3">
              {errorReserva}
            </div>
          )}
          <button
            type="button"
            disabled={enviando}
            onClick={confirmarReserva}
            className="bg-gradient-to-r from-blue-500 to-violet-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {enviando ? "Reservando..." : "Confirmar reserva"}
          </button>
          <button type="button" disabled={enviando} onClick={confirmarReserva} className="text-xs text-slate-600 hover:underline text-center disabled:opacity-50">
            Omitir y confirmar sin productos
          </button>
        </div>
      )}
    </div>
  );
}

function StepHeader({ n, titulo, activo, completado, resumen, onEdit }: { n: number; titulo: string; activo: boolean; completado: boolean; resumen: string; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${activo ? "bg-indigo-500 text-white" : completado ? "bg-green-500 text-white" : "bg-slate-800 text-slate-600"}`}>
        {completado ? "✓" : n}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${activo ? "text-slate-100" : "text-slate-600"}`}>{titulo}</div>
        {completado && resumen && <div className="text-xs text-slate-500 truncate">{resumen}</div>}
      </div>
      {completado && <button type="button" onClick={onEdit} className="text-xs text-blue-400 hover:underline flex-shrink-0">Cambiar</button>}
    </div>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Resultado esperado: 0 errores.

- [ ] **Step 3: Verificar ESLint**

```bash
npm run lint
```

Resultado esperado: sin errores. Advertencias de `@next/next/no-img-element` en la imagen de producto son pre-existentes y aceptables (no son nuevas).

- [ ] **Step 4: Commit**

```bash
git add components/booking/FormularioReserva.tsx
git commit -m "feat: dark theme + integrate CalendarioMes in booking form"
```

---

### Task 3: Verificación visual en el navegador

**Files:** ninguno — solo verificación

- [ ] **Step 1: Iniciar el servidor de desarrollo**

```bash
npm run dev
```

Resultado esperado: servidor corriendo en `http://localhost:3000`

- [ ] **Step 2: Navegar a la página de reservas**

Abrir `http://localhost:3000/reservar` en el navegador.

- [ ] **Step 3: Verificar checklist visual — Paso 1**

- [ ] El formulario tiene fondo `bg-slate-900` (oscuro), no blanco
- [ ] Los botones de servicios son oscuros con borde `border-slate-700`
- [ ] El badge `1` es violeta/indigo cuando está activo
- [ ] Al seleccionar un servicio, el botón se ilumina con `border-indigo-500 bg-indigo-950`

- [ ] **Step 4: Verificar checklist visual — Paso 2 (calendario)**

- [ ] El calendario se renderiza como grilla mensual (7 columnas L M M J V S D)
- [ ] Los días anteriores a hoy aparecen en color muy oscuro (`#1e3a5f`) y no son clicables
- [ ] El día de hoy tiene borde cyan outline
- [ ] Al tocar/clicar un día futuro, queda resaltado con gradiente azul-violeta
- [ ] La navegación `←` está deshabilitada en el mes actual
- [ ] La navegación `›` avanza al mes siguiente correctamente
- [ ] Al seleccionar un día viernes o sábado, aparece el toggle de "Horario nocturno especial"
- [ ] Después de seleccionar un día, aparece la grilla de slots disponibles en formato oscuro

- [ ] **Step 5: Verificar checklist visual — Pasos 3, 4 y 5**

- [ ] Paso 3 (modalidad): botones oscuros, seleccionado en indigo, input de dirección con fondo `bg-slate-800`
- [ ] Paso 4 (datos): labels en `text-slate-300`, inputs con fondo `bg-slate-800`
- [ ] Paso 5 (productos): cards de productos oscuras, precio en verde `text-green-400`, resumen con `border-slate-700`
- [ ] Botón "Confirmar reserva" con gradiente azul-violeta
- [ ] Pantalla de confirmación final con fondo oscuro y texto `text-slate-100`

- [ ] **Step 6: Verificar en mobile (DevTools)**

Activar DevTools → modo responsivo → iPhone 12 Pro (390px de ancho). Verificar:
- [ ] Las celdas del calendario tienen al menos 40px de alto (touch target)
- [ ] La grilla de 7 columnas se ve correctamente sin overflow
- [ ] Los slots de horarios (`grid-cols-4`) se ven bien en mobile
