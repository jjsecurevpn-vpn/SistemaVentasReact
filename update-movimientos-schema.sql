-- Script para actualizar movimientos_caja con información de ventas
-- Ejecutar en Supabase SQL Editor

-- Agregar columnas para relacionar con ventas
ALTER TABLE movimientos_caja ADD COLUMN IF NOT EXISTS venta_id INTEGER REFERENCES ventas(id);
ALTER TABLE movimientos_caja ADD COLUMN IF NOT EXISTS cliente_id INTEGER REFERENCES clientes(id);

-- Primero eliminar la vista existente
DROP VIEW IF EXISTS movimientos_caja_con_usuario;

-- Crear la nueva vista con información completa
CREATE VIEW movimientos_caja_con_usuario AS
SELECT
  mc.*,
  CASE
    WHEN mc.usuario_id IS NOT NULL THEN
      json_build_object('id', au.id, 'email', COALESCE(au.email, 'usuario@desconocido.com'))
    ELSE
      json_build_object('id', 'unknown', 'email', 'Usuario desconocido')
  END as usuario,
  -- Información del cliente si existe
  CASE
    WHEN mc.cliente_id IS NOT NULL THEN
      json_build_object(
        'id', c.id,
        'nombre', c.nombre,
        'apellido', c.apellido,
        'email', c.email
      )
    ELSE NULL
  END as cliente,
  -- Información de la venta si existe
  CASE
    WHEN mc.venta_id IS NOT NULL THEN
      json_build_object(
        'id', v.id,
        'total', v.total,
        'fecha', v.fecha,
        'productos', (
          SELECT json_agg(
            json_build_object(
              'producto_id', vp.producto_id,
              'nombre', p.nombre,
              'cantidad', vp.cantidad,
              'subtotal', vp.subtotal
            )
          )
          FROM venta_productos vp
          JOIN productos p ON vp.producto_id = p.id
          WHERE vp.venta_id = v.id
        )
      )
    ELSE NULL
  END as venta
FROM movimientos_caja mc
LEFT JOIN auth.users au ON mc.usuario_id = au.id
LEFT JOIN clientes c ON mc.cliente_id = c.id
LEFT JOIN ventas v ON mc.venta_id = v.id;