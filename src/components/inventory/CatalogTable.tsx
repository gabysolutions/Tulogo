import { Pencil, Plus, Trash2, RotateCcw } from "lucide-react";

interface CatalogItem {
  id: number;
  description: string;
  status?: number;
}

interface CatalogTableProps<T extends CatalogItem> {
  title: string;
  items: T[];
  loading: boolean;
  error: Error | null;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete?: (item: T) => void;
  onActivate?: (item: T) => void;
}

export function CatalogTable<T extends CatalogItem>({
  title,
  items,
  loading,
  error,
  onAdd,
  onEdit,
  onDelete,
  onActivate,
}: CatalogTableProps<T>) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700"
        >
          <Plus className="size-3.5" /> Nuevo
        </button>
      </div>

      {loading && <p className="px-5 py-6 text-sm text-gray-400">Cargando...</p>}
      {error && <p className="px-5 py-6 text-sm text-red-500">Error al cargar.</p>}

      {!loading && !error && (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="px-5 py-3">Descripción</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={2} className="px-5 py-6 text-center text-sm text-gray-400">
                  Sin registros.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-700">{item.description}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      aria-label="Editar"
                    >
                      <Pencil className="size-4" />
                    </button>
                    {onDelete && onActivate ? (
                      item.status === 1 ? (
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onActivate(item)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600"
                          aria-label="Activar"
                        >
                          <RotateCcw className="size-4" />
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        disabled
                        title="Próximamente"
                        className="cursor-not-allowed rounded-md p-1.5 text-gray-300"
                        aria-label="Eliminar (próximamente)"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}