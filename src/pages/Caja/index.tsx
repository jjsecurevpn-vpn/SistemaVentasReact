import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../hooks/useNotification';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import CajaHeader from './CajaHeader';
import CajaStats from './CajaStats';
import CajaFilters from './CajaFilters';
import CajaMovementsList from './CajaMovementsList';
import CajaMovementForm from './CajaMovementForm';
import CajaDeleteModal from './CajaDeleteModal';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface Movimiento {
  id: number;
  tipo: string;
  descripcion: string;
  monto: number;
  fecha: string;
  usuario_id: string;
  venta_id?: number;
  cliente_id?: number;
  usuario?: {
    id: string;
    email: string;
  };
  cliente?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  venta?: {
    id: number;
    total: number;
    fecha: string;
    productos: Array<{
      producto_id: number;
      nombre: string;
      cantidad: number;
      subtotal: number;
    }>;
  };
  created_at: string;
  movimientosOriginales?: Movimiento[]; // Para movimientos consolidados
}

interface DeudaPendiente {
  id: number;
  venta_id: number;
  cliente_id: number;
  estado: string;
  venta: {
    id: number;
    fecha: string;
    total: number;
  };
  cliente?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
}

const Caja: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { showNotification } = useNotification();

  // Estados principales
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [deudasPendientes, setDeudasPendientes] = useState<DeudaPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Estados para filtro de mes/año
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [año, setAño] = useState<number>(new Date().getFullYear());

  // Array de meses en español
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Funciones para cambiar mes
  const handleMesAnterior = () => {
    if (mes === 1) {
      setMes(12);
      setAño(año - 1);
    } else {
      setMes(mes - 1);
    }
  };

  const handleMesSiguiente = () => {
    if (mes === 12) {
      setMes(1);
      setAño(año + 1);
    } else {
      setMes(mes + 1);
    }
  };

  const handleMesActual = () => {
    const hoy = new Date();
    setMes(hoy.getMonth() + 1);
    setAño(hoy.getFullYear());
  };

  // Verificar si estamos en el mes actual
  const isCurrentMonth = mes === new Date().getMonth() + 1 && año === new Date().getFullYear();

  // Estados de filtros
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [usuarioFilter, setUsuarioFilter] = useState('');

  // Estados de modales
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [editingMovement, setEditingMovement] = useState<Movimiento | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMovement, setDeletingMovement] = useState<Movimiento | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cargar movimientos
  const loadMovimientos = async () => {
    try {
      setLoading(true);
      console.log('Loading movimientos from movimientos_caja_con_usuario...');
      
      const { data, error } = await supabase
        .from('movimientos_caja_con_usuario')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error loading movimientos:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        setMovimientos([]);
        setLoading(false);
        return;
      }

      // Obtener IDs únicos de ventas y clientes que necesitamos enriquecer
      const ventaIds = [...new Set(data.map((m: any) => m.venta_id).filter(Boolean))];
      const clienteIds = [...new Set(data.map((m: any) => m.cliente_id).filter(Boolean))];

      // Cargar datos relacionados en paralelo
      const [{ data: ventasData }, { data: clientesData }] = await Promise.all([
        ventaIds.length > 0
          ? supabase
              .from('ventas')
              .select('id, total, fecha, venta_productos(producto_id, productos(id, nombre), cantidad)')
              .in('id', ventaIds)
          : Promise.resolve({ data: [] }),
        clienteIds.length > 0
          ? supabase
              .from('clientes')
              .select('id, nombre, apellido, email')
              .in('id', clienteIds)
          : Promise.resolve({ data: [] })
      ]);

      // Crear mapas para lookup rápido
      const ventasMap = new Map(ventasData?.map(v => [v.id, v]) || []);
      const clientesMap = new Map(clientesData?.map(c => [c.id, c]) || []);

      // Enriquecer movimientos con datos de ventas y clientes
      const movimientosEnriquecidos: Movimiento[] = data.map((movimiento: any) => {
        const movimientoEnriquecido: Movimiento = {
          id: movimiento.id,
          tipo: movimiento.tipo,
          descripcion: movimiento.descripcion,
          monto: movimiento.monto,
          fecha: movimiento.fecha,
          usuario_id: movimiento.usuario_id,
          venta_id: movimiento.venta_id,
          cliente_id: movimiento.cliente_id,
          created_at: movimiento.fecha
        };

        // El usuario viene como JSON de la vista
        if (movimiento.usuario && typeof movimiento.usuario === 'object') {
          movimientoEnriquecido.usuario = {
            id: movimiento.usuario.id,
            email: movimiento.usuario.email || ''
          };
        }

        if (movimiento.venta_id) {
          const venta = ventasMap.get(movimiento.venta_id);
          if (venta) {
            movimientoEnriquecido.venta = {
              id: venta.id,
              total: venta.total,
              fecha: venta.fecha,
              productos: venta.venta_productos?.map((vp: any) => ({
                producto_id: vp.producto_id,
                nombre: vp.productos?.nombre || '',
                cantidad: vp.cantidad,
                subtotal: 0
              })) || []
            };
          }
        }

        if (movimiento.cliente_id) {
          const cliente = clientesMap.get(movimiento.cliente_id);
          if (cliente) {
            movimientoEnriquecido.cliente = cliente;
          }
        }

        return movimientoEnriquecido;
      });

      console.log('Movimientos loaded:', movimientosEnriquecidos.length, 'records');
      if (movimientosEnriquecidos.length > 0) {
        console.log('Sample movimiento:', movimientosEnriquecidos[0]);
      }

      setMovimientos(movimientosEnriquecidos);
    } catch (error) {
      console.error('Error loading movimientos:', error);
      showNotification('Error al cargar los movimientos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cargar deudas pendientes
  const loadDeudasPendientes = async () => {
    try {
      console.log('Loading deudas pendientes...');
      // Obtener todas las ventas_fiadas que aún tienen saldo pendiente
      const { data: ventasFiadas, error: ventasFiadasError } = await supabase
        .from('ventas_fiadas')
        .select('id, cliente_id, venta_id, estado')
        .eq('estado', 'pendiente');

      if (ventasFiadasError) {
        console.error('Error loading ventas_fiadas:', ventasFiadasError);
        throw ventasFiadasError;
      }

      if (!ventasFiadas || ventasFiadas.length === 0) {
        setDeudasPendientes([]);
        return;
      }

      // Obtener los IDs de ventas y clientes
      const ventaIds = ventasFiadas.map(vf => vf.venta_id);
      const clienteIds = [...new Set(ventasFiadas.map(vf => vf.cliente_id))];

      // Obtener información de ventas y clientes
      const [ventasData, clientesData] = await Promise.all([
        supabase
          .from('ventas')
          .select('id, total, fecha')
          .in('id', ventaIds),
        supabase
          .from('clientes')
          .select('id, nombre, apellido, email')
          .in('id', clienteIds)
      ]);

      if (ventasData.error) {
        console.error('Error loading ventas:', ventasData.error);
        throw ventasData.error;
      }

      if (clientesData.error) {
        console.error('Error loading clientes:', clientesData.error);
        throw clientesData.error;
      }

      // Crear mapa de ventas y clientes
      const ventasMap = new Map(ventasData.data?.map(v => [v.id, v]) || []);
      const clientesMap = new Map(clientesData.data?.map(c => [c.id, c]) || []);

      // Construir deudas pendientes
      const deudas = ventasFiadas.map(vf => {
        const venta = ventasMap.get(vf.venta_id);
        const cliente = clientesMap.get(vf.cliente_id);

        return {
          id: vf.id,
          venta_id: vf.venta_id,
          cliente_id: vf.cliente_id,
          estado: vf.estado,
          venta: {
            id: venta?.id || vf.venta_id,
            fecha: venta?.fecha || new Date().toISOString(),
            total: venta?.total || 0,
          },
          cliente: cliente ? {
            id: cliente.id,
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            email: cliente.email
          } : undefined
        };
      });

      console.log('Deudas pendientes loaded:', deudas.length, 'records');
      setDeudasPendientes(deudas);
    } catch (error) {
      console.error('Error loading deudas pendientes:', error);
      showNotification('Error al cargar las deudas pendientes', 'error');
    }
  };

  useEffect(() => {
    loadMovimientos();
    loadDeudasPendientes();
  }, []);

  // Suscripciones en tiempo real para actualizar automáticamente cuando se registren pagos
  const cajaSubscriptions = useMemo(
    () => [
      { table: "movimientos_caja" },
      { table: "ventas_fiadas" },
      { table: "pagos_fiados" },
    ],
    []
  );

  useRealtimeSubscription("caja-realtime", cajaSubscriptions, (payload) => {
    console.log('🔄 Realtime update received in Caja:', payload);
    console.log('Payload details:', {
      eventType: payload.eventType,
      table: payload.table,
      new: payload.new,
      old: payload.old
    });
    loadMovimientos();
    loadDeudasPendientes();
  });

  // Listener para evento personalizado de recarga
  useEffect(() => {
    const handleReloadEvent = () => {
      console.log('🔄 Recarga forzada de movimientos desde evento personalizado');
      loadMovimientos();
      loadDeudasPendientes();
    };

    const handlePagoRegistrado = (event: CustomEvent) => {
      console.log('💰 Pago registrado detectado:', event.detail);
      // Pequeño delay para asegurar que la transacción se complete
      setTimeout(() => {
        console.log('🔄 Recargando movimientos después de pago registrado');
        loadMovimientos();
        loadDeudasPendientes();
      }, 500);
    };

    window.addEventListener('reload-caja-movimientos', handleReloadEvent);
    window.addEventListener('pago-registrado', handlePagoRegistrado as EventListener);

    return () => {
      window.removeEventListener('reload-caja-movimientos', handleReloadEvent);
      window.removeEventListener('pago-registrado', handlePagoRegistrado as EventListener);
    };
  }, []);

  // Calcular estadísticas
  const stats = useMemo(() => {
    // Filtrar movimientos por mes y año SOLO para el mes seleccionado
    // Usar el mismo método de comparación que Dashboard para consistencia
    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0, 23, 59, 59);
    
    const fechaInicioISO = fechaInicio.toISOString().split('T')[0];
    const fechaFinISO = fechaFin.toISOString().split('T')[0];

    const movimientosMes = movimientos.filter(movimiento => {
      const fechaStr = movimiento.fecha.split('T')[0]; // Obtener solo la fecha sin hora
      return fechaStr >= fechaInicioISO && fechaStr <= fechaFinISO;
    });

    // INGRESOS DEL MES: solo ventas (ingreso) + pagos de fiados del mes
    const totalIngresosMes = movimientosMes
      .filter(m => m.tipo === 'ingreso' || m.tipo === 'pago_fiado')
      .reduce((sum, m) => sum + m.monto, 0);

    // GASTOS DEL MES: solo gastos del mes
    const totalGastosMes = movimientosMes
      .filter(m => m.tipo === 'gasto')
      .reduce((sum, m) => sum + m.monto, 0);

    // DINERO DISPONIBLE TOTAL: suma acumulada de todos los ingresos - todos los gastos
    // Sin importar el mes seleccionado, es el saldo total del negocio
    const dineroDisponibleTotal = movimientos
      .reduce((sum, m) => {
        if (m.tipo === 'ingreso' || m.tipo === 'pago_fiado') {
          return sum + m.monto;
        } else if (m.tipo === 'gasto') {
          return sum - m.monto;
        }
        return sum;
      }, 0);

    // Calcular dinero fiado basado en deudas pendientes REALES
    const totalFiado = deudasPendientes.reduce((sum, deuda) => sum + deuda.venta.total, 0);

    const totalPagosFiadoMes = movimientosMes
      .filter(m => m.tipo === 'pago_fiado')
      .reduce((sum, m) => sum + m.monto, 0);

    const dineroPendienteFiado = totalFiado;

    return {
      ingresos: totalIngresosMes,
      gastos: totalGastosMes,
      dineroFiado: totalFiado,
      pagosFiado: totalPagosFiadoMes,
      dineroDisponible: dineroDisponibleTotal,
      dineroPendienteFiado
    };
  }, [movimientos, deudasPendientes, mes, año]);

  // Estado para movimientos filtrados y procesados
  const [filteredMovimientos, setFilteredMovimientos] = useState<Movimiento[]>([]);

  // Procesar movimientos filtrados con información adicional
  useEffect(() => {
    const processMovimientos = async () => {
      // Filtrar movimientos por mes/año primero
      let movimientosPorMes = movimientos.filter(movimiento => {
        const fechaMovimiento = new Date(movimiento.fecha);
        return fechaMovimiento.getMonth() + 1 === mes && fechaMovimiento.getFullYear() === año;
      });

      // Luego aplicar filtros adicionales
      let filtered = movimientosPorMes.filter(movimiento => {
        const searchLower = searchTerm.toLowerCase().trim();
        
        // Si no hay término de búsqueda, coincide
        if (!searchLower) {
          const matchesTypes = selectedTypes.length === 0 || selectedTypes.includes(movimiento.tipo);
          const matchesFechaDesde = !fechaDesde || new Date(movimiento.fecha) >= new Date(fechaDesde);
          const matchesFechaHasta = !fechaHasta || new Date(movimiento.fecha) <= new Date(fechaHasta);
          const matchesUsuario = !usuarioFilter || movimiento.usuario?.email === usuarioFilter;
          return matchesTypes && matchesFechaDesde && matchesFechaHasta && matchesUsuario;
        }
        
        // Buscar en descripción del movimiento
        const matchesDescription = movimiento.descripcion.toLowerCase().includes(searchLower);
        
        // Buscar en cliente si existe
        let matchesCliente = false;
        if (movimiento.cliente) {
          const clienteNombre = `${movimiento.cliente.nombre} ${movimiento.cliente.apellido || ''}`.toLowerCase();
          matchesCliente = clienteNombre.includes(searchLower);
        }
        
        // Buscar en productos de la venta si existen
        let matchesProductos = false;
        if (movimiento.venta?.productos && movimiento.venta.productos.length > 0) {
          matchesProductos = movimiento.venta.productos.some(p => 
            p.nombre.toLowerCase().includes(searchLower)
          );
        }
        
        // Retornar true solo si encuentra en ALGUNO de los campos (AND lógica)
        const matchesSearch = matchesDescription || matchesCliente || matchesProductos;
        
        const matchesTypes = selectedTypes.length === 0 || selectedTypes.includes(movimiento.tipo);
        const matchesFechaDesde = !fechaDesde || new Date(movimiento.fecha) >= new Date(fechaDesde);
        const matchesFechaHasta = !fechaHasta || new Date(movimiento.fecha) <= new Date(fechaHasta);
        const matchesUsuario = !usuarioFilter || movimiento.usuario?.email === usuarioFilter;

        return matchesSearch && matchesTypes && matchesFechaDesde && matchesFechaHasta && matchesUsuario;
      });

      // Recopilar IDs para consultas eficientes
      const ventaFiadaIds: number[] = [];
      const ventaIds: number[] = [];
      const productoIds: Set<number> = new Set();

      // Primera pasada: recopilar todos los IDs necesarios
      filtered.forEach(movimiento => {
        // IDs de ventas al fiado (ahora es ventaFiada_id en la descripción)
        if (movimiento.tipo === 'fiado' && movimiento.descripcion.includes('Venta al fiado #')) {
          const match = movimiento.descripcion.match(/Venta al fiado #(\d+)/);
          if (match) {
            const ventaFiadaId = parseInt(match[1]);
            ventaFiadaIds.push(ventaFiadaId);
          }
        }

        // IDs de pagos al fiado (usa ventaFiada_id)
        if (movimiento.tipo === 'pago_fiado' && movimiento.descripcion.includes('Pago de deuda #')) {
          const match = movimiento.descripcion.match(/Pago de deuda #(\d+)/);
          if (match) {
            const ventaFiadaId = parseInt(match[1]);
            ventaFiadaIds.push(ventaFiadaId);
          }
        }

        // IDs de ventas normales
        if (movimiento.tipo === 'ingreso' && movimiento.descripcion.includes('Venta #')) {
          const match = movimiento.descripcion.match(/Venta #(\d+)/);
          if (match) ventaIds.push(parseInt(match[1]));
        }
      });

      // Consultas eficientes en paralelo
      const [ventasFiadasData, ventasData] = await Promise.all([
        // Obtener todas las ventas_fiadas de una vez
        ventaFiadaIds.length > 0 ? supabase
          .from('ventas_fiadas')
          .select('id, cliente_id, venta_id')
          .in('id', ventaFiadaIds) : Promise.resolve({ data: [] }),

        // Obtener todas las ventas de una vez (incluyendo IDs de ventas desde ventas_fiadas)
        ventaIds.length > 0 ? supabase
          .from('ventas')
          .select('id, total, fecha')
          .in('id', ventaIds) : Promise.resolve({ data: [] })
      ]);

      // Extraer venta_ids de ventas_fiadas para obtener sus productos
      const ventaIdsFromFiadas = ventasFiadasData.data?.map(vf => vf.venta_id) || [];
      const allVentaIds = [...new Set([...ventaIds, ...ventaIdsFromFiadas])];

      // Ahora obtener los productos con los IDs correctos
      const { data: ventaProductosDataContent } = allVentaIds.length > 0 ? await supabase
        .from('venta_productos')
        .select('venta_id, producto_id, cantidad, subtotal')
        .in('venta_id', allVentaIds) : { data: [] };

      // Crear mapas para lookup rápido
      const ventasFiadasMap = new Map(ventasFiadasData.data?.map(vf => [vf.id, vf]) || []);
      const ventasMap = new Map(ventasData.data?.map(v => [v.id, v]) || []);
      const ventaProductosMap = new Map<number, any[]>();

      // Agrupar productos por venta_id
      ventaProductosDataContent?.forEach(vp => {
        if (!ventaProductosMap.has(vp.venta_id)) {
          ventaProductosMap.set(vp.venta_id, []);
        }
        ventaProductosMap.get(vp.venta_id)!.push(vp);
        productoIds.add(vp.producto_id);
      });

      // Obtener clientes únicos
      const clienteIdsArray = Array.from(new Set(ventasFiadasData.data?.map(vf => vf.cliente_id) || []));
      
      // Obtener usuarios únicos que registraron movimientos
      const usuarioIdsArray = Array.from(new Set(filtered.map(m => m.usuario_id).filter((id): id is string => id !== undefined && id !== null)));
      
      const [clientesInfo, productosInfo, usuariosInfo] = await Promise.all([
        clienteIdsArray.length > 0 ? supabase
          .from('clientes')
          .select('id, nombre, apellido, email')
          .in('id', clienteIdsArray) : Promise.resolve({ data: [] }),

        Array.from(productoIds).length > 0 ? supabase
          .from('productos')
          .select('id, nombre')
          .in('id', Array.from(productoIds)) : Promise.resolve({ data: [] }),
        
        usuarioIdsArray.length > 0 ? supabase
          .from('auth.users')
          .select('id, email')
          .in('id', usuarioIdsArray) : Promise.resolve({ data: [] })
      ]);

      const clientesMap = new Map(clientesInfo.data?.map(c => [c.id, c]) || []);
      const productosMap = new Map(productosInfo.data?.map(p => [p.id, p.nombre]) || []);
      const usuariosMap = new Map(usuariosInfo.data?.map(u => [u.id, u]) || []);

      // Procesar movimientos con datos enriquecidos
      const processedMovimientos = filtered.map(movimiento => {
        try {
          const usuario = movimiento.usuario_id ? usuariosMap.get(movimiento.usuario_id) : undefined;
          
          // Procesar pagos al fiado
          if (movimiento.tipo === 'pago_fiado' && movimiento.descripcion.includes('Pago de deuda #')) {
            const match = movimiento.descripcion.match(/Pago de deuda #(\d+)/);
            if (match) {
              const ventaFiadaId = parseInt(match[1]);
              const ventaFiada = ventasFiadasMap.get(ventaFiadaId);

              if (ventaFiada) {
                const cliente = clientesMap.get(ventaFiada.cliente_id);
                const productos = ventaProductosMap.get(ventaFiada.venta_id) || [];
                const venta = ventasMap.get(ventaFiada.venta_id);

                return {
                  ...movimiento,
                  usuario: usuario ? { id: usuario.id, email: usuario.email } : movimiento.usuario,
                  cliente: cliente ? {
                    id: cliente.id,
                    nombre: cliente.nombre,
                    apellido: cliente.apellido,
                    email: cliente.email
                  } : undefined,
                  venta: {
                    id: venta?.id || ventaFiada.venta_id,
                    total: venta?.total || movimiento.monto,
                    fecha: venta?.fecha || movimiento.fecha,
                    productos: productos.map(vp => ({
                      producto_id: vp.producto_id,
                      nombre: productosMap.get(vp.producto_id) || 'Producto desconocido',
                      cantidad: vp.cantidad,
                      subtotal: vp.subtotal
                    }))
                  }
                };
              }
            }
          }

          // Procesar ventas al fiado
          if (movimiento.tipo === 'fiado' && movimiento.descripcion.includes('Venta al fiado #')) {
            const match = movimiento.descripcion.match(/Venta al fiado #(\d+)/);
            if (match) {
              const ventaFiadaId = parseInt(match[1]);
              const ventaFiada = ventasFiadasMap.get(ventaFiadaId);

              if (ventaFiada) {
                const cliente = clientesMap.get(ventaFiada.cliente_id);
                const productos = ventaProductosMap.get(ventaFiada.venta_id) || [];

                return {
                  ...movimiento,
                  usuario: usuario ? { id: usuario.id, email: usuario.email } : movimiento.usuario,
                  cliente: cliente ? {
                    id: cliente.id,
                    nombre: cliente.nombre,
                    apellido: cliente.apellido,
                    email: cliente.email
                  } : undefined,
                  venta: {
                    id: ventaFiada.venta_id,
                    total: movimiento.monto,
                    fecha: movimiento.fecha,
                    productos: productos.map(vp => ({
                      producto_id: vp.producto_id,
                      nombre: productosMap.get(vp.producto_id) || 'Producto #' + vp.producto_id,
                      cantidad: vp.cantidad,
                      subtotal: vp.subtotal
                    }))
                  }
                };
              }
            }
          }

          // Procesar ventas normales
          if (movimiento.tipo === 'ingreso' && movimiento.descripcion.includes('Venta #')) {
            const match = movimiento.descripcion.match(/Venta #(\d+)/);
            if (match) {
              const ventaId = parseInt(match[1]);
              const productos = ventaProductosMap.get(ventaId) || [];
              const venta = ventasMap.get(ventaId);

              return {
                ...movimiento,
                usuario: usuario ? { id: usuario.id, email: usuario.email } : movimiento.usuario,
                venta: {
                  id: venta?.id || ventaId,
                  total: venta?.total || movimiento.monto,
                  fecha: venta?.fecha || movimiento.fecha,
                  productos: productos.map(vp => ({
                    producto_id: vp.producto_id,
                    nombre: productosMap.get(vp.producto_id) || 'Producto desconocido',
                    cantidad: vp.cantidad,
                    subtotal: vp.subtotal
                  }))
                }
              };
            }
          }

          // Para otros movimientos, solo enriquecer usuario si es necesario
          return {
            ...movimiento,
            usuario: usuario ? { id: usuario.id, email: usuario.email } : movimiento.usuario
          };
        } catch (error) {
          console.error('Error procesando movimiento:', movimiento.id, error);
          return movimiento;
        }
      });

      setFilteredMovimientos(processedMovimientos);
    };

    processMovimientos();
  }, [movimientos, searchTerm, selectedTypes, fechaDesde, fechaHasta, usuarioFilter, mes, año]);

  // Usuarios únicos para el filtro
  const usuariosUnicos = useMemo(() => {
    const emails = [...new Set(movimientos.map(m => m.usuario?.email).filter((email): email is string => email !== undefined))];
    return emails.sort();
  }, [movimientos]);

  // Handlers
  const handleNewMovement = () => {
    setEditingMovement(null);
    setShowMovementForm(true);
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setFechaDesde('');
    setFechaHasta('');
    setUsuarioFilter('');
  };

  const handleTypesChange = (types: string[]) => {
    if (types.includes('todos')) {
      // Si se selecciona "todos", seleccionar todos los tipos disponibles
      setSelectedTypes(['ingreso', 'gasto', 'fiado', 'pago_fiado']);
    } else if (types.length === 0) {
      // Si no hay tipos seleccionados, mantener vacío
      setSelectedTypes([]);
    } else {
      // Filtrar cualquier selección de "todos" y usar los tipos seleccionados
      setSelectedTypes(types.filter(t => t !== 'todos'));
    }
  };

  const handleEditMovement = (movimiento: Movimiento) => {
    setEditingMovement(movimiento);
    setShowMovementForm(true);
  };

  const handleDeleteMovement = (movimiento: Movimiento) => {
    setDeletingMovement(movimiento);
    setShowDeleteModal(true);
  };

  const handleSaveMovement = async (movementData: {
    tipo: string;
    descripcion: string;
    monto: number;
    usuario_id: string;
    fecha: string;
  }) => {
    try {
      if (editingMovement) {
        // Actualizar movimiento existente
        const { error } = await supabase
          .from('movimientos_caja')
          .update(movementData)
          .eq('id', editingMovement.id);

        if (error) throw error;
        showNotification('Movimiento actualizado correctamente', 'success');
      } else {
        // Crear nuevo movimiento
        const { error } = await supabase
          .from('movimientos_caja')
          .insert([movementData]);

        if (error) throw error;
        showNotification('Movimiento creado correctamente', 'success');
      }

      setShowMovementForm(false);
      setEditingMovement(null);
      loadMovimientos();
      loadDeudasPendientes();
    } catch (error) {
      console.error('Error saving movement:', error);
      showNotification('Error al guardar el movimiento', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMovement) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('movimientos_caja')
        .delete()
        .eq('id', deletingMovement.id);

      if (error) throw error;

      showNotification('Movimiento eliminado correctamente', 'success');
      setShowDeleteModal(false);
      setDeletingMovement(null);
      loadMovimientos();
      loadDeudasPendientes();
    } catch (error) {
      console.error('Error deleting movement:', error);
      showNotification('Error al eliminar el movimiento', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-neutral-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <CajaHeader
          isAdmin={isAdmin}
          onNewMovement={handleNewMovement}
        />

        {/* Selector de Mes - Profesional y Centrado */}
        <div className="mb-6 flex justify-center w-full box-border">
          <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 border border-emerald-500/30 rounded-xl px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 hover:border-emerald-500/40 transition-all shadow-lg">
            <div className="flex items-center justify-between gap-4 sm:gap-6">
              <button
                onClick={handleMesAnterior}
                className="p-2 sm:p-3 hover:bg-emerald-500/25 rounded-lg transition-colors flex-shrink-0"
                title="Mes anterior"
              >
                <ChevronLeft size={24} className="sm:w-7 sm:h-7 text-emerald-400" />
              </button>

              <div className="text-center flex-1 min-w-0">
                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2 md:mb-3">
                  <Calendar size={18} className="sm:w-5.5 sm:h-5.5 md:w-5.5 md:h-5.5 text-emerald-400" />
                  <p className="text-xs font-semibold text-emerald-400/80 tracking-wide">PERIODO</p>
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-400 mb-1 truncate">
                  {meses[mes - 1]}
                </p>
                <p className="text-sm sm:text-base md:text-lg text-emerald-400/70 font-medium">{año}</p>
              </div>

              <button
                onClick={handleMesSiguiente}
                className="p-2 sm:p-3 hover:bg-emerald-500/25 rounded-lg transition-colors flex-shrink-0"
                title="Mes siguiente"
              >
                <ChevronRight size={24} className="sm:w-7 sm:h-7 text-emerald-400" />
              </button>
            </div>

            {!isCurrentMonth && (
              <button
                onClick={handleMesActual}
                className="w-full mt-4 sm:mt-5 px-4 py-2 sm:py-3 bg-gradient-to-r from-emerald-500/40 to-emerald-600/30 hover:from-emerald-500/50 hover:to-emerald-600/40 text-emerald-300 font-semibold rounded-lg transition-all text-sm"
              >
                Volver a Hoy
              </button>
            )}
          </div>
        </div>

        <CajaStats
          ingresos={stats.ingresos}
          gastos={stats.gastos}
          dineroFiado={stats.dineroFiado}
          pagosFiado={stats.pagosFiado}
          dineroDisponible={stats.dineroDisponible}
          dineroPendienteFiado={stats.dineroPendienteFiado}
        />

        <CajaFilters
          showFilters={showFilters}
          searchTerm={searchTerm}
          selectedTypes={selectedTypes}
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          usuarioFilter={usuarioFilter}
          usuariosUnicos={usuariosUnicos}
          filteredCount={filteredMovimientos.length}
          totalCount={movimientos.length}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onSearchChange={setSearchTerm}
          onTypesChange={handleTypesChange}
          onFechaDesdeChange={setFechaDesde}
          onFechaHastaChange={setFechaHasta}
          onUsuarioFilterChange={setUsuarioFilter}
          onClearAllFilters={handleClearAllFilters}
        />

        <CajaMovementsList
          movimientos={filteredMovimientos}
          isMobile={isMobile}
          onEditMovement={handleEditMovement}
          onDeleteMovement={handleDeleteMovement}
        />

        <CajaMovementForm
          isOpen={showMovementForm}
          movimiento={editingMovement}
          onClose={() => {
            setShowMovementForm(false);
            setEditingMovement(null);
          }}
          onSave={handleSaveMovement}
          currentUserId={user?.id || ''}
        />

        <CajaDeleteModal
          isOpen={showDeleteModal}
          movimiento={deletingMovement}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingMovement(null);
          }}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
};

export default Caja;