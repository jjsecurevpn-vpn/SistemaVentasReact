import { useState, useEffect, useCallback, useMemo } from "react";
import type { Product } from "../utils/api";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../utils/api";
import { useRealtimeSubscription } from "./useRealtimeSubscription";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  const fetchProducts = useCallback(
    async (pageArg?: number, limitArg?: number) => {
      setLoading(true);
      setError(null);
      try {
        if (pageArg && limitArg) {
          const res = (await getProducts(pageArg, limitArg)) as {
            items: Product[];
            total: number;
          };
          setProducts(res.items || []);
          setTotal(res.total || 0);
          setPage(pageArg);
          setPageSize(limitArg);
        } else if (pageArg && !limitArg) {
          const res = (await getProducts(pageArg, pageSize)) as {
            items: Product[];
            total: number;
          };
          setProducts(res.items || []);
          setTotal(res.total || 0);
          setPage(pageArg);
        } else {
          // fallback to previous behaviour (no pagination)
          const data = (await getProducts()) as Product[];
          setProducts(data || []);
          setTotal((data || []).length || 0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await getProducts()) as Product[];
      setAllProducts(data || []);
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return [] as Product[];
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    await Promise.all([fetchProducts(page, pageSize), fetchAllProducts()]);
  }, [fetchProducts, fetchAllProducts, page, pageSize]);

  const addProduct = useCallback(
    async (product: Omit<Product, "id">) => {
      try {
        await createProduct(product);
        await refreshProducts();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al crear producto"
        );
        throw err;
      }
    },
    [refreshProducts]
  );

  const editProduct = useCallback(
    async (id: number, updates: Partial<Product>) => {
      try {
        await updateProduct(id, updates);
        await refreshProducts();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al actualizar producto"
        );
        throw err;
      }
    },
    [refreshProducts]
  );

  const removeProduct = useCallback(
    async (id: number) => {
      try {
        await deleteProduct(id);
        await refreshProducts();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al eliminar producto"
        );
        throw err;
      }
    },
    [refreshProducts]
  );

  // Initial fetch
  useEffect(() => {
    fetchProducts(page, pageSize);
    // Load all products in background for global stats and search
    fetchAllProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productSubscriptions = useMemo(
    () => [
      {
        table: "productos",
      },
    ],
    []
  );

  const handleRealtimeProducts = useCallback(() => {
    refreshProducts();
  }, [refreshProducts]);

  useRealtimeSubscription(
    "productos-listener",
    productSubscriptions,
    () => {
      handleRealtimeProducts();
    }
  );

  return {
    products,
    loading,
    error,
    allProducts,
    fetchProducts,
    total,
    page,
    pageSize,
    addProduct,
    editProduct,
    removeProduct,
    fetchAllProducts,
    refreshProducts,
    clearError: () => setError(null),
  };
};
