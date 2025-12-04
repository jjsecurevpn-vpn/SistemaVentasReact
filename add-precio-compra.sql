-- Script para agregar el campo precio_compra a la tabla productos
-- Ejecuta este comando en el SQL Editor de Supabase

-- Agregar columna precio_compra (costo del producto)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS precio_compra NUMERIC DEFAULT 0;

-- Comentario para documentar la columna
COMMENT ON COLUMN productos.precio_compra IS 'Precio de compra/costo del producto para calcular ganancia';

-- Actualizar productos existentes sin precio_compra (opcional, establece 0 por defecto)
UPDATE productos SET precio_compra = 0 WHERE precio_compra IS NULL;
