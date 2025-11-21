-- Verificar políticas RLS actuales para movimientos_caja
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'movimientos_caja';

-- Verificar si RLS está habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'movimientos_caja';

-- Verificar permisos de la tabla
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'movimientos_caja';