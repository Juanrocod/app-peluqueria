-- CreateEnum
CREATE TYPE "ModalidadTurno" AS ENUM ('PRESENCIAL', 'DOMICILIO');

-- AlterTable
ALTER TABLE "HorarioAtencion" ADD COLUMN     "esBloqueo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Turno" ADD COLUMN     "clienteEmail" TEXT,
ADD COLUMN     "descuentoAplicado" INTEGER,
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "modalidad" "ModalidadTurno" NOT NULL DEFAULT 'PRESENCIAL',
ADD COLUMN     "observaciones" TEXT;

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "imagenUrl" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurnoProducto" (
    "id" TEXT NOT NULL,
    "turnoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,

    CONSTRAINT "TurnoProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodigoDescuento" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descuento" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodigoDescuento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracionApp" (
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "ConfiguracionApp_pkey" PRIMARY KEY ("clave")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodigoDescuento_codigo_key" ON "CodigoDescuento"("codigo");

-- AddForeignKey
ALTER TABLE "TurnoProducto" ADD CONSTRAINT "TurnoProducto_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnoProducto" ADD CONSTRAINT "TurnoProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
