-- Script SQL para configurar las tablas del sistema POS en Supabase
-- Ejecuta estos comandos en el SQL Editor de Supabase (uno por uno)

-- Si ya tienes la tabla productos creada, ejecuta SOLO estas líneas para agregar las nuevas columnas:
ALTER TABLE productos ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS notas TEXT;

-- Si necesitas crear la tabla desde cero (SOLO si no existe), usa este bloque:
-- CREATE TABLE productos (
--   id SERIAL PRIMARY KEY,
--   nombre TEXT NOT NULL,
--   precio NUMERIC NOT NULL,
--   stock INTEGER NOT NULL,
--   descripcion TEXT,
--   notas TEXT
-- );

-- =====================================================================================
-- SCRIPT COMPLETO PARA CREAR TODAS LAS TABLAS (Ejecutar si no existen)
-- =====================================================================================

-- Crear tabla productos
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio NUMERIC NOT NULL,
  stock INTEGER NOT NULL,
  descripcion TEXT,
  notas TEXT
);

-- Crear tabla ventas
CREATE TABLE IF NOT EXISTS ventas (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMP DEFAULT NOW(),
  total NUMERIC NOT NULL,
  notas TEXT
);

-- Crear tabla venta_productos
CREATE TABLE IF NOT EXISTS venta_productos (
  id SERIAL PRIMARY KEY,
  venta_id INTEGER REFERENCES ventas(id),
  producto_id INTEGER REFERENCES productos(id),
  cantidad INTEGER NOT NULL,
  subtotal NUMERIC NOT NULL
);

-- Crear tabla movimientos_caja
CREATE TABLE IF NOT EXISTS movimientos_caja (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto', 'fiado', 'pago_fiado')),
  descripcion TEXT NOT NULL,
  monto NUMERIC NOT NULL,
  metodo_pago TEXT,
  categoria TEXT,
  notas TEXT,
  usuario_id UUID REFERENCES auth.users(id)
);

-- Crear tabla clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  notas TEXT
);

-- Crear tabla ventas_fiadas (ventas al fiado)
CREATE TABLE IF NOT EXISTS ventas_fiadas (
  id SERIAL PRIMARY KEY,
  venta_id INTEGER REFERENCES ventas(id),
  cliente_id INTEGER REFERENCES clientes(id),
  fecha_vencimiento DATE,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'vencida')),
  notas TEXT
);

-- Crear tabla pagos_fiados
CREATE TABLE IF NOT EXISTS pagos_fiados (
  id SERIAL PRIMARY KEY,
  venta_fiada_id INTEGER REFERENCES ventas_fiadas(id),
  fecha TIMESTAMP DEFAULT NOW(),
  monto NUMERIC NOT NULL,
  metodo_pago TEXT,
  notas TEXT,
  usuario_id UUID REFERENCES auth.users(id)
);

-- =====================================================================================
-- SCRIPT PARA VERIFICAR QUE TODAS LAS TABLAS EXISTEN
-- =====================================================================================

-- Ejecuta esta consulta para verificar que todas las tablas están creadas:
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('productos', 'ventas', 'venta_productos', 'movimientos_caja', 'clientes', 'ventas_fiadas', 'pagos_fiados', 'cliente_notas', 'roles', 'user_roles')
ORDER BY table_name;

-- =====================================================================================
-- SCRIPT PARA CORREGIR RESTRICCIONES EN movimientos_caja (si hay errores)
-- =====================================================================================

-- Ver la restricción actual
-- SELECT conname, conrelid::regclass, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'movimientos_caja'::regclass AND contype = 'c';

-- Corregir la restricción si es necesario
-- ALTER TABLE movimientos_caja DROP CONSTRAINT IF EXISTS movimientos_caja_tipo_check;
-- ALTER TABLE movimientos_caja ADD CONSTRAINT movimientos_caja_tipo_check CHECK (tipo IN ('ingreso', 'gasto', 'fiado', 'pago_fiado'));

-- =====================================================================================
-- TABLAS DE AUTENTICACIÓN Y ROLES
-- =====================================================================================

-- Crear tabla roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla user_roles (relaciona usuarios de auth.users con roles)
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role_id)
);

-- Insertar roles por defecto
INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrador con acceso completo al sistema'),
  ('cajero', 'Cajero con acceso limitado para operaciones diarias')
ON CONFLICT (name) DO NOTHING;

-- =====================================================================================
-- POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- =====================================================================================

-- Asegurar que la columna usuario_id existe antes de configurar políticas
ALTER TABLE movimientos_caja ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id);
ALTER TABLE pagos_fiados ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id);
ALTER TABLE movimientos_caja ADD COLUMN IF NOT EXISTS metodo_pago TEXT;
ALTER TABLE pagos_fiados ADD COLUMN IF NOT EXISTS metodo_pago TEXT;

-- Habilitar RLS en las tablas
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_fiados ENABLE ROW LEVEL SECURITY;

-- Políticas para roles (todos pueden leer)
DROP POLICY IF EXISTS "Roles are viewable by authenticated users" ON roles;
CREATE POLICY "Roles are viewable by authenticated users" ON roles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Función para verificar si un usuario es admin (sin recursión)
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid AND r.name = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;
CREATE POLICY "Admins can view all user roles" ON user_roles
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL USING (is_admin());

-- Políticas para cliente_notas
DROP POLICY IF EXISTS "Users can view client notes" ON cliente_notas;
CREATE POLICY "Users can view client notes" ON cliente_notas
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert client notes" ON cliente_notas;
CREATE POLICY "Users can insert client notes" ON cliente_notas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own client notes" ON cliente_notas;
CREATE POLICY "Users can update their own client notes" ON cliente_notas
  FOR UPDATE USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Admins can delete client notes" ON cliente_notas;
CREATE POLICY "Admins can delete client notes" ON cliente_notas
  FOR DELETE USING (is_admin());

-- Políticas para movimientos_caja (permitir acceso básico para debugging)
DROP POLICY IF EXISTS "Authenticated users can view all movements" ON movimientos_caja;
CREATE POLICY "Authenticated users can view all movements" ON movimientos_caja
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert movements" ON movimientos_caja;
CREATE POLICY "Users can insert movements" ON movimientos_caja
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own movements" ON movimientos_caja;
CREATE POLICY "Users can update their own movements" ON movimientos_caja
  FOR UPDATE USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Admins can manage all movements" ON movimientos_caja;
CREATE POLICY "Admins can manage all movements" ON movimientos_caja
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Users can delete their own movements" ON movimientos_caja;
CREATE POLICY "Users can delete their own movements" ON movimientos_caja
  FOR DELETE USING (auth.uid() = usuario_id OR is_admin());

-- Políticas para pagos_fiados
DROP POLICY IF EXISTS "Authenticated users can view all payments" ON pagos_fiados;
CREATE POLICY "Authenticated users can view all payments" ON pagos_fiados
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert their own payments" ON pagos_fiados;
CREATE POLICY "Users can insert their own payments" ON pagos_fiados
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Admins can manage all payments" ON pagos_fiados;
CREATE POLICY "Admins can manage all payments" ON pagos_fiados
  FOR ALL USING (is_admin());

-- =====================================================================================
-- FUNCIONES HELPER PARA AUTENTICACIÓN
-- =====================================================================================

-- Función para verificar si un usuario es admin (sin recursión)
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid AND r.name = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario tiene un rol específico
CREATE OR REPLACE FUNCTION has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener los roles de un usuario
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid UUID)
RETURNS TABLE(role_name TEXT, role_description TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT r.name, r.description
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================================
-- VISTAS PARA DASHBOARD Y ESTADÍSTICAS
-- =====================================================================================

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

-- Las vistas heredan las políticas RLS de las tablas subyacentes
-- No necesitamos políticas adicionales ya que movimientos_caja ya tiene RLS configurado

-- =====================================================================================
-- TRIGGER PARA ASIGNAR ROL POR DEFECTO A NUEVOS USUARIOS
-- =====================================================================================

-- Función para asignar rol por defecto (mejorada)
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Asignar rol de 'cajero' por defecto a nuevos usuarios
  INSERT INTO user_roles (user_id, role_id, assigned_by)
  VALUES (NEW.id, (SELECT id FROM roles WHERE name = 'cajero'), NEW.id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para nuevos usuarios
DROP TRIGGER IF EXISTS assign_default_role_trigger ON auth.users;
CREATE TRIGGER assign_default_role_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION assign_default_role();