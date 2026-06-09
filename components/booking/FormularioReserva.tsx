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

function formatearFechaLarga(iso: string) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  const dow = new Date(anio, mes - 1, dia).getDay();
  const nombre = DIAS_SEMANA[dow];
  return `${nombre.charAt(0).toUpperCase() + nombre.slice(1)} ${dia} de ${MESES[mes - 1]}`;
}

function calcularHoraFin(horaInicio: string, duracionMinutos: number) {
  const [hh, mm] = horaInicio.split(":").map(Number);
  const total = hh * 60 + mm + duracionMinutos;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

type Paso = "servicio" | "fechaHora" | "modalidad" | "datos" | "productos" | "confirmado";

type Props = {
  servicios: Servicio[];
  productos: Producto[];
  marcaNombre?: string;
  marcaTelefono?: string;
  marcaDireccion?: string;
};

export default function FormularioReserva({ servicios, productos, marcaNombre = "Tu Peluquería", marcaTelefono, marcaDireccion }: Props) {
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

  // Días del mes sin disponibilidad (para deshabilitar en el calendario)
  const [diasSinSlots, setDiasSinSlots] = useState<Set<string>>(new Set());
  const [mesCalendario, setMesCalendario] = useState<string>(() => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  });

  async function cargarDiasDisponibles(svcId: string, mes: string, m: "PRESENCIAL" | "DOMICILIO") {
    try {
      const res = await fetch(`/api/disponibilidad/mes?mes=${mes}&servicioId=${svcId}&modalidad=${m}`);
      const data = await res.json();
      const disponibles: string[] = data.diasDisponibles ?? [];
      // Calculamos todos los días del mes y los que NO están en la lista son "sin slots"
      const [y, mo] = mes.split("-").map(Number);
      const ultimoDia = new Date(y, mo, 0).getDate();
      const sinSlots = new Set<string>();
      for (let d = 1; d <= ultimoDia; d++) {
        const fechaStr = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        if (!disponibles.includes(fechaStr)) sinSlots.add(fechaStr);
      }
      setDiasSinSlots(sinSlots);
    } catch {
      setDiasSinSlots(new Set());
    }
  }

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

  if (paso === "confirmado") {
    const horaFin = servicio ? calcularHoraFin(hora, servicio.duracion) : hora;
    const fechaLarga = formatearFechaLarga(fecha);

    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header con acento amber ───────────────────────────────── */}
        <div className="bg-zinc-900 px-6 py-8 text-center border-b border-zinc-800">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-zinc-100 tracking-tight leading-tight">{marcaNombre}</h1>
          <p className="text-amber-500 text-sm mt-1 font-semibold uppercase tracking-wider">Tu turno está confirmado</p>
        </div>

        {/* ── Bloques informativos ──────────────────────────────────── */}
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Fecha y hora */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-base">
              📅
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Fecha y hora</p>
              <p className="text-zinc-100 font-semibold leading-snug">{fechaLarga}</p>
              <p className="text-zinc-300 text-sm">{hora} – {horaFin}</p>
              <p className="text-zinc-500 text-xs mt-0.5">Zona horaria: Argentina, Buenos Aires</p>
            </div>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Servicio */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-base">
              ✂️
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Servicio</p>
              <p className="text-zinc-100 font-semibold leading-snug">{servicio?.nombre}</p>
              <p className="text-zinc-400 text-xs">{servicio?.duracion} min</p>
              {modalidad === "DOMICILIO" && (
                <p className="text-amber-500 text-xs mt-0.5">A domicilio · {direccion}</p>
              )}
            </div>
          </div>

          {/* Productos (si hay) */}
          {productosSeleccionados.size > 0 && (
            <>
              <div className="h-px bg-zinc-800" />
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-base">
                  📦
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Productos</p>
                  <p className="text-zinc-100 font-semibold leading-snug">
                    {productosSeleccionados.size} producto{productosSeleccionados.size > 1 ? "s" : ""} solicitado{productosSeleccionados.size > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Dirección y teléfono del local (si están en config) */}
          {(marcaDireccion || marcaTelefono) && (
            <>
              <div className="h-px bg-zinc-800" />
              {marcaDireccion && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-base">
                    📍
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Dirección</p>
                    <p className="text-zinc-100 font-semibold leading-snug">{marcaDireccion}</p>
                  </div>
                </div>
              )}
              {marcaTelefono && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-base">
                    📞
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Teléfono</p>
                    <p className="text-zinc-100 font-semibold leading-snug">{marcaTelefono}</p>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <div className="px-6 pb-6">
          <button
            onClick={() => { setPaso("servicio"); setServicio(null); setFecha(""); setHora(""); setDescuento(null); setCodigoInput(""); setProductosSeleccionados(new Set()); }}
            className="w-full py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-sm font-semibold transition"
          >
            Reservar otro turno
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-6">
      {/* ── Paso 1: Servicio ───────────────────────────────────────────── */}
      <StepHeader n={1} titulo="Elegí el servicio" activo={paso === "servicio"} completado={!!servicio && paso !== "servicio"} resumen={servicio ? `${servicio.nombre} · ${servicio.duracion} min · $${servicio.precio.toLocaleString("es-AR")}` : ""} onEdit={() => setPaso("servicio")} />
      {paso === "servicio" && (
        <div className="grid gap-2">
          {servicios.map((s) => (
            <button key={s.id} type="button" onClick={() => { setServicio(s); setPaso("fechaHora"); cargarDiasDisponibles(s.id, mesCalendario, modalidad); }} className={`text-left border rounded-xl px-4 py-3.5 transition ${servicio?.id === s.id ? "border-amber-500 bg-amber-500/5" : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900"}`}>
              <div className="font-semibold text-zinc-100">{s.nombre}</div>
              <div className="text-xs text-zinc-400 mt-1">{s.duracion} min · ${s.precio.toLocaleString("es-AR")}</div>
            </button>
          ))}
        </div>
      )}
      {/* ── Paso 2: Fecha y hora ───────────────────────────────────────── */}
      {(paso === "fechaHora" || (!!servicio && paso !== "servicio")) && (
        <>
          <StepHeader n={2} titulo="Elegí fecha y horario" activo={paso === "fechaHora"} completado={!!hora && paso !== "fechaHora"} resumen={hora ? `${formatearFecha(fecha)} a las ${hora}` : ""} onEdit={() => { setPaso("fechaHora"); setHora(""); }} />
          {paso === "fechaHora" && (
            <div className="flex flex-col gap-4">
              <CalendarioMes
                value={fecha}
                onChange={(f) => { setFecha(f); setEspecial(false); setHora(""); cargarSlots(f, false, modalidad); }}
                diasSinSlots={diasSinSlots}
                onMesChange={(mes) => {
                  setMesCalendario(mes);
                  if (servicio) cargarDiasDisponibles(servicio.id, mes, modalidad);
                }}
              />
              {fecha && tieneEspecial(fecha) && (
                <div className="flex items-center gap-3 bg-violet-950/20 border border-violet-900/60 rounded-xl px-4 py-3">
                  <div className="flex-1">
                    <div className="font-semibold text-violet-300 text-sm">Horario nocturno especial</div>
                    <div className="text-violet-400/80 text-xs">20:00 – 23:00 · Salís directo a bailar</div>
                  </div>
                  <button type="button" onClick={() => { const next = !especial; setEspecial(next); cargarSlots(fecha, next, modalidad); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${especial ? "bg-violet-500" : "bg-zinc-800"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${especial ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              )}
              {fecha && (
                <div>
                  <div className="text-sm font-semibold mb-3 text-zinc-400">Horarios disponibles — <span className="font-medium text-zinc-400">{formatearFecha(fecha)}</span></div>
                  {cargandoSlots ? (
                    <p className="text-zinc-500 text-sm">Cargando horarios...</p>
                  ) : slots.length === 0 ? (
                    <p className="text-zinc-500 text-sm">Sin horarios disponibles para este día.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {slots.map((s) => (
                        <button key={s} type="button" onClick={() => { setHora(s); setPaso("modalidad"); }} className={`border rounded-xl py-2.5 text-sm font-semibold transition ${hora === s ? "border-transparent bg-amber-500 text-zinc-950 shadow-[0_2px_10px_rgba(245,158,11,0.3)]" : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-amber-500"}`}>{s}</button>
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
                  <button key={m} type="button" onClick={() => { setModalidad(m); if (servicio) cargarDiasDisponibles(servicio.id, mesCalendario, m); }} className={`border rounded-xl px-4 py-4 text-sm font-semibold transition flex flex-col items-center gap-1.5 ${modalidad === m ? "border-amber-500 bg-amber-500/5 text-amber-500" : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900"}`}>
                    <span className="text-2xl">{m === "PRESENCIAL" ? "🏪" : "🏠"}</span>
                    {m === "PRESENCIAL" ? "En el local" : "A domicilio"}
                  </button>
                ))}
              </div>
              {modalidad === "DOMICILIO" && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2">
                    ⚠️ Tené en cuenta que puede haber un adicional según la distancia.
                  </div>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ingresá tu dirección completa"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              )}
              <button
                type="button"
                disabled={modalidad === "DOMICILIO" && !direccion.trim()}
                onClick={() => setPaso("datos")}
                className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:hover:bg-amber-500"
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
                <label className="block text-sm font-medium mb-1 text-zinc-300">Nombre completo *</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-300">Teléfono *</label>
                <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-300">Email (opcional)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-300">Observaciones (opcional)</label>
                <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={2} placeholder="Algo que quieras aclarar..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-300">Código de descuento (opcional)</label>
                <div className="flex gap-2">
                  <input value={codigoInput} onChange={(e) => { setCodigoInput(e.target.value.toUpperCase().slice(0, 5)); setDescuento(null); setErrorCodigo(""); }} placeholder="XXXXX" maxLength={5} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono uppercase tracking-widest text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500" />
                  <button type="button" onClick={validarCodigo} disabled={codigoInput.length !== 5 || validandoCodigo} className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50 transition">
                    {validandoCodigo ? "..." : "Aplicar"}
                  </button>
                </div>
                {descuento && <p className="text-emerald-500 text-xs mt-1">✓ {descuento.porcentaje}% de descuento aplicado</p>}
                {errorCodigo && <p className="text-rose-500 text-xs mt-1">{errorCodigo}</p>}
              </div>
              <button
                type="button"
                disabled={!nombre.trim() || !telefono.trim()}
                onClick={() => setPaso("productos")}
                className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:hover:bg-amber-500"
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
            <div className="text-lg font-semibold text-zinc-100">💈 ¿Querés agregar productos de peinado?</div>
            <div className="text-sm text-zinc-400 mt-1">Llevate algo para mantener tu estilo en casa.</div>
          </div>
          {productos.length > 0 ? (
            <div className="flex flex-col gap-2">
              {productos.map((p) => (
                <button key={p.id} type="button" onClick={() => toggleProducto(p.id)} className={`flex items-center gap-3 border rounded-xl px-3 py-3 text-left transition ${productosSeleccionados.has(p.id) ? "border-amber-500 bg-amber-500/5" : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900"}`}>
                  {p.imagenUrl ? (
                    <img src={p.imagenUrl} alt={p.nombre} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-xl flex-shrink-0">📦</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-zinc-200">{p.nombre}</div>
                    {p.descripcion && <div className="text-xs text-zinc-500 truncate">{p.descripcion}</div>}
                    <div className="text-sm font-semibold text-amber-500 mt-0.5">${p.precio.toLocaleString("es-AR")}</div>
                  </div>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${productosSeleccionados.has(p.id) ? "border-amber-500 bg-amber-500 text-zinc-950" : "border-zinc-700 bg-zinc-950"}`}>
                    {productosSeleccionados.has(p.id) && <span className="text-zinc-950 text-xs font-bold">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm text-center">No hay productos disponibles por el momento.</p>
          )}
          <div className="border-t border-zinc-800 pt-4 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Servicio</span>
              <span className="text-zinc-300">${servicio?.precio.toLocaleString("es-AR")}</span>
            </div>
            {productosSeleccionados.size > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Productos ({productosSeleccionados.size})</span>
                <span className="text-zinc-300">${[...productosSeleccionados].reduce((acc, id) => acc + (productos.find((p) => p.id === id)?.precio ?? 0), 0).toLocaleString("es-AR")}</span>
              </div>
            )}
            {descuento && (
              <div className="flex justify-between text-sm text-emerald-500 font-medium">
                <span>Descuento ({descuento.porcentaje}%)</span>
                <span>-${((servicio?.precio ?? 0 + [...productosSeleccionados].reduce((acc, id) => acc + (productos.find((p) => p.id === id)?.precio ?? 0), 0)) * descuento.porcentaje / 100).toLocaleString("es-AR")}</span>
              </div>
            )}
            <div className="flex justify-between font-bold mt-2 text-zinc-100 text-base border-t border-zinc-800/50 pt-2">
              <span>Total estimado</span>
              <span>${precioFinal().toLocaleString("es-AR")}</span>
            </div>
          </div>
          {errorReserva && (
            <div className="bg-rose-950/20 border border-rose-900/40 text-rose-500 text-sm rounded-xl px-4 py-3">
              {errorReserva}
            </div>
          )}
          <button
            type="button"
            disabled={enviando}
            onClick={confirmarReserva}
            className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 py-3 rounded-xl font-bold shadow-[0_4px_16px_rgba(245,158,11,0.2)] transition disabled:opacity-50 disabled:hover:bg-amber-500"
          >
            {enviando ? "Reservando..." : "Confirmar reserva"}
          </button>
          <button type="button" disabled={enviando} onClick={confirmarReserva} className="text-xs text-zinc-500 hover:text-zinc-300 transition text-center disabled:opacity-50">
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
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${activo ? "bg-amber-500 text-zinc-950" : completado ? "bg-zinc-800 text-amber-500 border border-amber-500/20" : "bg-zinc-950 text-zinc-600 border border-zinc-800"}`}>
        {completado ? "✓" : n}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${activo ? "text-zinc-100" : "text-zinc-500"}`}>{titulo}</div>
        {completado && resumen && <div className="text-xs text-zinc-400 truncate">{resumen}</div>}
      </div>
      {completado && <button type="button" onClick={onEdit} className="text-xs text-amber-500 hover:text-amber-400 transition flex-shrink-0">Cambiar</button>}
    </div>
  );
}