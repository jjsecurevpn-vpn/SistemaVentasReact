import React, { useState, useEffect } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useSales } from "../../hooks/useSales";
import { useClientes } from "../../hooks/useClientes";
import { useNotification } from "../../hooks/useNotification";
import { useAuth } from "../../hooks/useAuth";
import Notification from "../../components/Notification";
import SaleConfirmationModal from "../../components/SaleConfirmationModal";
import { ProductSearchGrid, CartSidebar, MobileCartSummary } from "./components";
import type { Cliente } from "../../hooks/useClientes";
import { CreditCard } from "lucide-react";

const POS: React.FC = () => {
  const [search, setSearch] = useState("");
  const [ventaAlFiado, setVentaAlFiado] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);
  const [clienteDropdownOpen, setClienteDropdownOpen] = useState(false);
  const [ventaNotas, setVentaNotas] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [searchCliente, setSearchCliente] = useState("");
  const [showSaleConfirmation, setShowSaleConfirmation] = useState(false);
  const [lastSaleData, setLastSaleData] = useState<{
    cart: any[];
    total: number;
    isCreditSale: boolean;
    clientName?: string;
  } | null>(null);
  const {
    products,
    loading: productsLoading,
    error: productsError,
    allProducts,
    refreshProducts,
  } = useProducts();
  const {
    cart,
    total,
    loading: saleLoading,
    error: saleError,
    addToCart,
    removeFromCart,
    confirmSale,
  } = useSales();
  const { clientes, cargarClientes } = useClientes();
  const { notification, showError, hideNotification } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  const filteredClientes = clientes.filter((c) =>
    `${c.nombre} ${c.apellido || ""} ${c.telefono || ""} ${c.email || ""}`
      .toLowerCase()
      .includes(searchCliente.toLowerCase())
  );

  const handleVentaAlFiadoChange = (value: boolean) => {
    setVentaAlFiado(value);
    if (!value) {
      setClienteSeleccionado(null);
    }
  };

  // If search has text, search across all products (global). Otherwise use current page products.
  const sourceForPOS =
    search.trim() !== "" ? allProducts ?? products : products;
  const filteredProducts = sourceForPOS.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmSale = async () => {
    try {
      if (!user) {
        showError("Usuario no autenticado. Por favor, inicia sesión.");
        return;
      }

      if (ventaAlFiado && !clienteSeleccionado) {
        showError("Debe seleccionar un cliente para la venta al fiado");
        return;
      }

      const notasVenta = ventaNotas || undefined;
      const notasFiado =
        ventaAlFiado && clienteSeleccionado
          ? `${ventaNotas ? ventaNotas + " - " : ""}Venta al fiado a ${
              clienteSeleccionado.nombre
            } ${clienteSeleccionado.apellido || ""}`
          : undefined;

      console.log("POS: Confirming sale with user:", user?.id);

      await confirmSale(
        ventaAlFiado ? clienteSeleccionado?.id : undefined,
        undefined,
        notasVenta,
        notasFiado,
        user?.id,
        metodoPago
      );

      // Guardar datos de la venta para el modal de confirmación
      setLastSaleData({
        cart: [...cart], // Copia del carrito actual
        total: total,
        isCreditSale: ventaAlFiado,
        clientName:
          ventaAlFiado && clienteSeleccionado
            ? `${clienteSeleccionado.nombre} ${
                clienteSeleccionado.apellido || ""
              }`.trim()
            : undefined,
      });

      setVentaNotas("");
      setVentaAlFiado(false);
      setClienteSeleccionado(null);
      setMetodoPago("efectivo");

      await refreshProducts();

      // Mostrar modal de confirmación en lugar de notificación simple
      setShowSaleConfirmation(true);
    } catch (error) {
      console.error("Error confirming sale:", error);
      showError(
        `Error al confirmar la venta: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  };

  return (
    <div className="h-full bg-[#181818] flex flex-col">
      {/* Error Messages */}
      {(productsError || saleError) && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 md:w-auto">
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/50 p-3 rounded-lg">
            {productsError || saleError}
          </div>
        </div>
      )}

      {/* Main Content - Products and Cart Side by Side */}
      <div className="flex-1 flex overflow-hidden">
        <ProductSearchGrid
          search={search}
          onSearchChange={setSearch}
          productsLoading={productsLoading}
          filteredProducts={filteredProducts}
          cart={cart}
          onAddToCart={addToCart}
        />

        <CartSidebar
          cart={cart}
          total={total}
          ventaAlFiado={ventaAlFiado}
          onVentaAlFiadoChange={handleVentaAlFiadoChange}
          onRemoveItem={removeFromCart}
          clienteSeleccionado={clienteSeleccionado}
          onOpenClienteModal={() => setClienteDropdownOpen(true)}
          ventaNotas={ventaNotas}
          onNotasChange={setVentaNotas}
          metodoPago={metodoPago}
          onMetodoPagoChange={setMetodoPago}
          onConfirmSale={handleConfirmSale}
          saleLoading={saleLoading}
        />
      </div>

      <MobileCartSummary
        cart={cart}
        total={total}
        ventaAlFiado={ventaAlFiado}
        onVentaAlFiadoChange={handleVentaAlFiadoChange}
        onRemoveItem={removeFromCart}
        clienteSeleccionado={clienteSeleccionado}
        onOpenClienteModal={() => setClienteDropdownOpen(true)}
        metodoPago={metodoPago}
        onMetodoPagoChange={setMetodoPago}
        ventaNotas={ventaNotas}
        onNotasChange={setVentaNotas}
        saleLoading={saleLoading}
        onConfirmSale={handleConfirmSale}
      />

      {/* Modal de selección de cliente */}
      {clienteDropdownOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setClienteDropdownOpen(false);
            setSearchCliente("");
          }}
        >
          <div
            className="bg-neutral-900 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-neutral-800">
              <h3 className="text-lg font-semibold text-neutral-200 mb-3">
                Seleccionar Cliente
              </h3>
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchCliente}
                onChange={(e) => setSearchCliente(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 overflow-auto">
              {filteredClientes.length === 0 ? (
                <div className="px-4 py-12 text-center text-neutral-400 text-sm">
                  <CreditCard className="mx-auto mb-2 opacity-50" size={32} />
                  {clientes.length === 0
                    ? "No hay clientes registrados"
                    : "No se encontraron clientes"}
                </div>
              ) : (
                filteredClientes.map((cliente) => (
                  <button
                    key={cliente.id}
                    onClick={() => {
                      setClienteSeleccionado(cliente);
                      setClienteDropdownOpen(false);
                      setSearchCliente("");
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-neutral-800 transition-colors border-b border-neutral-800/30 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">
                          {cliente.nombre.charAt(0)}
                          {cliente.apellido?.charAt(0) || ""}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-100 text-sm truncate">
                          {cliente.nombre} {cliente.apellido || ""}
                        </p>
                        <div className="text-xs text-neutral-400 truncate">
                          {cliente.telefono || cliente.email || ""}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <Notification notification={notification} onClose={hideNotification} />
      <SaleConfirmationModal
        isOpen={showSaleConfirmation}
        onClose={() => {
          setShowSaleConfirmation(false);
          setLastSaleData(null);
        }}
        cart={lastSaleData?.cart || []}
        total={lastSaleData?.total || 0}
        isCreditSale={lastSaleData?.isCreditSale || false}
        clientName={lastSaleData?.clientName}
      />
    </div>
  );
};

export default POS;
