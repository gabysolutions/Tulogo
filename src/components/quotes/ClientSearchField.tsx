import { useEffect, useRef, useState } from "react";
import { Search, UserPlus, Check } from "lucide-react";

import type { Client } from "../../types/client";
import { getClients } from "../../services/client.service";

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors";

export interface NewClientData {
  name: string;
  lastNameP: string;
  lastNameM: string;
  phone?: string;
}

interface Props {
  selectedClient: Client | null;
  onSelectClient: (client: Client | null) => void;
  isNewClient: boolean;
  onIsNewClientChange: (value: boolean) => void;
  newClientData: NewClientData;
  onNewClientDataChange: (data: NewClientData) => void;
}

function clientLabel(client: Client): string {
  return `${client.name} ${client.paternal_last_name} ${client.maternal_last_name}${
    client.phone ? ` (${client.phone})` : ""
  }`;
}

export default function ClientSearchField({
  selectedClient,
  onSelectClient,
  isNewClient,
  onIsNewClientChange,
  newClientData,
  onNewClientDataChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Client[]>([]);
  const [searching, setSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

 
  useEffect(() => {
    const term = query.trim();

    if (!term || selectedClient) {
      setResults([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await getClients({ search: term, page: 1 });
        if (!cancelled) setResults(res.clients);
      } catch (err) {
        console.error("Error buscando clientes:", err);
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, selectedClient]);

  const handleSelect = (client: Client) => {
    onSelectClient(client);
    onIsNewClientChange(false);
    setQuery(clientLabel(client));
    setOpen(false);
  };

  const handleStartNewClient = () => {
    onSelectClient(null);
    onIsNewClientChange(true);
    onNewClientDataChange({
      ...newClientData,
      name: query,
    });
    setOpen(false);
  };

  const handleReset = () => {
    onSelectClient(null);
    onIsNewClientChange(false);
    onNewClientDataChange({
      name: "",
      lastNameP: "",
      lastNameM: "",
    });
    setQuery("");
  };

  const handlePhoneChange = (raw: string) => {
    // Solo dígitos, máximo 10
    const digitsOnly = raw.replace(/\D/g, "").slice(0, 10);
    onNewClientDataChange({
      ...newClientData,
      phone: digitsOnly,
    });
  };

  const phoneTouched = (newClientData.phone?.length ?? 0) > 0;
  const phoneValid = (newClientData.phone?.length ?? 0) === 10;

  return (
    <div ref={wrapperRef} className="relative sm:col-span-2">
      <label className="mb-1 block text-xs font-medium text-slate-500">
        Cliente
      </label>

      {selectedClient ? (
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-blue-600" />
            <div>
              <p className="font-medium text-slate-800">
                {clientLabel(selectedClient)}
              </p>
              {selectedClient.phone && (
                <p className="text-xs text-slate-500">
                  {selectedClient.phone}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            className={`${inputCls} pl-9`}
            placeholder="Buscar cliente por nombre..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value.toUpperCase());
              setOpen(true);

              if (isNewClient) {
                onIsNewClientChange(false);
              }
            }}
            onFocus={() => setOpen(true)}
          />

          {open && query.trim().length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              {searching ? (
                <div className="px-3 py-3 text-sm text-slate-500">
                  Buscando...
                </div>
              ) : results.length > 0 ? (
                <ul className="max-h-48 overflow-y-auto">
                  {results.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(c)}
                        className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span className="font-medium text-slate-800">
                          {clientLabel(c)}
                        </span>
                        {c.phone && (
                          <span className="text-xs text-slate-500">
                            {c.phone}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-3 py-3 text-sm text-slate-500">
                  No se encontró ningún cliente.
                </div>
              )}

              <button
                type="button"
                onClick={handleStartNewClient}
                className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2.5 text-left text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                <UserPlus size={16} />
                Agregar cliente nuevo
                {query.trim() && ` "${query}"`}
              </button>
            </div>
          )}
        </div>
      )}

      {isNewClient && (
        <div className="mt-3 space-y-4 rounded-lg border border-dashed border-slate-300 p-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Nombre
              </label>
              <input
                className={inputCls}
                placeholder="Nombre"
                value={newClientData.name}
                onChange={(e) =>
                  onNewClientDataChange({
                    ...newClientData,
                    name: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Apellido paterno
              </label>
              <input
                className={inputCls}
                placeholder="Apellido paterno"
                value={newClientData.lastNameP}
                onChange={(e) =>
                  onNewClientDataChange({
                    ...newClientData,
                    lastNameP: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Apellido materno
              </label>
              <input
                className={inputCls}
                placeholder="Apellido materno "
                value={newClientData.lastNameM}
                onChange={(e) =>
                  onNewClientDataChange({
                    ...newClientData,
                    lastNameM: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Número de teléfono
              </label>
              <input
                className={`${inputCls} ${
                  phoneTouched && !phoneValid ? "border-red-300" : ""
                }`}
                placeholder="10 dígitos"
                inputMode="numeric"
                type="tel"
                maxLength={10}
                value={newClientData.phone ?? ""}
                onChange={(e) => handlePhoneChange(e.target.value)}
              />
              {phoneTouched && !phoneValid && (
                <p className="mt-1 text-xs text-red-500">
                  Debe tener 10 dígitos ({newClientData.phone?.length ?? 0}/10).
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}