-- DropIndex
DROP INDEX "HorarioAtencion_diaSemana_key";

-- AlterTable
ALTER TABLE "HorarioAtencion" ADD COLUMN     "etiqueta" TEXT;
