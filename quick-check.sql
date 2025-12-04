-- Verificación rápida de RLS
SELECT COUNT(*) as movimientos_visibles FROM movimientos_caja;

-- Si esto devuelve 0 pero sabes que hay movimientos, RLS está bloqueando