import { useState } from "react";
import Swal from "sweetalert2";
import { Search, Pencil, Trash2, RotateCcw, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useArticles } from "../../hooks/useArticles";
import { useCategories } from "../../hooks/useCategories";
import { ArticleFormModal } from "./ArticleFormModal";
import type { ArticleListItem } from "../../types/inventory";

const money = (n: number | string) => `$${Number(n).toLocaleString("es-MX")}`;

function SatCode({ article }: { article: ArticleListItem }) {
  return article.satProductCode ? (
    <>
      <div className="font-mono text-xs text-gray-700">{article.satProductCode}</div>
      <div className="text-xs text-gray-400">{article.satUnitCode}</div>
    </>
  ) : (
    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
      Falta
    </span>
  );
}

function ArticleActions({
  article,
  onEdit,
  onDelete,
  onActivate,
}: {
  article: ArticleListItem;
  onEdit: (a: ArticleListItem) => void;
  onDelete: (a: ArticleListItem) => void;
  onActivate: (a: ArticleListItem) => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <button
        type="button"
        onClick={() => onEdit(article)}
        className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:p-1.5"
        aria-label="Editar"
      >
        <Pencil className="size-4" />
      </button>
      {article.status === 1 ? (
        <button
          type="button"
          onClick={() => onDelete(article)}
          className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 md:p-1.5"
          aria-label="Eliminar"
        >
          <Trash2 className="size-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onActivate(article)}
          className="rounded-md p-2 text-gray-400 hover:bg-green-50 hover:text-green-600 md:p-1.5"
          aria-label="Activar"
        >
          <RotateCcw className="size-4" />
        </button>
      )}
    </div>
  );
}

export function ArticleTab() {
  const {
    articles,
    pagination,
    loading,
    error,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    page,
    setPage,
    createArticle,
    updateArticle,
    deleteArticle,
    activateArticle,
  } = useArticles();
  const { categories } = useCategories();
  const [editingArticle, setEditingArticle] = useState<ArticleListItem | null>(null);
  const [creating, setCreating] = useState(false);

  const handleSave = async (payload: Parameters<typeof createArticle>[0]) => {
    if (editingArticle) {
      await updateArticle(editingArticle.id, payload);
    } else {
      await createArticle(payload);
    }
  };

  const handleDelete = async (article: ArticleListItem) => {
    const result = await Swal.fire({
      title: "¿Eliminar artículo?",
      text: `Se eliminará "${article.description}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;

    try {
      await deleteArticle(article.id);
      Swal.fire({ icon: "success", title: "Artículo eliminado", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "No se pudo eliminar el artículo" });
    }
  };

  const handleActivate = async (article: ArticleListItem) => {
    try {
      await activateArticle(article.id);
      Swal.fire({ icon: "success", title: "Artículo activado", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "No se pudo activar el artículo" });
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-4 sm:px-5">
        <h3 className="text-sm font-semibold text-gray-800">Artículos</h3>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 sm:py-1.5"
        >
          <Plus className="size-3.5" /> Nuevo artículo
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:flex-wrap sm:px-5">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Buscar artículo..."
            className="w-full rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 sm:py-1.5"
          />
        </div>
        <select
          value={categoryFilter ?? ""}
          onChange={(e) => {
            setPage(1);
            setCategoryFilter(e.target.value ? Number(e.target.value) : undefined);
          }}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 sm:w-auto sm:py-1.5"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.description}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="px-5 py-6 text-sm text-gray-400">Cargando artículos...</p>}
      {error && <p className="px-5 py-6 text-sm text-red-500">Error al cargar artículos.</p>}

      {!loading && !error && (
        <>
          {/* Móvil: tarjetas */}
          <div className="divide-y divide-gray-100 md:hidden">
            {articles.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-gray-400">Sin resultados.</p>
            )}
            {articles.map((article) => (
              <div key={article.id} className="space-y-3 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-700">{article.description}</p>
                    <p className="text-xs text-gray-500">{article.category}</p>
                  </div>
                  <ArticleActions
                    article={article}
                    onEdit={setEditingArticle}
                    onDelete={handleDelete}
                    onActivate={handleActivate}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Precio</p>
                    <p className="text-gray-700">{money(article.price)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Costo</p>
                    <p className="text-gray-500">{money(article.cost)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">SAT</p>
                    <SatCode article={article} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Escritorio / tablet: tabla */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-3">Descripción</th>
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-5 py-3">Precio</th>
                  <th className="px-5 py-3">Costo</th>
                  <th className="px-5 py-3">Código SAT</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {articles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-6 text-center text-sm text-gray-400">
                      Sin resultados.
                    </td>
                  </tr>
                )}
                {articles.map((article) => (
                  <tr key={article.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-700">{article.description}</td>
                    <td className="px-5 py-3 text-gray-500">{article.category}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-gray-700">{money(article.price)}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-gray-500">{money(article.cost)}</td>
                    <td className="px-5 py-3">
                      <SatCode article={article} />
                    </td>
                    <td className="px-5 py-3">
                      <ArticleActions
                        article={article}
                        onEdit={setEditingArticle}
                        onDelete={handleDelete}
                        onActivate={handleActivate}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Paginación */}
      {!loading && !error && pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-center text-xs text-gray-400 sm:text-left">
            Página {pagination.page} de {pagination.totalPages} · {pagination.total} artículos
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrev}
              className="inline-flex items-center justify-center gap-1 rounded-md border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 sm:py-1.5"
            >
              <ChevronLeft className="size-4" /> Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNext}
              className="inline-flex items-center justify-center gap-1 rounded-md border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 sm:py-1.5"
            >
              Siguiente <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      <ArticleFormModal
        open={creating}
        article={null}
        categories={categories}
        onClose={() => setCreating(false)}
        onSave={handleSave}
      />
      <ArticleFormModal
        open={editingArticle !== null}
        article={editingArticle}
        categories={categories}
        onClose={() => setEditingArticle(null)}
        onSave={handleSave}
      />
    </div>
  );
}