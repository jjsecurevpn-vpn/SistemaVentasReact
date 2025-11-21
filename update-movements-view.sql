-- Script para agregar la vista de movimientos con usuario
-- Ejecutar en el SQL Editor de Supabase

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

-- Las vistas heredan las políticas RLS de las tablas subyacentes
-- No necesitamos políticas adicionales ya que movimientos_caja ya tiene RLS configurado