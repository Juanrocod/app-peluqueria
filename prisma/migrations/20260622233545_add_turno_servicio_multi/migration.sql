-- CreateTable
CREATE TABLE "TurnoServicio" (
    "id" TEXT NOT NULL,
    "turnoId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "duracionSnapshot" INTEGER NOT NULL,
    "precioSnapshot" DECIMAL(10,2),
    "nombreSnapshot" TEXT,

    CONSTRAINT "TurnoServicio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TurnoServicio" ADD CONSTRAINT "TurnoServicio_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnoServicio" ADD CONSTRAINT "TurnoServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
