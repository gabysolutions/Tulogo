import { useState } from "react";
import Swal from "sweetalert2";
import { Search, Pencil, Trash2, RotateCcw, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useArticles } from "../../hooks/useArticles";
import { useCategories } from "../../hooks/useCategories";
import { ArticleFormModal } from "./ArticleFormModal";
import type { ArticleListItem } from "../../types/inventory";

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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-800">Artículos</h3>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700"
        >
          <Plus className="size-3.5" /> Nuevo artículo
        </button>
      </div>

      <div className="flex flex-wrap gap-3 border-b border-gray-200 px-5 py-4">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Buscar artículo..."
            className="w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <select
          value={categoryFilter ?? ""}
          onChange={(e) => {
            setPage(1);
            setCategoryFilter(e.target.value ? Number(e.target.value) : undefined);
          }}
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                <td className="px-5 py-3 text-gray-700">${Number(article.price).toLocaleString("es-MX")}</td>
                <td className="px-5 py-3 text-gray-500">${Number(article.cost).toLocaleString("es-MX")}</td>
                <td className="px-5 py-3">
                {article.satProductCode ? (
                  <>
                    <div className="font-mono text-xs text-gray-700">{article.satProductCode}</div>
                    <div className="text-xs text-gray-400">{article.satUnitCode}</div>
                  </>
                ) : (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Falta</span>
                )}
              </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingArticle(article)}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      aria-label="Editar"
                    >
                      <Pencil className="size-4" />
                    </button>
                    {article.status === 1 ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(article)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleActivate(article)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600"
                        aria-label="Activar"
                      >
                        <RotateCcw className="size-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !error && pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-xs text-gray-400">
            Página {pagination.page} de {pagination.totalPages} · {pagination.total} artículos
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