import { useState, useCallback, useEffect } from "react";
import {
  getFabricTypes,
  createFabricType,
  updateFabricType,
  deleteFabricType,
  activateFabricType,
} from "../services/fabric-type.service";
import type { FabricType, FabricTypePayload } from "../types/inventory";

interface UseFabricTypesResult {
  fabricTypes: FabricType[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  createFabricType: (payload: FabricTypePayload) => Promise<void>;
  updateFabricType: (id: number, payload: FabricTypePayload) => Promise<void>;
  deleteFabricType: (id: number) => Promise<void>;
  activateFabricType: (id: number) => Promise<void>;
}

export function useFabricTypes(): UseFabricTypesResult {
  const [fabricTypes, setFabricTypes] = useState<FabricType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFabricTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setFabricTypes(await getFabricTypes());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al obtener los tipos de tela"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFabricTypes();
  }, [fetchFabricTypes]);

  const create = useCallback(
    async (payload: FabricTypePayload) => {
      await createFabricType(payload);
      await fetchFabricTypes();
    },
    [fetchFabricTypes]
  );

  const update = useCallback(
    async (id: number, payload: FabricTypePayload) => {
      await updateFabricType(id, payload);
      await fetchFabricTypes();
    },
    [fetchFabricTypes]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteFabricType(id);
      await fetchFabricTypes();
    },
    [fetchFabricTypes]
  );

  const activate = useCallback(
    async (id: number) => {
      await activateFabricType(id);
      await fetchFabricTypes();
    },
    [fetchFabricTypes]
  );

  return {
    fabricTypes,
    loading,
    error,
    refetch: fetchFabricTypes,
    createFabricType: create,
    updateFabricType: update,
    deleteFabricType: remove,
    activateFabricType: activate,
  };
}