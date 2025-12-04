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
        <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-900/20 border border-red-700/40 text-red-300 text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Nombre
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="Ej: Combo Vino + Gaseosa"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Precio promocional
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.precio_promocional}
              onChange={(e) => setForm((prev) => ({ ...prev, precio_promocional: e.target.value }))}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Vigencia (desde)
            </label>
            <input
              type="date"
              value={form.fecha_inicio}
              onChange={(e) => setForm((prev) => ({ ...prev, fecha_inicio: e.target.value }))}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Vigencia (hasta)
            </label>
            <input
              type="date"
              value={form.fecha_fin}
              onChange={(e) => setForm((prev) => ({ ...prev, fecha_fin: e.target.value }))}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Límite de uso (opcional)
            </label>
            <input
              type="number"
              min="1"
              value={form.limite_uso}
              onChange={(e) => setForm((prev) => ({ ...prev, limite_uso: e.target.value }))}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="Ilimitado"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Notas internas
            </label>
            <input
              type="text"
              value={form.notas}
              onChange={(e) => setForm((prev) => ({ ...prev, notas: e.target.value }))}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="Observaciones para el equipo"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Productos incluidos
          </label>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map((item, index) => {
              const selectedProduct = item.producto_id
                ? products.find((p) => p.id === item.producto_id)
                : null;

              return (
                <div
                  key={`promo-item-${index}`}
                  className="grid grid-cols-12 gap-2 items-start"
                >
                  <div className="col-span-7">
                    <span className="text-[11px] text-neutral-500 uppercase font-semibold">
                      Producto
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenPicker(index)}
                      className="mt-1 w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-left text-sm text-neutral-100 hover:border-emerald-500/40"
                    >
                      {selectedProduct ? (
                        <div>
                          <p className="font-medium text-neutral-100">
                            {selectedProduct.nombre}
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            Stock: {selectedProduct.stock} · Precio: ${" "}
                            {selectedProduct.precio.toFixed(2)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-neutral-500">Buscar producto</span>
                      )}
                    </button>
                    {!selectedProduct && (
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Selecciona un producto para este combo
                      </p>
                    )}
                  </div>
                  <div className="col-span-3">
                    <span className="text-[11px] text-neutral-500 uppercase font-semibold">
                      Cantidad
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end items-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      className="px-2 py-2 text-xs text-red-400 hover:text-red-300"
                      disabled={items.length === 1}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleAddRow}
            className="text-sm text-emerald-300 hover:text-emerald-200"
          >
            + Agregar producto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
          <div>
            <p className="text-xs text-neutral-500 uppercase">Precio normal</p>
            <p className="text-lg font-semibold text-neutral-100">
              ${summary.precioNormal.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase">Costo estimado</p>
            <p className="text-lg font-semibold text-neutral-100">
              ${summary.costoTotal.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase">Margen esperado</p>
            <p className="text-lg font-semibold text-emerald-400">
              ${(
                (parseFloat(form.precio_promocional) || 0) - summary.costoTotal
              ).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={closeAndReset}
            className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 text-sm hover:bg-neutral-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 disabled:opacity-60"
          >
            {submitting ? "Creando..." : "Guardar Promo"}
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
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Busca por nombre
            </label>
            <input
              type="text"
              autoFocus
              value={pickerSearch}
              onChange={(e) => handlePickerSearchChange(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="Ej: Coca, Galletas, Vodka..."
            />
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-neutral-900 border border-neutral-800 rounded-lg">
            {pickerSearch.trim().length === 0 && (
              <p className="px-4 py-6 text-sm text-neutral-500 text-center">
                Escribe al menos una palabra para comenzar la búsqueda
              </p>
            )}

            {pickerSearch.trim().length > 0 && filteredProducts.length === 0 && (
              <p className="px-4 py-6 text-sm text-neutral-500 text-center">
                No se encontraron productos que coincidan con "{pickerSearch}"
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
                  className="w-full text-left px-4 py-3 hover:bg-neutral-800">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-neutral-100">{product.nombre}</p>
                    <span className="text-xs text-neutral-400">
                      Stock: {product.stock}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Precio: ${product.precio.toFixed(2)} · Costo: $
                    {product.precio_compra ? product.precio_compra.toFixed(2) : "-"}
                    {alreadyUsed ? " · Ya agregado en la promo" : ""}
                  </p>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleClosePicker}
            className="w-full text-sm text-neutral-400 hover:text-neutral-200"
          >
            Cerrar buscador
          </button>
        </div>
      </Modal>
    </>
  );
};

export default PromoFormModal;
