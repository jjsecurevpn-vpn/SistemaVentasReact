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
      <div className="flex items-center justify-center py-12 text-neutral-400">
        Cargando promos...
      </div>
    );
  }

  if (!promos.length) {
    return (
      <div className="border border-dashed border-neutral-700 rounded-xl p-6 text-center text-neutral-500">
        Aún no tienes promociones. ¡Crea la primera para acelerar las ventas!
      </div>
    );
  }

  const today = new Date().toISOString().substring(0, 10);

  const getVigenciaBadge = (promo: Promo) => {
    if (promo.fecha_inicio && promo.fecha_inicio > today) {
      return <span className="text-xs text-blue-400">Próxima ({promo.fecha_inicio})</span>;
    }
    if (promo.fecha_fin && promo.fecha_fin < today) {
      return <span className="text-xs text-red-400">Expirada</span>;
    }
    return <span className="text-xs text-emerald-400">Activa</span>;
  };

  return (
    <div className="space-y-4">
      {promos.map((promo) => {
        const usosRestantes = promo.limite_uso
          ? Math.max(0, promo.limite_uso - (promo.usos_registrados || 0))
          : null;
        return (
          <div
            key={promo.id}
            className="border border-neutral-800 bg-neutral-900 rounded-xl p-4 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-emerald-400" />
                  <h3 className="text-lg font-semibold text-neutral-100">{promo.nombre}</h3>
                  <span className="text-sm font-semibold text-emerald-400">
                    ${promo.precio_promocional.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-neutral-400">
                  {promo.descripcion || "Sin descripción"}
                </p>
                <div className="flex items-center gap-4 mt-1 text-xs text-neutral-500">
                  {promo.fecha_inicio && (
                    <span>Inicio: {promo.fecha_inicio}</span>
                  )}
                  {promo.fecha_fin && <span>Fin: {promo.fecha_fin}</span>}
                  {usosRestantes !== null && (
                    <span>
                      Límite: {promo.limite_uso} (restan {usosRestantes})
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {getVigenciaBadge(promo)}
                <button
                  onClick={() => onToggle(promo.id, !promo.activo)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg border border-neutral-700 text-neutral-200 hover:border-neutral-500"
                >
                  {promo.activo ? (
                    <>
                      <ToggleRight size={16} className="text-emerald-400" />
                      Desactivar
                    </>
                  ) : (
                    <>
                      <ToggleLeft size={16} className="text-neutral-400" />
                      Activar
                    </>
                  )}
                </button>
                <button
                  onClick={() => onDelete(promo.id)}
                  className="p-2 rounded-lg border border-transparent hover:border-red-500/40 text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {promo.promo_productos?.map((item) => (
                <div
                  key={`${promo.id}-${item.producto_id}`}
                  className="flex items-center justify-between bg-neutral-800/60 rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="text-neutral-200 font-medium">
                      {item.producto?.nombre || `Producto #${item.producto_id}`}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Precio normal: ${item.producto?.precio?.toFixed(2) ?? "-"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-neutral-300">
                    ×{item.cantidad}
                  </span>
                </div>
              )) || (
                <div className="text-neutral-500">Sin productos asociados</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PromoList;
