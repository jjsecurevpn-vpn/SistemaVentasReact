# ANÁLISIS COMPLETO DEL PROBLEMA DE ZONA HORARIA

## 🎯 **Problema Identificado**

Los movimientos de caja muestran horas incorrectas. Cuando el usuario registra un movimiento a las 22:55, aparece como "21 de nov de 2025, 01:50 a. m." (día siguiente, hora incorrecta).

## 🔍 **Análisis Técnico**

### 1. **Flujo de Datos Actual**
```
Usuario registra movimiento → PostgreSQL (NOW()) → UTC → Supabase → JavaScript → Formateo
     22:55 (ART)     →    01:55 (UTC+1)    →  ISO string  →  parse   →  display
```

### 2. **Problema Específico**
- **Navegador**: America/Buenos_Aires (GMT-3)
- **PostgreSQL**: Guarda como TIMESTAMP (UTC)
- **JavaScript**: Aplica conversión doble de zona horaria

### 3. **Causa Raíz**
La función `formatDateTime` especificaba `timeZone: "America/Argentina/Buenos_Aires"`, causando:
1. Fecha llega como UTC desde BD
2. JavaScript la convierte a zona horaria Argentina
3. Resultado: hora incorrecta

## ✅ **Solución Implementada**

### 1. **Cambio en Base de Datos**
```sql
-- Cambiar columna fecha a TIMESTAMPTZ
ALTER TABLE movimientos_caja ALTER COLUMN fecha TYPE TIMESTAMPTZ USING fecha AT TIME ZONE 'UTC';
```

### 2. **Cambio en Formateo (utils/api.ts)**
```javascript
// ANTES (incorrecto)
return date.toLocaleString("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires", // ❌ Conversión doble
});

// DESPUÉS (correcto)
return date.toLocaleString("es-AR", {
  // Sin timeZone - usa zona horaria del navegador
});
```

## 🧪 **Verificación**

Para verificar que funciona correctamente:

1. **Ejecutar script SQL** en Supabase para cambiar tipo de columna
2. **Crear movimiento de prueba** y verificar hora
3. **Comparar** hora mostrada vs hora real

## 📋 **Script SQL a Ejecutar**

```sql
-- Cambiar la columna fecha a TIMESTAMPTZ
ALTER TABLE movimientos_caja ALTER COLUMN fecha TYPE TIMESTAMPTZ USING fecha AT TIME ZONE 'UTC';

-- Actualizar vista
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
```

## 🎯 **Resultado Esperado**

Después de aplicar los cambios:
- ✅ Horas se muestran correctamente en zona horaria del usuario
- ✅ Nuevos movimientos guardan hora correcta
- ✅ Movimientos existentes se convierten automáticamente
- ✅ Compatible con diferentes zonas horarias

## 🚨 **Importante**

Este problema afecta a **todos los timestamps** en la aplicación. Si hay otras tablas con columnas de fecha, deberían revisarse también.