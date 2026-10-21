import { useState } from "react";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "../../components/ui/page-header";
import { useClients } from "../../hooks/useClients";
import { ClientGrid } from "../../components/clients/ClientGrid";
import { ClientEditModal } from "../../components/clients/ClientEditModal";
import { ClientCreateModal } from "../../components/clients/ClientCreateModal";
import { ClientAddressesModal } from "../../components/clients/ClientAddressesModal";
import type { Client } from "../../types/client";

export function Clientes() {
  const {
    clients,
    pagination,
    loading,
    error,
    search,
    setSearch,
    page,
    setPage,
    createClient,
    updateClient,
  updateTaxInformation
  } = useClients();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [addressesClient, setAddressesClient] = useState<Client | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <main className="mx-auto w-full  px-6 py-8">
    <div className="flex flex-col gap-4 bg-gray-50">
      <PageHeader 
        title="Clientes"
        description="Historial de clientes registrados en el sistema."
        actions={
          <button
            onClick={() => setCreating(true)}
            className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 sm:w-auto sm:px-5 sm:py-3"
          >
            <Plus className="size-5" /> Nuevo cliente
          </button>
        }
      />

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Buscar cliente por nombre..."
          className="w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {loading && <p className="text-sm text-muted-foreground">Cargando clientes...</p>}
      {error && <p className="text-sm text-destructive">Error al cargar clientes.</p>}
      {!loading && !error && (
        <ClientGrid
          clients={clients}
          onEditClient={setEditingClient}
          onManageAddresses={setAddressesClient}
        />
      )}

      {!loading && !error && pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages} · {pagination.total} clientes
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrev}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              <ChevronLeft className="size-4" /> Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNext}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Siguiente <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      <ClientCreateModal
        open={creating}
        onClose={() => setCreating(false)}
        onSave={createClient}
      />

      <ClientEditModal
        client={editingClient}
        open={editingClient !== null}
        onClose={() => setEditingClient(null)}
        onSave={updateClient}
        onSaveTaxInfo={updateTaxInformation}
      />

      <ClientAddressesModal
        client={addressesClient}
        open={addressesClient !== null}
        onClose={() => setAddressesClient(null)}
      />
    </div>
    </main>
  );
}
export default Clientes;