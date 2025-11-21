-- Script para corregir la zona horaria en movimientos_caja
-- Ejecutar en el SQL Editor de Supabase

-- Primero eliminar todas las vistas que dependen de la columna fecha de movimientos_caja
DROP VIEW IF EXISTS movimientos_caja_recientes;
DROP VIEW IF EXISTS dashboard_stats;
DROP VIEW IF EXISTS productos_mas_vendidos;
DROP VIEW IF EXISTS ventas_por_mes;
DROP VIEW IF EXISTS clientes_top;
DROP VIEW IF EXISTS movimientos_caja_con_usuario;

-- Cambiar la columna fecha a TIMESTAMPTZ para manejar zonas horarias correctamente
ALTER TABLE movimientos_caja ALTER COLUMN fecha TYPE TIMESTAMPTZ USING fecha AT TIME ZONE 'UTC';

-- Recrear las vistas después del cambio de tipo de columna

-- Vista de estadísticas generales
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM productos) as total_productos,
  (SELECT COUNT(*) FROM clientes) as total_clientes,
  (SELECT COALESCE(SUM(total), 0) FROM ventas WHERE DATE(fecha) = CURRENT_DATE) as ventas_hoy,
  (SELECT COALESCE(SUM(total), 0) FROM ventas WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)) as ventas_mes,
  (SELECT COALESCE(SUM(monto), 0) FROM movimientos_caja WHERE tipo = 'ingreso' AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)) as ingresos_mes,
  (SELECT COALESCE(SUM(monto), 0) FROM movimientos_caja WHERE tipo = 'gasto' AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)) as gastos_mes,
  (SELECT COALESCE(SUM(v.total), 0) FROM ventas_fiadas vf JOIN ventas v ON vf.venta_id = v.id WHERE vf.estado = 'pendiente') as dinero_fiado_pendiente;

-- Vista de productos más vendidos
CREATE OR REPLACE VIEW productos_mas_vendidos AS
SELECT
  p.id,
  p.nombre,
  p.precio,
  COALESCE(SUM(vp.cantidad), 0) as total_vendido,
  COALESCE(SUM(vp.subtotal), 0) as total_ingresos
FROM productos p
LEFT JOIN venta_productos vp ON p.id = vp.producto_id
GROUP BY p.id, p.nombre, p.precio
ORDER BY total_vendido DESC;

-- Vista de ventas por mes
CREATE OR REPLACE VIEW ventas_por_mes AS
SELECT
  DATE_TRUNC('month', fecha) as mes,
  COUNT(*) as numero_ventas,
  SUM(total) as total_ventas
FROM ventas
GROUP BY DATE_TRUNC('month', fecha)
ORDER BY mes DESC;

-- Vista de clientes con más compras
CREATE OR REPLACE VIEW clientes_top AS
SELECT
  c.id,
  c.nombre,
  c.apellido,
  c.email,
  COUNT(vf.id) as total_compras_fiadas,
  COALESCE(SUM(v.total), 0) as total_comprado
FROM clientes c
LEFT JOIN ventas_fiadas vf ON c.id = vf.cliente_id
LEFT JOIN ventas v ON vf.venta_id = v.id
GROUP BY c.id, c.nombre, c.apellido, c.email
ORDER BY total_comprado DESC;

-- Vista de movimientos de caja con información de usuario
CREATE OR REPLACE VIEW movimientos_caja_con_usuario AS
SELECT
  mc.*,
  CASE
    WHEN mc.usuario_id IS NOT NULL THEN
      json_build_object('id', au.id, 'email', au.email)
    ELSE NULL
  END as usuario
FROM movimientos_caja mc
LEFT JOIN auth.users au ON mc.usuario_id = au.id;