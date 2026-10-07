import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useDesigns } from "../../hooks/useDesigns";
import { useMyDesigns } from "../../hooks/useMyDesigns";
import { useFreeDesigns } from "../../hooks/useFreeDesigns";
import { DesignStatus } from "../../types/design";
import { DesignCard } from "../../components/designs/DesignCard";
import { DesignStatsBar } from "../../components/designs/DesignStatsBar";

const TABS: { label: string; value: DesignStatus | "all" }[] = [
  { label: "Todas", value: "all" },
  { label: "Pendientes", value: DesignStatus.PENDING },
  { label: "En revisión", value: DesignStatus.REVIEW },
  { label: "Aceptados", value: DesignStatus.APPROVED },
  { label: "Rechazados", value: DesignStatus.REJECTED },
];

type SortOrder = "recent" | "oldest";

const Designs = () => {
  const { user } = useAuth();
  const isDesigner = user?.role === "diseñador";

  const [search] = useState("");
  const [activeTab, setActiveTab] = useState<DesignStatus | "all">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [designerFilter, setDesignerFilter] = useState<string | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");

  const baseParams = {
    status: activeTab !== "all" ? activeTab : undefined,
    search: search || undefined,
    order: (sortOrder === "recent" ? "DESC" : "ASC") as "ASC" | "DESC",
  };

  const adminResult = useDesigns(isDesigner ? {} : baseParams);
  const myResult = useMyDesigns(isDesigner ? baseParams : {});
  const { freeDesigns } = useFreeDesigns();

  const { designs: baseDesigns, statusCounts, loading, error } = isDesigner
    ? myResult
    : adminResult;

  // Diseñador: sus diseños asignados + los disponibles, en un solo listado
  const designs = isDesigner ? [...baseDesigns, ...freeDesigns] : baseDesigns;

  

  const designerOptions = useMemo(() => {
    const names = new Set(
      designs.map((d) => d.designerName).filter((n) => n && n !== "SIN ASIGNAR")
    );
    return Array.from(names);
  }, [designs]);

  const filteredDesigns = useMemo(() => {
    let result = designs;

    if (!isDesigner && designerFilter !== "all") {
      result = result.filter((d) => d.designerName === designerFilter);
    }

    result = [...result].sort((a, b) => {
      const dateA = new Date(a.deliveryDate).getTime();
      const dateB = new Date(b.deliveryDate).getTime();
      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [designs, designerFilter, sortOrder, isDesigner]);

  const handleClearFilters = () => {
    setDesignerFilter("all");
    setSortOrder("recent");
  };

  if (loading) {
    return (
      <main className="mx-auto w-full px-6 py-8">
        <p className="text-sm text-slate-400">Cargando diseños...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full px-6 py-8">
        <p className="text-sm text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full px-6 py-8">
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Diseños</h1>
            <p className="text-sm text-slate-500">
              {isDesigner
                ? "Administra los diseños asignados a ti y los disponibles"
                : "Administra todas las propuestas y referencias de tus clientes"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            

            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                filtersOpen
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal size={18} />
              Filtros
            </button>
          </div>
        </div>

        {statusCounts && <DesignStatsBar statusCounts={statusCounts} />}

        <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.value)}
              className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab.value
                  ? "border-slate-800 text-slate-800"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          className={`grid overflow-hidden transition-all duration-300 ${
            filtersOpen ? "mb-6 grid-rows-[1fr] opacity-100" : "mb-0 grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
              {!isDesigner && (
                <select
                  value={designerFilter}
                  onChange={(e) => setDesignerFilter(e.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="all">Todos los diseñadores</option>
                  {designerOptions.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              )}

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="recent">Más recientes</option>
                <option value="oldest">Más antiguos</option>
              </select>

              <button
                onClick={handleClearFilters}
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:ml-auto"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {filteredDesigns.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredDesigns.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-400">
            No se encontraron diseños con esos filtros.
          </div>
        )}
      </div>
    </main>
  );
};

export default Designs;