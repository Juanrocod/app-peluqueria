import { z } from "zod";

const phoneRegex = /^[\d\s+\-]{10,30}$/;

export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://localhost")) return trimmed;
  return "";
}
const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const crearTurnoSchema = z.object({
  fechaHora: z.any(),
  fechaStr: z.string().optional(),
  horaSlot: z.string().regex(horaRegex).optional(),
  clienteNombre: z.string().min(4).max(100).regex(/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s]+$/, "Solo letras y espacios"),
  clienteTelefono: z.string().regex(phoneRegex, "Número de teléfono inválido"),
  clienteEmail: z.string().email().max(100).optional().or(z.literal("")),
  observaciones: z.string().max(500).optional().or(z.literal("")),
  modalidad: z.enum(["PRESENCIAL", "DOMICILIO"]).optional(),
  direccion: z.string().max(200).optional().or(z.literal("")),
  servicioId: z.string().cuid().optional(),
  servicioIds: z.array(z.string().cuid()).min(1).max(5).optional(),
  peluqueroId: z.string().cuid().optional().or(z.literal("")),
  notas: z.string().max(500).optional().or(z.literal("")),
  origen: z.enum(["ONLINE", "MANUAL"]).optional(),
  descuentoAplicado: z.number().min(0).max(100).optional(),
  recargoPremium: z.number().int().min(1).max(100).optional(),
  productoIds: z.array(z.string().cuid()).max(10).optional(),
});

export const crearServicioSchema = z.object({
  nombre: z.string().min(2).max(100),
  duracion: z.number().int().min(5).max(480),
  precio: z.number().min(0),
});

export const actualizarServicioSchema = crearServicioSchema.partial();

export const crearProductoSchema = z.object({
  nombre: z.string().min(2).max(100),
  precio: z.number().min(0),
  ganancia: z.number().min(0),
});

export const actualizarProductoSchema = crearProductoSchema.partial();

export const registrarPeluqueroSchema = z.object({
  nombreNegocio: z.string().min(2).max(100),
  nombre: z.string().min(2).max(100),
  email: z.string().email().max(100),
  password: z.string().min(8),
});

const strongPassword = z.string().min(8)
  .refine((p) => /[A-Z]/.test(p), "Falta una mayúscula")
  .refine((p) => /[0-9]/.test(p), "Falta un número")
  .refine((p) => /[^A-Za-z0-9]/.test(p), "Falta un carácter especial");

export const cambiarPasswordSchema = z.object({
  actual: z.string().min(1),
  nueva: strongPassword,
});

export const executeResetSchema = z.object({
  token: z.string().length(64).regex(/^[a-f0-9]+$/),
  password: strongPassword,
});

export const crearFranjaSchema = z.object({
  diaSemana: z.number().int().min(0).max(6),
  horaApertura: z.string().regex(horaRegex),
  horaCierre: z.string().regex(horaRegex),
  tipoFranja: z.enum(["POSITIVA", "NEGATIVA"]),
  motivo: z.string().max(200).optional(),
  recargo: z.number().int().min(1).max(100).optional(),
});

export const crearBloqueoSchema = z.object({
  fecha: z.date(),
  todoElDia: z.boolean(),
  horaInicio: z.string().regex(horaRegex).optional(),
  horaFin: z.string().regex(horaRegex).optional(),
  motivo: z.string().max(200).optional(),
});

export const crearCodigoSchema = z.object({
  codigo: z.string().min(3).max(10),
  descuento: z.number().int().min(1).max(100),
});

export const setConfigSchema = z.object({
  clave: z.string().max(50),
  valor: z.string().max(500),
});
