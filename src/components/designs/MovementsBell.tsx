import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Loader2 } from "lucide-react";

import { useDesignMovements } from "../../hooks/useDesignMovements";

function movementColor(comment: string): string {
  const text = comment.toLowerCase();
  if (text.includes("aceptó") || text.includes("aceptado")) return "bg-emerald-500";
  if (text.includes("rechazó") || text.includes("rechazado")) return "bg-red-500";
  if (text.includes("cancel")) return "bg-amber-500";
  return "bg-blue-500";
}

export function MovementsBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { movements, pagination, loading, loadingMore, error, loadMore } = useDesignMovements();

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

    const handleItemClick = (designId: number) => {
    setOpen(false);
    navigate(`/diseños/${designId}`);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Movimientos recientes"
      >
        <Bell size={20} />
        {pagination && pagination.total > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">
            {pagination.total > 99 ? "99+" : pagination.total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-800">Movimientos recientes</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">Cargando...</p>
            ) : error ? (
              <p className="px-4 py-6 text-center text-sm text-red-500">{error}</p>
            ) : movements.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">Sin movimientos aún</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {movements.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(m.designId)}
                      className="flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${movementColor(m.comment)}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-700">Diseño #{m.designId}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{m.comment}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{m.registration_date}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {pagination?.hasNext && (
            <div className="border-t border-slate-100 p-2">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-50 disabled:opacity-60"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Cargando...
                  </>
                ) : (
                  "Ver más"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}