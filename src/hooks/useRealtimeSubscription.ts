import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

type RealtimeEvent = "*" | "INSERT" | "UPDATE" | "DELETE";

interface TableSubscription {
  table: string;
  event?: RealtimeEvent;
  schema?: string;
  filter?: string;
}

type ChangeHandler = (payload: Record<string, unknown>) => void;

/**
 * Centraliza la suscripción a canales de Supabase y asegura limpieza correcta.
 */
export const useRealtimeSubscription = (
  channelName: string,
  subscriptions: TableSubscription[],
  handler: ChangeHandler
) => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!subscriptions.length) return;

    const channel = supabase.channel(channelName);

    subscriptions.forEach(({ table, schema = "public", event = "*", filter }) => {
      channel.on(
        "postgres_changes",
        { event, schema, table, filter } as any,
        (payload: Record<string, unknown>) => handlerRef.current?.(payload)
      );
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, subscriptions]);
};
