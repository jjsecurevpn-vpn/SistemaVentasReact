-- Actualizar políticas RLS para movimientos_caja
-- Primero eliminar las políticas existentes
DROP POLICY IF EXISTS "Users can view their own movements" ON movimientos_caja;
DROP POLICY IF EXISTS "Users can insert their own movements" ON movimientos_caja;
DROP POLICY IF EXISTS "Users can update their own movements" ON movimientos_caja;
DROP POLICY IF EXISTS "Users can delete their own movements" ON movimientos_caja;

-- Crear nuevas políticas más permisivas
CREATE POLICY "Users can view all movements" ON movimientos_caja
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert movements" ON movimientos_caja
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own movements" ON movimientos_caja
  FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own movements" ON movimientos_caja
  FOR DELETE USING (auth.uid() = usuario_id);

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'movimientos_caja';