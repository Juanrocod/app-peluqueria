"use client";

import { useState, useCallback } from "react";
import { Scissors, Check, User, Phone as PhoneIcon, Mail, MessageSquare } from "lucide-react";
import { crearTurno } from "@/actions/turnos";

interface Servicio {
  id: string;
  nombre: string;
  duracion: number;
  precio: number;
}

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  imagenUrl: string;
}

interface BookingFormProps {
  servicios: Servicio[];
  productos?: Producto[];
}

export function BookingForm({ servicios, productos = [] }: BookingFormProps) {
  const [step, setStep] = useState(0);
  const [servicioIds, setServicioIds] = useState<string[]>([]);
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [place, setPlace] = useState<"salon" | "home" | null>(null);
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [obs, setObs] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedSvcs = servicios.filter((s) => servicioIds.includes(s.id));
  const selectedSvc = selectedSvcs.length > 0 ? selectedSvcs[0] : undefined;
  const totalDuration = selectedSvcs.reduce((a, s) => a + s.duracion, 0);
  const totalServicePrice = selectedSvcs.reduce((a, s) => a + s.precio, 0);
  const selectedProducts = productos.filter((p) => selectedProductIds.includes(p.id));
  const productosTotal = selectedProducts.reduce((a, p) => a + p.precio, 0);
  const money = (n: number) => "$" + n.toLocaleString("es-AR");

  function toggleServicio(id: string) {
    setServicioIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 5 ? [...prev, id] : prev
    );
    // Reset time when services change (duration affects available slots)
    setTime(null);
  }

  function toggleProducto(id: string) {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length >= 10;
  const nameLetters = name.replace(/[^a-záéíóúñü]/gi, "");
  const uniqueChars = new Set(nameLetters.toLowerCase()).size;
  const isNameValid = nameLetters.length >= 4 && uniqueChars >= 2 && /^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s]+$/.test(name.trim());
  const isEmailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  const [triedNext, setTriedNext] = useState(false);

  const canNext = useCallback(() => {
    if (step === 0) return servicioIds.length > 0;
    if (step === 1) return !!time;
    if (step === 2)
      return place === "salon" || (place === "home" && address.trim() !== "");
    if (step === 3) return isNameValid && isPhoneValid && isEmailValid;
    return true;
  }, [step, servicioIds.length, time, place, address, isNameValid, isPhoneValid, isEmailValid]);

  async function handleConfirm() {
    if (servicioIds.length === 0 || !day || !time) return;
    setSubmitting(true);
    setError("");
    try {
      const [y, m, d] = day.split("-").map(Number);
      const [h, min] = time.split(":").map(Number);
      const fechaHora = new Date(y, m - 1, d, h, min);

      await crearTurno({
        fechaHora,
        fechaStr: day,
        horaSlot: time,
        clienteNombre: name,
        clienteTelefono: phone,
        clienteEmail: email || undefined,
        observaciones: obs || undefined,
        modalidad: place === "home" ? "DOMICILIO" : "PRESENCIAL",
        direccion: place === "home" ? address : undefined,
        servicioIds,
        descuentoAplicado: discountPct || undefined,
        productoIds: selectedProductIds.length > 0 ? selectedProductIds : undefined,
      });
      setDone(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al confirmar el turno";
      setError(msg);
    }
    setSubmitting(false);
  }

  function next() {
    if (step === 3 && !canNext()) {
      setTriedNext(true);
      return;
    }
    if (!canNext()) return;
    setTriedNext(false);
    if (step === 4) {
      handleConfirm();
    } else {
      setStep(step + 1);
    }
  }

  // Summary labels for completed steps
  const serviceNames = selectedSvcs.map((s) => s.nombre).join(", ");
  const summaries = [
    selectedSvcs.length > 0
      ? `${serviceNames} · ${totalDuration} min · ${money(totalServicePrice)}`
      : "",
    day && time ? `${day} a las ${time}` : "",
    place === "home"
      ? `A domicilio · ${address}`
      : place === "salon"
        ? "En el local"
        : "",
    name ? `${name} · ${phone}` : "",
  ];

  const stepTitles = [
    "Elegí el servicio",
    "Elegí fecha y horario",
    "¿Cómo querés el turno?",
    "Tus datos",
    "Revisá y confirmá",
  ];

  if (done) {
    return (
      <div className="flex h-screen flex-col items-center justify-center overflow-hidden bg-cl-bg px-4">
        <div
          className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-cl-border bg-cl-card"
          style={{ boxShadow: "0 24px 60px -28px rgba(0,0,0,.8)" }}
        >
          <div
            className="px-6 py-8 text-center"
            style={{
              background: "linear-gradient(160deg, #1B7A53, #0E6B47)",
            }}
          >
            <div className="mx-auto mb-3 flex h-[58px] w-[58px] items-center justify-center rounded-full bg-white/20">
              <Check size={28} color="#fff" />
            </div>
            <div className="font-display text-[25px] font-bold text-white">
              BarberFras
            </div>
            <div className="mt-1 text-sm text-white/85">
              Tu turno está confirmado
            </div>
          </div>
          <div className="space-y-0 px-5 pb-5">
            {(
              [
                ["✂️", selectedSvcs.length > 1 ? "SERVICIOS" : "SERVICIO", serviceNames || ""],
                ["📅", "FECHA Y HORA", `${day} · ${time}`],
                [
                  "📍",
                  "UBICACIÓN",
                  place === "home" ? "A domicilio" : "En el local",
                ],
                [
                  "💈",
                  "PRODUCTOS",
                  selectedProducts.length > 0
                    ? selectedProducts.map((p) => p.nombre).join(", ")
                    : "Sin productos",
                ],
              ] as const
            ).map(([emoji, label, value], i) => (
              <div
                key={i}
                className="flex gap-3 border-b border-cl-border py-3.5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-[11px] border border-cl-border bg-cl-slot text-xl">
                  {emoji}
                </span>
                <div>
                  <div className="text-[11px] font-bold tracking-wider text-[#5F6B85]">
                    {label}
                  </div>
                  <div className="mt-0.5 text-[15px] font-bold text-white">
                    {value}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pb-2 pt-4">
              <span className="text-sm font-bold">Total estimado</span>
              <span className="font-mono-num text-xl font-bold text-[#22D366]">
                {money(
                  selectedSvcs.length > 0
                    ? Math.round(totalServicePrice * (1 - discountPct / 100) + productosTotal)
                    : 0,
                )}
              </span>
            </div>
            <button
              onClick={() => {
                setStep(0);
                setServicioIds([]);
                setDay(null);
                setTime(null);
                setPlace(null);
                setAddress("");
                setName("");
                setPhone("");
                setEmail("");
                setObs("");
                setDiscountCode("");
                setDiscountPct(0);
                setSelectedProductIds([]);
                setDone(false);
              }}
              className="w-full rounded-[13px] border border-cl-border bg-cl-slot py-3.5 text-sm font-semibold text-white"
            >
              Reservar otro turno
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-cl-border bg-cl-slot px-3.5 py-3 text-[15px] text-white placeholder-[#46557A] outline-none transition-all focus:border-[#3B6EF5] focus:ring-[3px] focus:ring-[rgba(59,110,245,.2)]";

  return (
    <div className="flex min-h-screen flex-col bg-cl-bg">
      {/* Header */}
      <div className="border-b border-[#16203A] px-4 py-3">
        <div className="mb-2.5 flex items-center gap-2.5">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-cl-border bg-cl-card">
            <Scissors size={17} color="#7C9CFF" />
          </span>
          <div className="flex-1">
            <div className="font-display text-base font-semibold">
              BarberFras
            </div>
            <div className="text-[11px] text-[#5F6B85]">Reservar turno</div>
          </div>
          <span className="font-mono-num text-xs text-[#5F6B85]">
            {step + 1}/5
          </span>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="h-1 flex-1 rounded-sm transition-colors"
              style={{
                background:
                  i <= step
                    ? "linear-gradient(135deg, #3B6EF5, #8B5CF6)"
                    : "#23304E",
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-3.5">
        {/* Completed steps */}
        {Array.from({ length: step }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 border-b border-[#223052] py-3"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#22D366]">
              <Check size={14} color="#08130D" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-[#5F6B85]">
                {stepTitles[i]}
              </div>
              <div className="truncate text-[13px] font-semibold text-[#E4E8F0]">
                {summaries[i]}
              </div>
            </div>
            <button
              onClick={() => setStep(i)}
              className="rounded-lg px-2 py-1 text-[13px] font-bold text-[#4D8BFF]"
            >
              Cambiar
            </button>
          </div>
        ))}

        {/* Active step header */}
        <div className="mb-4 mt-3 flex items-center gap-2.5">
          <span
            className="flex h-[27px] w-[27px] items-center justify-center rounded-full font-mono-num text-[13px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #3B6EF5, #8B5CF6)",
              boxShadow: "0 6px 18px -4px rgba(124,92,246,.55)",
            }}
          >
            {step + 1}
          </span>
          <div className="font-display text-xl font-semibold">
            {stepTitles[step]}
          </div>
        </div>

        {/* Step 0: Service selection (multi-select) */}
        {step === 0 && (
          <div>
            <div className="flex flex-col gap-2.5">
              {servicios.map((s, i) => {
                const on = servicioIds.includes(s.id);
                const dotColors = ["#22D366", "#2F6BFF", "#B79CFF", "#E8A33D", "#F26157", "#34D399"];
                const dotColor = dotColors[i % dotColors.length];
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleServicio(s.id)}
                    className="flex w-full items-center gap-3 rounded-[14px] border-2 px-3.5 py-3 text-left transition-all"
                    style={{
                      background: on ? "rgba(34,211,102,.07)" : "#16213A",
                      borderColor: on ? "#22D366" : "#223052",
                      boxShadow: on
                        ? "0 4px 16px -6px rgba(34,211,102,.4)"
                        : "none",
                    }}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: on ? "#22D366" : dotColor }} />
                    <div className="flex-1">
                      <div className="text-[14.5px] font-bold text-white">
                        {s.nombre}
                      </div>
                      <div className="mt-0.5 font-mono-num text-xs text-[#C7D0E0]">
                        {s.duracion} min · {money(s.precio)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedSvcs.length > 0 && (
              <div className="mt-3 rounded-[13px] border border-[#223052] bg-[#16213A] px-3.5 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#9DA9C0]">
                    {selectedSvcs.length} servicio{selectedSvcs.length > 1 ? "s" : ""}
                  </span>
                  <span className="font-mono-num text-xs text-[#C7D0E0]">
                    {totalDuration} min · {money(totalServicePrice)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Date + Time */}
        {step === 1 && selectedSvcs.length > 0 && (
          <DateTimeStep
            servicioIds={servicioIds}
            modalidad={place === "home" ? "DOMICILIO" : "PRESENCIAL"}
            selectedDay={day}
            selectedTime={time}
            onSelectDay={(d) => {
              setDay(d);
              setTime(null);
            }}
            onSelectTime={setTime}
          />
        )}

        {/* Step 2: Modality */}
        {step === 2 && (
          <div>
            <div className="flex gap-2.5">
              {(
                [
                  [
                    "salon",
                    "🏪",
                    "En el local",
                    "Venís a la peluquería.",
                  ],
                  [
                    "home",
                    "🏠",
                    "A domicilio",
                    "Vamos a tu dirección.",
                  ],
                ] as const
              ).map(([key, emoji, title, sub]) => {
                const on = place === key;
                return (
                  <button
                    key={key}
                    onClick={() => setPlace(key)}
                    className="flex flex-1 flex-col gap-2 rounded-[15px] border px-3.5 py-4 text-left transition-all"
                    style={{
                      background: on ? "rgba(77,139,255,.1)" : "#16213A",
                      borderColor: on ? "#4D8BFF" : "#223052",
                    }}
                  >
                    <span
                      className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] text-[23px]"
                      style={{
                        background: on ? "rgba(77,139,255,.16)" : "#1A2742",
                      }}
                    >
                      {emoji}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {title}
                    </span>
                    <span className="text-[11px] text-[#9DA9C0]">{sub}</span>
                  </button>
                );
              })}
            </div>
            {place === "home" && (
              <div className="mt-3.5">
                <div className="mb-3 flex items-start gap-2 rounded-xl border border-[#6E5224] bg-[rgba(232,163,61,.1)] px-3 py-2.5">
                  <span className="text-sm text-[#E8A33D]">⚠</span>
                  <span className="text-xs leading-relaxed text-[#E8A33D]">
                    Tené en cuenta que puede haber un adicional según la
                    distancia.
                  </span>
                </div>
                <div className="mb-1.5 text-xs font-semibold text-[#9DA9C0]">
                  Dirección completa
                </div>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, número, piso…"
                  className={inputClass}
                />
              </div>
            )}
            {place === "salon" && (
              <div className="mt-3 text-center text-xs text-[#5F6B85]">
                Te esperamos en BarberFras
              </div>
            )}
          </div>
        )}

        {/* Step 3: Personal data */}
        {step === 3 && (
          <div className="flex flex-col gap-3">
            <div>
              <div className="mb-1.5 text-xs font-semibold text-[#9DA9C0]">
                Nombre completo *
              </div>
              <div className={`flex items-center gap-2.5 rounded-xl border bg-cl-slot px-3.5 py-3 transition-all focus-within:ring-[3px] ${triedNext && !isNameValid ? "border-[#F26157] focus-within:border-[#F26157] focus-within:ring-[rgba(242,97,87,.2)]" : "border-cl-border focus-within:border-[#3B6EF5] focus-within:ring-[rgba(59,110,245,.2)]"}`}>
                <User size={16} color={triedNext && !isNameValid ? "#F26157" : "#5F6B85"} className="shrink-0" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.replace(/[^a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s]/g, ""))}
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-transparent text-[15px] text-white placeholder-[#46557A] outline-none"
                />
              </div>
              {triedNext && !isNameValid && (
                <div className="mt-1 text-xs font-semibold text-[#F26157]">Ingresá un nombre válido</div>
              )}
            </div>
            <div>
              <div className="mb-1.5 text-xs font-semibold text-[#9DA9C0]">
                Teléfono / WhatsApp *
              </div>
              <div className={`flex items-center gap-2.5 rounded-xl border bg-cl-slot px-3.5 py-3 transition-all focus-within:ring-[3px] ${triedNext && !isPhoneValid ? "border-[#F26157] focus-within:border-[#F26157] focus-within:ring-[rgba(242,97,87,.2)]" : "border-cl-border focus-within:border-[#3B6EF5] focus-within:ring-[rgba(59,110,245,.2)]"}`}>
                <PhoneIcon size={16} color={triedNext && !isPhoneValid ? "#F26157" : "#5F6B85"} className="shrink-0" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="11 2345 6789"
                  type="tel"
                  inputMode="numeric"
                  className="w-full bg-transparent text-[15px] text-white placeholder-[#46557A] outline-none"
                />
              </div>
              {triedNext && !isPhoneValid && (
                <div className="mt-1 text-xs font-semibold text-[#F26157]">Ingresá un número válido (ej: 11 2345 6789)</div>
              )}
            </div>
            <div>
              <div className="mb-1.5 text-xs font-semibold text-[#9DA9C0]">
                Email (opcional)
              </div>
              <div className={`flex items-center gap-2.5 rounded-xl border bg-cl-slot px-3.5 py-3 transition-all focus-within:ring-[3px] ${triedNext && !isEmailValid ? "border-[#F26157] focus-within:border-[#F26157] focus-within:ring-[rgba(242,97,87,.2)]" : "border-cl-border focus-within:border-[#3B6EF5] focus-within:ring-[rgba(59,110,245,.2)]"}`}>
                <Mail size={16} color={triedNext && !isEmailValid ? "#F26157" : "#5F6B85"} className="shrink-0" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@mail.com"
                  type="email"
                  className="w-full bg-transparent text-[15px] text-white placeholder-[#46557A] outline-none"
                />
              </div>
              {triedNext && !isEmailValid && (
                <div className="mt-1 text-xs font-semibold text-[#F26157]">Ingresá un email válido (ej: nombre@mail.com)</div>
              )}
            </div>
            <div>
              <div className="mb-1.5 text-xs font-semibold text-[#9DA9C0]">
                Observaciones (opcional)
              </div>
              <textarea
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                placeholder="Algo que quieras aclarar…"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <div className="mb-1.5 text-xs font-semibold text-[#9DA9C0]">
                Código de descuento (opcional)
              </div>
              {discountPct > 0 ? (
                <div className="flex items-center gap-2.5 rounded-xl border border-[rgba(34,211,102,.3)] bg-[rgba(34,211,102,.08)] px-3.5 py-3">
                  <span className="text-lg">🎉</span>
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-[#22D366]">¡Código aplicado!</div>
                    <div className="text-[11px] text-[#22D366]/70">{discountCode.toUpperCase()} · {discountPct}% de descuento</div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="XXXXX"
                    className={`${inputClass} flex-1 tracking-wider`}
                  />
                  <button
                    onClick={async () => {
                      if (!discountCode.trim()) return;
                      try {
                        const res = await fetch(
                          `/api/validar-descuento?codigo=${discountCode}`,
                        );
                        const data = await res.json();
                        if (data.valido) setDiscountPct(data.porcentaje);
                      } catch {
                        /* ignore */
                      }
                    }}
                    className="shrink-0 rounded-xl border border-cl-border bg-cl-card px-4 text-sm font-semibold text-white"
                  >
                    Aplicar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Confirm + Products */}
        {step === 4 && selectedSvcs.length > 0 && (
          <div>
            {/* Products selection */}
            {productos.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 text-center">
                  <div className="font-display text-lg font-semibold">¿Querés agregar productos?</div>
                  <div className="mt-0.5 text-xs text-[#5F6B85]">Llevate algo para mantener tu estilo en casa.</div>
                </div>
                <div className="flex flex-col gap-2">
                  {productos.map((p) => {
                    const on = selectedProductIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleProducto(p.id)}
                        className="flex w-full items-center gap-3 rounded-[14px] border px-3.5 py-3 text-left transition-all"
                        style={{
                          background: on ? "rgba(77,139,255,.1)" : "#16213A",
                          borderColor: on ? "#4D8BFF" : "#223052",
                        }}
                      >
                        <span className="flex h-[46px] w-[46px] items-center justify-center rounded-[10px] bg-cl-slot text-[22px]">
                          🫙
                        </span>
                        <div className="flex-1">
                          <div className="text-sm font-bold">{p.nombre}</div>
                          <div className="mt-0.5 font-mono-num text-[13px] font-bold text-[#22D366]">{money(p.precio)}</div>
                        </div>
                        <span
                          className="flex h-[22px] w-[22px] items-center justify-center rounded-[7px]"
                          style={{
                            background: on ? "#22D366" : "transparent",
                            border: on ? "none" : "1.5px solid #2A3A5E",
                            boxShadow: on ? "0 4px 12px -3px rgba(34,211,102,.5)" : "none",
                          }}
                        >
                          {on && <Check size={13} color="#08130D" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price summary */}
            <div className="border-t border-[#223052] pt-3">
              {selectedSvcs.map((s) => (
                <div key={s.id} className="mb-1.5 flex justify-between text-[13px] text-[#9DA9C0]">
                  <span>{s.nombre}</span>
                  <span className="font-mono-num">{money(s.precio)}</span>
                </div>
              ))}
              {selectedProducts.map((p) => (
                <div key={p.id} className="mb-1.5 flex justify-between text-[13px] text-[#9DA9C0]">
                  <span>{p.nombre}</span>
                  <span className="font-mono-num">{money(p.precio)}</span>
                </div>
              ))}
              {discountPct > 0 && (
                <div className="mb-1.5 flex justify-between text-[13px] text-[#22D366]">
                  <span>Descuento ({discountPct}%)</span>
                  <span className="font-mono-num">
                    -{money(Math.round((totalServicePrice * discountPct) / 100))}
                  </span>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-bold">Total estimado</span>
                <span className="font-mono-num text-xl font-bold text-[#22D366]">
                  {money(Math.round(totalServicePrice * (1 - discountPct / 100) + productosTotal))}
                </span>
              </div>
            </div>
            {error && (
              <div className="mt-3 rounded-xl border border-[#6E3232] bg-[rgba(242,97,87,.1)] px-3.5 py-3 text-sm text-[#F26157]">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer CTA — fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#16203A] bg-cl-bg px-4 py-3" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}>
        <button
          onClick={next}
          disabled={(step !== 3 && !canNext()) || submitting}
          className="w-full rounded-[14px] py-[15px] text-[15px] font-bold text-white transition-all disabled:cursor-not-allowed"
          style={{
            background: (step === 3 || canNext())
              ? "linear-gradient(135deg, #3B6EF5, #8B5CF6)"
              : "#1A2742",
            color: (step === 3 || canNext()) ? "#fff" : "#46557A",
            boxShadow: (step === 3 || canNext())
              ? "0 6px 18px -4px rgba(124,92,246,.55)"
              : "none",
          }}
        >
          {submitting
            ? "Confirmando..."
            : step === 4
              ? "Confirmar reserva"
              : "Continuar"}
        </button>
      </div>
    </div>
  );
}

// ── DateTimeStep (internal) ──────────────────────────────────

function DateTimeStep({
  servicioIds,
  modalidad,
  selectedDay,
  selectedTime,
  onSelectDay,
  onSelectTime,
}: {
  servicioIds: string[];
  modalidad: string;
  selectedDay: string | null;
  selectedTime: string | null;
  onSelectDay: (d: string) => void;
  onSelectTime: (t: string) => void;
}) {
  const [slots, setSlots] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [nightMode, setNightMode] = useState(false);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const daysIn = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWd = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const WD = ["L", "M", "M", "J", "V", "S", "D"];
  const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWd; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);

  function handlePrevMonth() {
    if (isCurrentMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  async function loadSlots(dateStr: string) {
    setLoading(true);
    try {
      const idsParam = servicioIds.length > 1
        ? `servicioIds=${servicioIds.join(",")}`
        : `servicioId=${servicioIds[0]}`;
      const res = await fetch(
        `/api/disponibilidad?fecha=${dateStr}&${idsParam}&modalidad=${modalidad}`,
      );
      const data = await res.json();
      setSlots(Array.isArray(data) ? data : data.slots ?? []);
      setAllSlots(data.allSlots ?? []);
    } catch {
      setSlots([]);
    }
    setLoading(false);
  }

  function handleDayClick(d: number) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    onSelectDay(dateStr);
    loadSlots(dateStr);
    setNightMode(false);
  }

  const selectedDayNum = selectedDay
    ? parseInt(selectedDay.split("-")[2])
    : null;
  const selectedInCurrentView = selectedDay
    ? parseInt(selectedDay.split("-")[1]) - 1 === viewMonth &&
      parseInt(selectedDay.split("-")[0]) === viewYear
    : false;
  const selectedDow = selectedDay ? new Date(selectedDay).getDay() : null;
  const isSaturday = selectedDow === 6;

  const displaySlots = nightMode
    ? allSlots.filter((s) => parseInt(s) >= 20)
    : allSlots.filter((s) => parseInt(s) < 20);

  function isDayPast(d: number) {
    if (viewYear < today.getFullYear()) return true;
    if (viewYear === today.getFullYear() && viewMonth < today.getMonth()) return true;
    if (isCurrentMonth && d < today.getDate()) return true;
    return false;
  }

  return (
    <div>
      {/* Month header with navigation */}
      <div className="mb-2.5 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          disabled={isCurrentMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5F6B85] disabled:opacity-30"
        >
          &lsaquo;
        </button>
        <span className="text-[15px] font-bold">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={handleNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5F6B85]"
        >
          &rsaquo;
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {WD.map((w, i) => (
          <div key={i} className="text-center text-[11px] font-bold text-[#5F6B85]">
            {w}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="mb-3.5 grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="h-[38px]" />;
          const past = isDayPast(d);
          const on = selectedInCurrentView && d === selectedDayNum;
          const isToday = isCurrentMonth && d === today.getDate();
          return (
            <button
              key={i}
              disabled={past}
              onClick={() => handleDayClick(d)}
              className="flex h-[38px] items-center justify-center rounded-[10px] font-mono-num text-sm transition-all"
              style={{
                background: on
                  ? "linear-gradient(135deg, #3B6EF5, #8B5CF6)"
                  : "transparent",
                border:
                  isToday && !on
                    ? "1.5px solid #4D8BFF"
                    : "1px solid transparent",
                color: past ? "#39455E" : on ? "#fff" : "#E4E8F0",
                fontWeight: on ? 700 : 500,
                boxShadow: on
                  ? "0 6px 18px -4px rgba(124,92,246,.55)"
                  : "none",
              }}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* Saturday night toggle */}
      {isSaturday && allSlots.some((s) => parseInt(s) >= 20) && (
        <button
          onClick={() => setNightMode(!nightMode)}
          className="mb-4 flex w-full items-center gap-2.5 rounded-[13px] border px-3.5 py-3 text-left"
          style={{
            background: nightMode ? "rgba(124,92,246,.14)" : "#16213A",
            borderColor: nightMode ? "#6D4FCF" : "#223052",
          }}
        >
          <span className="text-base">🌙</span>
          <div className="flex-1">
            <div className="text-[13px] font-bold" style={{ color: nightMode ? "#C4B0FF" : "#F4F4F2" }}>
              Horario nocturno especial
            </div>
            <div className="text-[11px]" style={{ color: nightMode ? "#9B85D6" : "#5F6B85" }}>
              20:00 - 23:00
            </div>
          </div>
          <span
            className="relative h-6 w-[42px] rounded-full"
            style={{
              background: nightMode
                ? "linear-gradient(135deg, #3B6EF5, #8B5CF6)"
                : "#33405E",
            }}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-[left] duration-150"
              style={{ left: nightMode ? 20 : 2 }}
            />
          </span>
        </button>
      )}

      {/* Slots */}
      {selectedDay && selectedInCurrentView && (
        <>
          <div className="mb-2.5 text-xs font-semibold text-[#9DA9C0]">
            Horarios disponibles
          </div>
          {loading ? (
            <div className="py-6 text-center text-sm text-[#5F6B85]">
              Cargando horarios...
            </div>
          ) : displaySlots.length === 0 ? (
            <div className="py-6 text-center text-sm text-[#5F6B85]">
              No hay horarios disponibles
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {displaySlots.map((t) => {
                const isFree = slots.includes(t);
                const on = selectedTime === t;
                return (
                  <button
                    key={t}
                    disabled={!isFree}
                    onClick={() => isFree && onSelectTime(t)}
                    className="rounded-[11px] border py-3 text-center font-mono-num text-[13px] font-semibold transition-all"
                    style={{
                      background: on
                        ? "linear-gradient(135deg, #3B6EF5, #8B5CF6)"
                        : "#1A2742",
                      borderColor: on ? "transparent" : "#2A3A5E",
                      color: !isFree ? "#39455E" : on ? "#fff" : "#E4E8F0",
                      textDecoration: !isFree ? "line-through" : "none",
                      boxShadow: on
                        ? "0 6px 18px -4px rgba(124,92,246,.55)"
                        : "none",
                      cursor: isFree ? "pointer" : "not-allowed",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
