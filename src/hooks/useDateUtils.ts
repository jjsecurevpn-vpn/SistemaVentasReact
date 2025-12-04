/**
 * Hook centralizado para manejo de fechas y zonas horarias
 * Todas las fechas en Supabase están en UTC, este hook las convierte a hora local Argentina (UTC-3)
 */

// Zona horaria de Argentina - SIEMPRE usar esta para consistencia
const TIMEZONE_ARGENTINA = 'America/Argentina/Buenos_Aires';

// Convertir fecha ISO (UTC) a fecha local como string YYYY-MM-DD
export const getLocalDateString = (isoString: string): string => {
  const date = new Date(isoString);
  // Usar Intl para obtener la fecha en zona horaria de Argentina
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE_ARGENTINA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date); // Formato YYYY-MM-DD
};

// Convertir un objeto Date a string YYYY-MM-DD en zona horaria Argentina
export const formatDateToString = (date: Date): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE_ARGENTINA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
};

// Obtener la fecha de hoy como string YYYY-MM-DD en Argentina
export const getTodayString = (): string => {
  return formatDateToString(new Date());
};

// Obtener hora local en Argentina desde una fecha ISO
export const getLocalTimeString = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('es-AR', { 
    timeZone: TIMEZONE_ARGENTINA,
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

// Obtener inicio y fin de un mes específico
export const getMonthRange = (year: number, month: number): { start: string; end: string } => {
  const fechaInicio = new Date(year, month - 1, 1);
  const fechaFin = new Date(year, month, 0); // Último día del mes
  return {
    start: formatDateToString(fechaInicio),
    end: formatDateToString(fechaFin)
  };
};

// Verificar si una fecha ISO está dentro de un rango de mes/año
export const isDateInMonth = (isoString: string, year: number, month: number): boolean => {
  const fechaLocal = getLocalDateString(isoString);
  const { start, end } = getMonthRange(year, month);
  return fechaLocal >= start && fechaLocal <= end;
};

// Verificar si una fecha ISO es hoy
export const isToday = (isoString: string): boolean => {
  return getLocalDateString(isoString) === getTodayString();
};

// Verificar si una fecha ISO es ayer
export const isYesterday = (isoString: string): boolean => {
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  return getLocalDateString(isoString) === formatDateToString(ayer);
};

// Obtener fecha completa formateada para mostrar en Argentina
export const getFormattedDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-AR', {
    timeZone: TIMEZONE_ARGENTINA,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Obtener nombre del día y fecha para agrupar movimientos
export const getGroupDateLabel = (dateKey: string): string => {
  // dateKey viene en formato YYYY-MM-DD, crear fecha a mediodía para evitar problemas
  const [year, month, day] = dateKey.split('-').map(Number);
  const fecha = new Date(year, month - 1, day, 12, 0, 0);
  
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const hoyStr = getTodayString();
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const ayerStr = formatDateToString(ayer);

  const diaNombre = diasSemana[fecha.getDay()];
  const diaNum = fecha.getDate();
  const mesNombre = meses[fecha.getMonth()];

  if (dateKey === hoyStr) return `Hoy - ${diaNombre}, ${diaNum} de ${mesNombre}`;
  if (dateKey === ayerStr) return `Ayer - ${diaNombre}, ${diaNum} de ${mesNombre}`;
  return `${diaNombre}, ${diaNum} de ${mesNombre}`;
};

// Hook para usar en componentes React
export const useDateUtils = () => {
  return {
    getLocalDateString,
    formatDateToString,
    getTodayString,
    getMonthRange,
    isDateInMonth,
    isToday,
    isYesterday,
    getLocalTimeString,
    getFormattedDate,
    getGroupDateLabel
  };
};

export default useDateUtils;
