-- Agrega las columnas metodo_pago que utiliza la app para guardar el método de pago
-- Ejecuta este script en el editor SQL de Supabase

ALTER TABLE movimientos_caja
  ADD COLUMN IF NOT EXISTS metodo_pago TEXT;

ALTER TABLE pagos_fiados
  ADD COLUMN IF NOT EXISTS metodo_pago TEXT;

-- Opcional: inicializa las columnas con información existente en notas si deseas conservar historiales previos
-- UPDATE movimientos_caja
-- SET metodo_pago = regexp_replace(notas, '.*Método: ([^\.]+).*', '\1')
-- WHERE metodo_pago IS NULL AND notas ILIKE 'Método:%';

-- UPDATE pagos_fiados
-- SET metodo_pago = regexp_replace(notas, '.*Método: ([^\.]+).*', '\1')
-- WHERE metodo_pago IS NULL AND notas ILIKE 'Método:%';
