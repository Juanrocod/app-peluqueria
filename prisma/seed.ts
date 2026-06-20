import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin inicial
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@peluqueria.com" },
    update: { rol: "ADMIN" },
    create: {
      email: "admin@peluqueria.com",
      password: passwordHash,
      nombre: "Administrador",
      rol: "ADMIN",
    },
  });

  // Limpiar horarios existentes y recrear
  await prisma.horarioAtencion.deleteMany();

  await prisma.horarioAtencion.createMany({
    data: [
      // Lunes a jueves: 9-17 (franja única)
      { diaSemana: 1, horaApertura: "09:00", horaCierre: "17:00", activo: true },
      { diaSemana: 2, horaApertura: "09:00", horaCierre: "17:00", activo: true },
      { diaSemana: 3, horaApertura: "09:00", horaCierre: "17:00", activo: true },
      { diaSemana: 4, horaApertura: "09:00", horaCierre: "17:00", activo: true },

      // Viernes: 9-17 normal + 20-23 especial
      { diaSemana: 5, horaApertura: "09:00", horaCierre: "17:00", activo: true },
      { diaSemana: 5, horaApertura: "20:00", horaCierre: "23:00", etiqueta: "especial", activo: true },

      // Sábado: 9-12 mañana, 13-20 tarde, 20-23 especial
      { diaSemana: 6, horaApertura: "09:00", horaCierre: "12:00", activo: true },
      { diaSemana: 6, horaApertura: "13:00", horaCierre: "20:00", activo: true },
      { diaSemana: 6, horaApertura: "20:00", horaCierre: "23:00", etiqueta: "especial", activo: true },

      // Domingo: 9-12 mañana, 13-20 tarde
      { diaSemana: 0, horaApertura: "09:00", horaCierre: "12:00", activo: true },
      { diaSemana: 0, horaApertura: "13:00", horaCierre: "20:00", activo: true },
    ],
  });

  // Servicios de ejemplo (solo si no hay ninguno)
  const count = await prisma.servicio.count();
  if (count === 0) {
    await prisma.servicio.createMany({
      data: [
        { nombre: "Corte de pelo", duracion: 30, precio: 3500 },
        { nombre: "Corte + barba", duracion: 45, precio: 5000 },
        { nombre: "Coloración", duracion: 90, precio: 8000 },
        { nombre: "Tratamiento capilar", duracion: 60, precio: 6000 },
      ],
    });
  }

  console.log("Seed completado.");
  console.log("Login: admin@peluqueria.com / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
