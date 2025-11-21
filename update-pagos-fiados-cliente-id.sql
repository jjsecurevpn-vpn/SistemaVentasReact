-- Script para actualizar movimientos de pago_fiado existentes con cliente_id
-- Ejecutar en Supabase SQL Editor después de agregar la columna cliente_id

-- Actualizar movimientos de pago_fiado que no tienen cliente_id
-- Basándonos en la descripción que contiene "Pago de deuda #ID"
UPDATE movimientos_caja
SET cliente_id = (
  SELECT vf.cliente_id
  FROM ventas_fiadas vf
  WHERE vf.id::text = substring(mc.descripcion from 'Pago de deuda #(\d+)')
)
FROM movimientos_caja mc
WHERE mc.tipo = 'pago_fiado'
  AND mc.cliente_id IS NULL
  AND mc.descripcion LIKE 'Pago de deuda #%';

-- Verificar que se actualizaron correctamente
SELECT
  mc.id,
  mc.descripcion,
  mc.cliente_id,
  c.nombre,
  c.apellido
FROM movimientos_caja mc
LEFT JOIN clientes c ON mc.cliente_id = c.id
WHERE mc.tipo = 'pago_fiado'
ORDER BY mc.fecha DESC;