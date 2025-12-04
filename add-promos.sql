-- Tablas para sistema de promociones/combo
-- Ejecutar en el editor SQL de Supabase

-- Tabla principal de promociones
CREATE TABLE IF NOT EXISTS promos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  precio_promocional NUMERIC NOT NULL CHECK (precio_promocional >= 0),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_inicio DATE,
  fecha_fin DATE,
  limite_uso INTEGER,
  usos_registrados INTEGER NOT NULL DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger simple para mantener updated_at
CREATE OR REPLACE FUNCTION update_promos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS promos_updated_at ON promos;
CREATE TRIGGER promos_updated_at
BEFORE UPDATE ON promos
FOR EACH ROW
EXECUTE PROCEDURE update_promos_updated_at();

-- Productos que pertenecen a la promo
CREATE TABLE IF NOT EXISTS promo_productos (
  id SERIAL PRIMARY KEY,
  promo_id INTEGER NOT NULL REFERENCES promos(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(promo_id, producto_id)
);

-- Vista rápida para inspeccionar combos completos
CREATE OR REPLACE VIEW promos_con_productos AS
SELECT
  p.*,
  json_agg(
    json_build_object(
      'producto_id', pp.producto_id,
      'cantidad', pp.cantidad,
      'producto', pr
    )
    ORDER BY pr.nombre
  ) AS productos
FROM promos p
LEFT JOIN promo_productos pp ON p.id = pp.promo_id
LEFT JOIN productos pr ON pr.id = pp.producto_id
GROUP BY p.id;
