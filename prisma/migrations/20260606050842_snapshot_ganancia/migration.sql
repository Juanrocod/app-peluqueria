-- AlterTable
ALTER TABLE "Turno" ADD COLUMN     "nombreServicioFinal" TEXT,
ADD COLUMN     "precioServicioFinal" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "TurnoProducto" ADD COLUMN     "gananciaFinal" DECIMAL(10,2),
ADD COLUMN     "nombreProductoFinal" TEXT;
