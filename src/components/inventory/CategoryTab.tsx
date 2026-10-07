import { useState } from "react";
import { useCategories } from "../../hooks/useCategories";
import { CatalogTable } from "./CatalogTable";
import { CatalogFormModal } from "./CatalogFormModal";
import type { Category } from "../../types/inventory";

export function CategoryTab() {
  const { categories, loading, error, createCategory, updateCategory } = useCategories();
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  const handleSave = async (description: string) => {
    if (editingItem) {
      await updateCategory(editingItem.id, { description });
    } else {
      await createCategory({ description });
    }
  };

  return (
    <>
      <CatalogTable
        title="Categorías"
        items={categories}
        loading={loading}
        error={error}
        onAdd={() => setCreating(true)}
        onEdit={setEditingItem}
      />
      <CatalogFormModal
        open={creating}
        title="categoría"
        item={null}
        onClose={() => setCreating(false)}
        onSave={handleSave}
      />
      <CatalogFormModal
        open={editingItem !== null}
        title="categoría"
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSave}
      />
    </>
  );
}