-- CreateEnum
CREATE TYPE "TipoFranja" AS ENUM ('POSITIVA', 'NEGATIVA');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'CLIENTE');

-- AlterTable
ALTER TABLE "BloqueoHorario" ADD COLUMN     "creadoPorId" TEXT,
ADD COLUMN     "todoElDia" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "HorarioAtencion" ADD COLUMN     "motivo" TEXT,
ADD COLUMN     "tipoFranja" "TipoFranja" NOT NULL DEFAULT 'POSITIVA';

-- AlterTable
ALTER TABLE "Turno" ADD COLUMN     "duracionSnapshot" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rol" "RolUsuario" NOT NULL DEFAULT 'CLIENTE';

-- CreateIndex
CREATE INDEX "BloqueoHorario_fecha_idx" ON "BloqueoHorario"("fecha");

-- CreateIndex
CREATE INDEX "HorarioAtencion_diaSemana_tipoFranja_activo_idx" ON "HorarioAtencion"("diaSemana", "tipoFranja", "activo");

-- CreateIndex
CREATE INDEX "Turno_fechaHora_estado_idx" ON "Turno"("fechaHora", "estado");

-- AddForeignKey
ALTER TABLE "BloqueoHorario" ADD CONSTRAINT "BloqueoHorario_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
