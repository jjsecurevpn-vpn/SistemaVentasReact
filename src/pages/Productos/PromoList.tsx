import React from "react";
import { Trash2, ToggleLeft, ToggleRight, Tag } from "lucide-react";
import type { Promo } from "../../utils/api";

interface PromoListProps {
  promos: Promo[];
  loading: boolean;
  onToggle: (promoId: number, active: boolean) => Promise<void>;
  onDelete: (promoId: number) => Promise<void>;
}

const PromoList: React.FC<PromoListProps> = ({ promos, loading, onToggle, onDelete }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-neutral-600 text-sm">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-neutral-700 border-t-neutral-400 mr-2"></div>
        Cargando...
      </div>
    );
  }

  if (!promos.length) {
    return (
      <div className="border border-dashed border-neutral-800/50 rounded-xl p-6 text-center text-neutral-600 text-sm">
        Sin promociones activas
      </div>
    );
  }

  const today = new Date().toISOString().substring(0, 10);

  const getVigenciaBadge = (promo: Promo) => {
    if (promo.fecha_inicio && promo.fecha_inicio > today) {
      return <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">Próxima</span>;
    }
    if (promo.fecha_fin && promo.fecha_fin < today) {
      return <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">Expirada</span>;
    }
    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Activa</span>;
  };

  return (
    <div className="space-y-2">
      {promos.map((promo) => {
        const usosRestantes = promo.limite_uso
          ? Math.max(0, promo.limite_uso - (promo.usos_registrados || 0))
          : null;
        return (
          <div
            key={promo.id}
            className="border border-neutral-800/50 bg-neutral-900/40 rounded-xl p-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={12} className="text-emerald-400" />
                  <h3 className="text-sm font-medium text-white">{promo.nombre}</h3>
                  <span className="text-xs font-semibold text-emerald-400">
                    ${promo.precio_promocional.toFixed(0)}
                  </span>
                  {getVigenciaBadge(promo)}
                </div>
                {promo.descripcion && (
                  <p className="text-xs text-neutral-600 mt-0.5 truncate">
                    {promo.descripcion}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => onToggle(promo.id, !promo.activo)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    promo.activo 
                      ? "text-emerald-400 hover:bg-emerald-500/10" 
                      : "text-neutral-600 hover:bg-neutral-800/50"
                  }`}
                  title={promo.activo ? "Desactivar" : "Activar"}
                >
                  {promo.activo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                </button>
                <button
                  onClick={() => onDelete(promo.id)}
                  className="p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Info */}
            {(promo.fecha_inicio || promo.fecha_fin || usosRestantes !== null) && (
              <div className="flex items-center gap-3 mb-2 text-[10px] text-neutral-600">
                {promo.fecha_inicio && <span>Desde: {promo.fecha_inicio}</span>}
                {promo.fecha_fin && <span>Hasta: {promo.fecha_fin}</span>}
                {usosRestantes !== null && <span>Usos: {usosRestantes}/{promo.limite_uso}</span>}
              </div>
            )}

            {/* Products */}
            <div className="flex flex-wrap gap-1.5">
              {promo.promo_productos?.map((item) => (
                <div
                  key={`${promo.id}-${item.producto_id}`}
                  className="flex items-center gap-1.5 bg-neutral-800/40 rounded-lg px-2 py-1"
                >
                  <span className="text-xs text-neutral-400">
                    {item.producto?.nombre || `#${item.producto_id}`}
                  </span>
                  <span className="text-[10px] text-neutral-600">×{item.cantidad}</span>
                </div>
              )) || (
                <span className="text-xs text-neutral-600">Sin productos</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PromoList;
