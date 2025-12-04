import React, { useState } from "react";
import { formatCurrency, formatDate } from "../../utils/api";
import type { Cliente, VentaFiada, PagoFiado } from "../../hooks/useClientes";

interface ClienteDetailsProps {
  selectedCliente: Cliente | null;
  deudas: VentaFiada[];
  pagos: PagoFiado[];
  loadingDetails: boolean;
  calcularDeudaTotal: (deudas: VentaFiada[]) => number;
  onRegisterPayment: (deuda: VentaFiada) => void;
  onPayAll: () => void;
}

const ClienteDetails: React.FC<ClienteDetailsProps> = ({
  selectedCliente,
  deudas,
  pagos,
  loadingDetails,
  calcularDeudaTotal,
  onPayAll,
}) => {
  const [activeTab, setActiveTab] = useState<"deudas" | "pagos" | "info">(
    "deudas"
  );

  if (!selectedCliente) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <p className="text-neutral-600 text-sm">Selecciona un cliente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:min-h-0 bg-[#0a0a0a]">
      {/* Header del Cliente */}
      <div className="p-4 md:p-6 border-b border-neutral-800/50">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {selectedCliente.nombre.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">
                {selectedCliente.nombre}
              </h1>
              <div className="flex items-center gap-3 text-xs text-neutral-600">
                {selectedCliente.telefono && (
                  <span>{selectedCliente.telefono}</span>
                )}
                {selectedCliente.email && (
                  <span>{selectedCliente.email}</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-neutral-600 uppercase">Deuda</p>
            <p className={`text-lg font-semibold ${calcularDeudaTotal(deudas) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {formatCurrency(calcularDeudaTotal(deudas))}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-800/50">
        {/* Desktop Tabs */}
        <div className="hidden md:flex px-6 items-center justify-between">
          <div className="flex gap-1">
            {(['deudas', 'pagos', 'info'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2.5 text-xs font-medium transition-colors rounded-lg ${
                  activeTab === tab
                    ? "bg-neutral-800/50 text-white"
                    : "text-neutral-500 hover:text-white"
                }`}
              >
                {tab === 'deudas' ? `Deudas (${deudas.length})` : 
                 tab === 'pagos' ? `Pagos (${pagos.length})` : 'Info'}
              </button>
            ))}
          </div>

          {calcularDeudaTotal(deudas) > 0 && (
            <button
              onClick={onPayAll}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              Pagar Todo
            </button>
          )}
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden px-4 py-2">
          <div className="flex bg-neutral-900/40 rounded-lg p-0.5">
            {(['deudas', 'pagos', 'info'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-xs font-medium transition-colors rounded-md ${
                  activeTab === tab
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-500"
                }`}
              >
                {tab === 'deudas' ? 'Deudas' : tab === 'pagos' ? 'Pagos' : 'Info'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido del Tab */}
      <div className="flex-1 p-4 md:p-6 overflow-visible md:overflow-y-auto md:min-h-0">
        {loadingDetails ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-neutral-700 border-t-neutral-400"></div>
          </div>
        ) : (
          <>
            {activeTab === "deudas" && (
              <div className="space-y-4">
                {deudas.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-emerald-400 text-sm mb-1">✓ Sin deudas</p>
                    <p className="text-neutral-600 text-xs">Este cliente está al día</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deudas.map((deuda) => (
                      <div
                        key={deuda.id}
                        className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-sm font-medium text-white">
                              Venta #{deuda.venta_id}
                            </h4>
                            <p className="text-[10px] text-neutral-600 mt-0.5">
                              {formatDate(deuda.venta.fecha)}
                              {deuda.fecha_vencimiento && ` • Vence: ${formatDate(deuda.fecha_vencimiento)}`}
                            </p>
                          </div>
                          <p className="text-lg font-semibold text-red-400">
                            {formatCurrency(deuda.venta.total)}
                          </p>
                        </div>
                        
                        {/* Products */}
                        <div className="space-y-1.5">
                          {deuda.venta.venta_productos.map((vp, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-xs"
                            >
                              <span className="text-neutral-400">
                                {vp.productos.nombre} <span className="text-neutral-600">×{vp.cantidad}</span>
                              </span>
                              <span className="text-neutral-500">
                                {formatCurrency(vp.subtotal)}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        {deuda.notas && (
                          <p className="text-[10px] text-neutral-600 italic mt-2 pt-2 border-t border-neutral-800/30">
                            {deuda.notas}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === "pagos" && (
              <div className="space-y-4">
                {pagos.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-neutral-500 text-sm">Sin pagos registrados</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pagos.map((pago) => (
                      <div
                        key={pago.id}
                        className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-4 flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 text-xs">✓</span>
                            <div>
                              <p className="text-sm text-white">Pago #{pago.id}</p>
                              <p className="text-[10px] text-neutral-600">
                                {formatDate(pago.fecha_pago)}
                                {pago.metodo_pago && ` • ${pago.metodo_pago}`}
                              </p>
                            </div>
                          </div>
                          {pago.notas && (
                            <p className="text-[10px] text-neutral-600 italic mt-1 ml-8">{pago.notas}</p>
                          )}
                        </div>
                        <p className="text-lg font-semibold text-emerald-400">
                          {formatCurrency(pago.monto)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === "info" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-4">
                    <p className="text-[10px] text-neutral-600 uppercase tracking-wide mb-3">Datos Personales</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[10px] text-neutral-600">Nombre</p>
                        <p className="text-sm text-white">{selectedCliente.nombre} {selectedCliente.apellido || ""}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-600">Registro</p>
                        <p className="text-sm text-white">{formatDate(selectedCliente.fecha_registro)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-4">
                    <p className="text-[10px] text-neutral-600 uppercase tracking-wide mb-3">Contacto</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[10px] text-neutral-600">Teléfono</p>
                        <p className="text-sm text-white">{selectedCliente.telefono || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-600">Email</p>
                        <p className="text-sm text-white">{selectedCliente.email || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-600">Dirección</p>
                        <p className="text-sm text-white">{selectedCliente.direccion || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCliente.notas && (
                  <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-4">
                    <p className="text-[10px] text-neutral-600 uppercase tracking-wide mb-2">Notas</p>
                    <p className="text-sm text-neutral-400 whitespace-pre-wrap">
                      {selectedCliente.notas}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClienteDetails;
