-- Script completo para arreglar políticas RLS de movimientos_caja
-- Ejecutar en orden

-- 1. Deshabilitar RLS temporalmente para debugging
ALTER TABLE movimientos_caja DISABLE ROW LEVEL SECURITY;

-- 2. Verificar que se puede consultar
SELECT COUNT(*) as total_movimientos FROM movimientos_caja;

-- 3. Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view all movements" ON movimientos_caja;
DROP POLICY IF EXISTS "Users can insert movements" ON movimientos_caja;
DROP POLICY IF EXISTS "Users can update their own movements" ON movimientos_caja;
DROP POLICY IF EXISTS "Users can delete their own movements" ON movimientos_caja;

-- 4. Habilitar RLS
ALTER TABLE movimientos_caja ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas simples y permisivas
CREATE POLICY "Enable all operations for authenticated users" ON movimientos_caja
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 6. Verificar políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'movimientos_caja';

-- 7. Probar consulta
SELECT id, fecha, tipo, descripcion, monto, usuario_id
FROM movimientos_caja
ORDER BY fecha DESC
LIMIT 5;