import { useState, useCallback, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import type { Promo, PromoProduct } from "../utils/api";
import { useRealtimeSubscription } from "./useRealtimeSubscription";

export interface PromoProductInput {
  producto_id: number;
  cantidad: number;
}

export interface PromoInput {
  nombre: string;
  descripcion?: string;
  precio_promocional: number;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  limite_uso?: number | null;
  notas?: string;
  productos: PromoProductInput[];
}

const mapPromo = (promo: any): Promo => ({
  ...promo,
  promo_productos: (promo.promo_productos || []).map((pp: any) => ({
    id: pp.id,
    promo_id: pp.promo_id,
    producto_id: pp.producto_id,
    cantidad: pp.cantidad,
    producto: Array.isArray(pp.producto) ? pp.producto[0] : pp.producto,
  })) as PromoProduct[],
});

export const usePromos = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("promos")
        .select(
          `*,
          promo_productos (
            id,
            promo_id,
            producto_id,
            cantidad,
            producto:productos (*)
          )`
        )
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setPromos((data || []).map(mapPromo));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar promos");
    } finally {
      setLoading(false);
    }
  }, []);

  const createPromo = useCallback(
    async (input: PromoInput) => {
      const { productos, ...promoData } = input;
      if (!productos.length) {
        throw new Error("La promo debe incluir al menos un producto");
      }

      const { data: promo, error: promoError } = await supabase
        .from("promos")
        .insert([{ ...promoData }])
        .select()
        .single();

      if (promoError || !promo) {
        throw promoError || new Error("No se pudo crear la promo");
      }

      const promoId = promo.id;

      const { error: productsError } = await supabase
        .from("promo_productos")
        .insert(
          productos.map((item) => ({
            promo_id: promoId,
            producto_id: item.producto_id,
            cantidad: item.cantidad,
          }))
        );

      if (productsError) {
        // revertir promo principal para mantener consistencia
        await supabase.from("promos").delete().eq("id", promoId);
        throw productsError;
      }

      await fetchPromos();
    },
    [fetchPromos]
  );

  const togglePromo = useCallback(
    async (promoId: number, active: boolean) => {
      const { error: updateError } = await supabase
        .from("promos")
        .update({ activo: active })
        .eq("id", promoId);

      if (updateError) {
        throw updateError;
      }

      await fetchPromos();
    },
    [fetchPromos]
  );

  const deletePromo = useCallback(
    async (promoId: number) => {
      const { error: deleteError } = await supabase
        .from("promos")
        .delete()
        .eq("id", promoId);

      if (deleteError) throw deleteError;
      await fetchPromos();
    },
    [fetchPromos]
  );

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const promoSubscriptions = useMemo(
    () => [
      { table: "promos" },
      { table: "promo_productos" },
    ],
    []
  );

  useRealtimeSubscription("promos-listener", promoSubscriptions, () => {
    fetchPromos();
  });

  return {
    promos,
    loading,
    error,
    fetchPromos,
    createPromo,
    togglePromo,
    deletePromo,
  };
};
