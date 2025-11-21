import React, { useState, useEffect } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../contexts/NotificationContext";
import type { Product } from "../../utils/api";
import ProductHeader from "./ProductHeader";
import ProductStats from "./ProductStats";
import ProductSearchBar from "./ProductSearchBar";
import ProductTable from "./ProductTable";
import ProductCards from "./ProductCards";
import ProductFormModal from "./ProductFormModal";
import ContentModal from "./ContentModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const Productos: React.FC = () => {
  const {
    products,
    loading,
    error,
    total,
    addProduct,
    editProduct,
    removeProduct,
    allProducts,
  } = useProducts();
  const { isAdmin } = useAuth();
  const { showNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    stock: "",
    descripcion: "",
    notas: "",
  });
  const [modalContent, setModalContent] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<
    "all" | "in-stock" | "low-stock" | "out-of-stock"
  >("all");

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isFilterDropdownOpen &&
        !(event.target as Element).closest(".filter-dropdown")
      ) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterDropdownOpen]);

  useEffect(() => {
    const hasModal = isFormModalOpen || modalContent || isConfirmDelete;
    if (hasModal) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isFormModalOpen, modalContent, isConfirmDelete]);

  const resetForm = () => {
    setFormData({
      nombre: "",
      precio: "",
      stock: "",
      descripcion: "",
      notas: "",
    });
    setIsEditing(false);
    setEditingProduct(null);
    setIsFormModalOpen(false);
  };

  const openFormModal = (product?: Product) => {
    if (product) {
      setIsEditing(true);
      setEditingProduct(product);
      setFormData({
        nombre: product.nombre,
        precio: product.precio.toString(),
        stock: product.stock.toString(),
        descripcion: product.descripcion || "",
        notas: product.notas || "",
      });
    }
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const precio = parseFloat(formData.precio);
    const stock = parseInt(formData.stock);

    if (isNaN(precio) || isNaN(stock)) {
      showNotification("Precio y stock deben ser números válidos", "error");
      return;
    }

    try {
      if (isEditing && editingProduct) {
        await editProduct(editingProduct.id, {
          nombre: formData.nombre,
          precio,
          stock,
          descripcion: formData.descripcion,
          notas: formData.notas,
        });
        showNotification("Producto actualizado exitosamente", "success");
      } else {
        await addProduct({
          nombre: formData.nombre,
          precio,
          stock,
          descripcion: formData.descripcion,
          notas: formData.notas,
        });
        showNotification("Producto creado exitosamente", "success");
      }
      resetForm();
    } catch {
      // Error is handled in the hook
    }
  };

  const handleDelete = async (id: number) => {
    setProductToDelete(id);
    setIsConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await removeProduct(productToDelete);
        showNotification("Producto eliminado exitosamente", "success");
      } catch {
        // Error is handled in the hook
      }
    }
    setIsConfirmDelete(false);
    setProductToDelete(null);
  };

  const cancelDelete = () => {
    setIsConfirmDelete(false);
    setProductToDelete(null);
  };

  const openModal = (title: string, content: string) => {
    setModalContent({ title, content });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  // Calcular estadísticas sobre todo el catálogo (si está cargado) o sobre la página actual
  const sourceForStats = allProducts ?? products;
  const totalStockValue = sourceForStats.reduce(
    (total, product) => total + product.precio * product.stock,
    0
  );
  const outOfStockCount = sourceForStats.filter(
    (product) => product.stock === 0
  ).length;
  const lowStockCount = sourceForStats.filter(
    (product) => product.stock > 0 && product.stock < 5
  ).length;
  const totalProducts = allProducts
    ? allProducts.length
    : total || products.length;

  // Usar todo el catálogo si está disponible; queremos mostrar la lista completa
  const sourceForFilter = allProducts ?? products;

  const filteredProducts = sourceForFilter.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(search.toLowerCase());

    let matchesStock = true;
    if (stockFilter === "in-stock") {
      matchesStock = p.stock > 0;
    } else if (stockFilter === "low-stock") {
      matchesStock = p.stock > 0 && p.stock < 5;
    } else if (stockFilter === "out-of-stock") {
      matchesStock = p.stock === 0;
    }

    return matchesSearch && matchesStock;
  });

  // Calcular paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [search, stockFilter]);

  return (
    <div className="min-h-screen bg-[#181818] flex flex-col overflow-x-hidden w-full">
      <div className="flex-1 w-full p-4 sm:p-6 md:p-8 lg:max-w-7xl xl:max-w-[1800px] mx-auto max-w-full overflow-x-hidden">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-800/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <ProductHeader isAdmin={isAdmin} onNewProduct={() => openFormModal()} />

        <ProductStats
          totalStockValue={totalStockValue}
          totalProducts={totalProducts}
          outOfStockCount={outOfStockCount}
          lowStockCount={lowStockCount}
        />

        <ProductSearchBar
          search={search}
          onSearchChange={setSearch}
          stockFilter={stockFilter}
          onStockFilterChange={setStockFilter}
          isFilterDropdownOpen={isFilterDropdownOpen}
          onFilterDropdownToggle={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
          totalProducts={totalProducts}
          outOfStockCount={outOfStockCount}
          lowStockCount={lowStockCount}
        />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-neutral-400">Cargando productos...</p>
            </div>
          </div>
        ) : (
          <>
            <ProductTable
              products={paginatedProducts}
              isAdmin={isAdmin}
              onEdit={openFormModal}
              onDelete={handleDelete}
              onOpenModal={openModal}
            />
            <ProductCards
              products={paginatedProducts}
              isAdmin={isAdmin}
              onEdit={openFormModal}
              onDelete={handleDelete}
              onOpenModal={openModal}
            />

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm rounded bg-neutral-800 text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 transition"
                >
                  ‹ Anterior
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 text-sm rounded transition ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm rounded bg-neutral-800 text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 transition"
                >
                  Siguiente ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={resetForm}
        isEditing={isEditing}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
      />

      <ContentModal
        modalContent={modalContent}
        onClose={closeModal}
      />

      <ConfirmDeleteModal
        isOpen={isConfirmDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Productos;