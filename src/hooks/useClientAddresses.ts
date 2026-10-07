import { useState, useCallback, useEffect } from "react";
import { getClientAddresses, addClientAddress } from "../services/client.service";
import { updateClientAddress, deleteClientAddress } from "../services/client-address.service";
import type { ClientAddress, ClientAddressPayload } from "../types/client";

interface UseClientAddressesResult {
  addresses: ClientAddress[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  createAddress: (payload: ClientAddressPayload) => Promise<void>;
  updateAddress: (id: number, payload: ClientAddressPayload) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
}

export function useClientAddresses(clientId: number | null): UseClientAddressesResult {
  const [addresses, setAddresses] = useState<ClientAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAddresses = useCallback(async () => {
    if (clientId == null) {
      setAddresses([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setAddresses(await getClientAddresses(clientId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al obtener las direcciones"));
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const createAddress = useCallback(
    async (payload: ClientAddressPayload) => {
      if (clientId == null) return;
      await addClientAddress(clientId, payload);
      await fetchAddresses();
    },
    [clientId, fetchAddresses]
  );

  const updateAddress = useCallback(
    async (id: number, payload: ClientAddressPayload) => {
      await updateClientAddress(id, payload);
      await fetchAddresses();
    },
    [fetchAddresses]
  );

  const deleteAddress = useCallback(
    async (id: number) => {
      await deleteClientAddress(id);
      await fetchAddresses();
    },
    [fetchAddresses]
  );

  return { addresses, loading, error, refetch: fetchAddresses, createAddress, updateAddress, deleteAddress };
}