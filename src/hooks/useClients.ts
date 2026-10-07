import { useState, useCallback, useEffect } from "react";
import Swal from "sweetalert2";
import {
  getClients,
  createClient as createClientApi,
  updateClient as updateClientApi,
  updateClientTaxInformation as updateClientTaxInformationApi,
} from "../services/client.service";
import type {
  Client,
  ClientPayload,
  ClientsPagination,
  ClientTaxInformationPayload,
} from "../types/client";

interface UseClientsResult {
  clients: Client[];
  pagination: ClientsPagination | null;
  loading: boolean;
  error: Error | null;
  search: string;
  setSearch: (search: string) => void;
  page: number;
  setPage: (page: number) => void;
  refetch: () => void;
  createClient: (payload: ClientPayload, taxInfo?: ClientTaxInformationPayload) => Promise<void>;
  updateClient: (updated: Client) => Promise<void>;
  updateTaxInformation: (clientId: number, payload: ClientTaxInformationPayload) => Promise<void>;
}

export function useClients(): UseClientsResult {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<ClientsPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchClients = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const { clients: list, pagination: p } = await getClients({
      search: search || undefined,
      page,
    });
    setClients(list);
    setPagination(p);
 } catch (err) {
  console.error("Error en getClients:", err);
  setError(err instanceof Error ? err : new Error("Error al obtener los clientes"));
} finally {
    setLoading(false);
  }
}, [search, page]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const createClient = useCallback(
    async (payload: ClientPayload, taxInfo?: ClientTaxInformationPayload) => {
      const { id } = await createClientApi(payload);

      if (taxInfo) {
        try {
          await updateClientTaxInformationApi(id, taxInfo);
        } catch {
          
          await fetchClients();
          Swal.fire({
            icon: "warning",
            title: "Cliente creado sin datos fiscales",
            text: "El cliente se registró, pero no se pudieron guardar los datos fiscales. Captúralos desde Editar.",
          });
          return;
        }
      }

      await fetchClients();
    },
    [fetchClients]
  );

  const updateClient = useCallback(
    async (updated: Client) => {
      const payload: ClientPayload = {
        name: updated.name,
        paternal_last_name: updated.paternal_last_name,
        maternal_last_name: updated.maternal_last_name,
        phone: updated.phone,
        email: updated.email,
        rfc: updated.rfc,
        
        registrationDate: updated.registrationDate,
        status: updated.status,
      };
      await updateClientApi(updated.id, payload);
      await fetchClients();
    },
    [fetchClients]
  );

  const updateTaxInformation = useCallback(
    async (clientId: number, payload: ClientTaxInformationPayload) => {
      await updateClientTaxInformationApi(clientId, payload);
      await fetchClients();
    },
    [fetchClients]
  );

  return {
    clients,
    pagination,
    loading,
    error,
    search,
    setSearch,
    page,
    setPage,
    refetch: fetchClients,
    createClient,
    updateClient,
    updateTaxInformation,
  };
}