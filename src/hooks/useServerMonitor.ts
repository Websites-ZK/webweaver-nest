import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useServerMonitor<T>(action: string, params?: Record<string, unknown>, refreshInterval?: number) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("server-monitor", {
        body: { action, params },
      });
      if (fnError) throw fnError;
      setData(result as T);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [action, JSON.stringify(params)]);

  useEffect(() => {
    fetch();
    if (refreshInterval) {
      const id = setInterval(fetch, refreshInterval);
      return () => clearInterval(id);
    }
  }, [fetch, refreshInterval]);

  return { data, loading, error, refetch: fetch };
}
