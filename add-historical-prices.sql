-- Migración: Agregar precios históricos a venta_productos
-- Esto permite mantener el registro del precio de venta y costo al momento de cada venta
-- para que los cambios futuros de precios no afecten los cálculos históricos de ganancias

-- Agregar columna precio_unitario (precio de venta al momento de la transacción)
ALTER TABLE venta_productos 
ADD COLUMN IF NOT EXISTS precio_unitario NUMERIC;

-- Agregar columna precio_compra (costo al momento de la transacción)
ALTER TABLE venta_productos 
ADD COLUMN IF NOT EXISTS precio_compra NUMERIC DEFAULT 0;

-- Comentarios para documentación
COMMENT ON COLUMN venta_productos.precio_unitario IS 'Precio de venta unitario al momento de la transacción';
COMMENT ON COLUMN venta_productos.precio_compra IS 'Precio de compra (costo) unitario al momento de la transacción';

-- Actualizar registros existentes con los precios actuales de los productos
-- NOTA: Esto es una aproximación ya que no tenemos los precios históricos
UPDATE venta_productos vp
SET 
  precio_unitario = COALESCE(vp.subtotal / NULLIF(vp.cantidad, 0), p.precio),
  precio_compra = COALESCE(p.precio_compra, 0)
FROM productos p
WHERE vp.producto_id = p.id
AND vp.precio_unitario IS NULL;

-- Para nuevas ventas, precio_unitario se calculará desde el código
-- y precio_compra vendrá del producto al momento de la venta
