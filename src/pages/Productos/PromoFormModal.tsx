import React, { useMemo, useState } from "react";
import Modal from "../../components/Modal";
import type { Product } from "../../utils/api";
import type { PromoInput } from "../../hooks/usePromos";

interface PromoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onCreate: (data: PromoInput) => Promise<void>;
}

type PromoItemRow = {
  producto_id: number | null;
  cantidad: number;
};

const emptyForm = {
  nombre: "",
  descripcion: "",
  precio_promocional: "",
  fecha_inicio: "",
  fecha_fin: "",
  limite_uso: "",
  notas: "",
};

const PromoFormModal: React.FC<PromoFormModalProps> = ({
  isOpen,
  onClose,
  products,
  onCreate,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState<PromoItemRow[]>([
    { producto_id: null, cantidad: 1 },
  ]);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setForm(emptyForm);
    setItems([{ producto_id: null, cantidad: 1 }]);
    setPickerIndex(null);
    setPickerSearch("");
    setError(null);
  };

  const closeAndReset = () => {
    resetState();
    onClose();
  };

  const summary = useMemo(() => {
    return items.reduce(
      (acc, row) => {
        if (!row.producto_id) return acc;
        const product = products.find((p) => p.id === row.producto_id);
        if (!product) return acc;
        const qty = row.cantidad || 0;
        return {
          precioNormal: acc.precioNormal + product.precio * qty,
          costoTotal: acc.costoTotal + (product.precio_compra || 0) * qty,
        };
      },
      { precioNormal: 0, costoTotal: 0 }
    );
  }, [items, products]);

  const filteredProducts = useMemo(() => {
    const term = pickerSearch.trim().toLowerCase();
    if (!term) return [];
    return products
      .filter((product) => product.nombre.toLowerCase().includes(term))
      .slice(0, 25);
  }, [pickerSearch, products]);

  const pickerIsOpen = pickerIndex !== null;

  const handleQuantityChange = (index: number, value: string) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              cantidad: Math.max(1, Number(value) || 1),
            }
          : item
      )
    );
  };

  const handleOpenPicker = (index: number) => {
    setPickerIndex(index);
    const currentProduct = items[index].producto_id
      ? products.find((p) => p.id === items[index].producto_id)
      : null;
    setPickerSearch(currentProduct?.nombre || "");
  };

  const handleClosePicker = () => {
    setPickerIndex(null);
    setPickerSearch("");
  };

  const handlePickerSearchChange = (value: string) => {
    setPickerSearch(value);
  };

  const handleSelectProduct = (product: Product) => {
    if (pickerIndex === null) return;
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === pickerIndex
          ? {
              ...item,
              producto_id: product.id,
            }
          : item
      )
    );
    handleClosePicker();
  };

  const handleAddRow = () => {
    setItems((prev) => [...prev, { producto_id: null, cantidad: 1 }]);
  };

  const handleRemoveRow = (index: number) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev));

    if (pickerIndex !== null) {
      if (pickerIndex === index) {
        handleClosePicker();
      } else if (pickerIndex > index) {
        setPickerIndex(pickerIndex - 1);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nombre = form.nombre.trim();
    const precioPromocional = parseFloat(form.precio_promocional);
    if (!nombre) {
      setError("La promo debe tener un nombre");
      return;
    }
    if (!Number.isFinite(precioPromocional) || precioPromocional <= 0) {
      setError("Ingresa un precio promocional válido");
      return;
    }

    const productos = items
      .filter((item) => item.producto_id)
      .map((item) => ({
        producto_id: item.producto_id as number,
        cantidad: item.cantidad,
      }));

    if (!productos.length) {
      setError("Agrega al menos un producto a la promo");
      return;
    }

    setSubmitting(true);
    try {
      await onCreate({
        nombre,
        descripcion: form.descripcion || undefined,
        precio_promocional: precioPromocional,
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
        limite_uso: form.limite_uso ? Number(form.limite_uso) : null,
        notas: form.notas || undefined,
        productos,
      });
      closeAndReset();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo crear la promo"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={closeAndReset} title="Nueva promoción" size="lg">
        <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Nombre
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
              className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 transition-colors"
              placeholder="Ej: Combo Vino + Gaseosa"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Precio promocional
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.precio_promocional}
              onChange={(e) => setForm((prev) => ({ ...prev, precio_promocional: e.target.value }))}
              className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 transition-colors"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Vigencia (desde)
            </label>
            <input
              type="date"
              value={form.fecha_inicio}
              onChange={(e) => setForm((prev) => ({ ...prev, fecha_inicio: e.target.value }))}
              className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Vigencia (hasta)
            </label>
            <input
              type="date"
              value={form.fecha_fin}
              onChange={(e) => setForm((prev) => ({ ...prev, fecha_fin: e.target.value }))}
              className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Límite de uso
            </label>
            <input
              type="number"
              min="1"
              value={form.limite_uso}
              onChange={(e) => setForm((prev) => ({ ...prev, limite_uso: e.target.value }))}
              className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 transition-colors"
              placeholder="Ilimitado"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Notas
            </label>
            <input
              type="text"
              value={form.notas}
              onChange={(e) => setForm((prev) => ({ ...prev, notas: e.target.value }))}
              className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 transition-colors"
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
            Productos incluidos
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items.map((item, index) => {
              const selectedProduct = item.producto_id
                ? products.find((p) => p.id === item.producto_id)
                : null;

              return (
                <div
                  key={`promo-item-${index}`}
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => handleOpenPicker(index)}
                    className="flex-1 px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-left text-sm hover:border-neutral-700 transition-colors"
                  >
                    {selectedProduct ? (
                      <span className="text-white">{selectedProduct.nombre}</span>
                    ) : (
                      <span className="text-neutral-600">Seleccionar producto</span>
                    )}
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    className="w-16 px-2 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-sm text-white text-center focus:outline-none focus:border-neutral-700 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    className="p-2 text-neutral-600 hover:text-red-400 transition-colors"
                    disabled={items.length === 1}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleAddRow}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            + Agregar producto
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-3">
          <div>
            <p className="text-[10px] text-neutral-600 uppercase">Normal</p>
            <p className="text-sm font-medium text-white">
              ${summary.precioNormal.toFixed(0)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-600 uppercase">Costo</p>
            <p className="text-sm font-medium text-white">
              ${summary.costoTotal.toFixed(0)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-600 uppercase">Margen</p>
            <p className="text-sm font-medium text-emerald-400">
              ${(
                (parseFloat(form.precio_promocional) || 0) - summary.costoTotal
              ).toFixed(0)}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={closeAndReset}
            className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Creando..." : "Crear promoción"}
          </button>
        </div>
      </form>
    </Modal>

      <Modal
        isOpen={pickerIsOpen}
        onClose={handleClosePicker}
        title="Seleccionar producto"
        size="md"
      >
        <div className="space-y-3">
          <input
            type="text"
            autoFocus
            value={pickerSearch}
            onChange={(e) => handlePickerSearchChange(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 transition-colors"
            placeholder="Buscar producto..."
          />

          <div className="max-h-64 overflow-y-auto divide-y divide-neutral-800/30 border border-neutral-800/50 rounded-xl">
            {pickerSearch.trim().length === 0 && (
              <p className="px-4 py-6 text-xs text-neutral-600 text-center">
                Escribe para buscar
              </p>
            )}

            {pickerSearch.trim().length > 0 && filteredProducts.length === 0 && (
              <p className="px-4 py-6 text-xs text-neutral-600 text-center">
                Sin resultados para "{pickerSearch}"
              </p>
            )}

            {filteredProducts.map((product) => {
              const alreadyUsed = items.some(
                (row, idx) => row.producto_id === product.id && idx !== pickerIndex
              );
              return (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="w-full text-left px-3 py-2.5 hover:bg-neutral-800/30 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-white">{product.nombre}</p>
                    <span className="text-[10px] text-neutral-600">
                      {product.stock} uds
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-600 mt-0.5">
                    ${product.precio.toFixed(0)}
                    {alreadyUsed && <span className="text-amber-500 ml-2">• Ya agregado</span>}
                  </p>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleClosePicker}
            className="w-full text-xs text-neutral-500 hover:text-white transition-colors py-1"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    </>
  );
};

export default PromoFormModal;
