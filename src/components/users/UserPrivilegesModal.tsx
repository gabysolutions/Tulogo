

import { useEffect, useMemo, useState } from "react";
import { X, Search, Check } from "lucide-react";
import { getAllPrivilegesService, getUserPrivilegesService } from "../../services/user.service";
import { ROLE_OPTIONS } from "../../types/user";
import type { User, UserPrivilege } from "../../types/user";

interface Props {
  open: boolean;
  user: User | null;
  onClose: () => void;
}

const roleLabel = (role: User["role"]) =>
  ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;

export default function UserPrivilegesModal({ open, user, onClose }: Props) {
  const [allPrivileges, setAllPrivileges] = useState<UserPrivilege[]>([]);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !user) return;

    const fetchPrivileges = async () => {
      try {
        setLoading(true);
        setSearch("");

        const [catalog, userPrivileges] = await Promise.all([
          getAllPrivilegesService(),
          getUserPrivilegesService(user.id),
        ]);

        setAllPrivileges(catalog);
        setChecked(new Set(userPrivileges.map((p) => p.id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivileges();
  }, [open, user]);

  const filteredPrivileges = useMemo(() => {
    if (!search.trim()) return allPrivileges;
    const q = search.toLowerCase();
    return allPrivileges.filter(
      (p) => p.description.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)
    );
  }, [allPrivileges, search]);

  if (!open || !user) return null;

  const toggle = (id: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // TODO: reemplazar por la llamada real, ej:
      // await updateUserPrivilegesService(user.id, Array.from(checked));

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Permisos de {user.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Rol: <span className="font-medium text-slate-700">{roleLabel(user.role)}</span>
              {" · "}
              Seleccionados: <span className="font-medium text-slate-700">{checked.size}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Search */}
        <div className="shrink-0 px-6 pt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar permiso..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <p className="text-sm text-slate-500">Cargando permisos...</p>
          ) : filteredPrivileges.length === 0 ? (
            <p className="text-sm text-slate-500">No se encontraron permisos.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredPrivileges.map((p) => {
                const isChecked = checked.has(p.id);
                return (
                  <li key={p.id}>
                    <label className="flex cursor-pointer items-center justify-between gap-3 py-3 -mx-2 px-2 rounded-lg transition-colors hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid size-5 place-items-center rounded-md border transition-colors ${
                            isChecked
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="size-3.5 text-white" strokeWidth={3} />}
                        </span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggle(p.id)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium text-slate-700">{p.description}</span>
                      </div>

                      {isChecked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
                          <span className="size-1.5 rounded-full bg-green-500" />
                          Activo
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar permisos"}
          </button>
        </div>
      </div>
    </div>
  );
}