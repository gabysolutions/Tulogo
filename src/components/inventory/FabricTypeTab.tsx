import { useState } from "react";
import Swal from "sweetalert2";
import { useFabricTypes } from "../../hooks/useFabricTypes";
import { CatalogTable } from "./CatalogTable";
import { CatalogFormModal } from "./CatalogFormModal";
import type { FabricType } from "../../types/inventory";

export function FabricTypeTab() {
  const {
    fabricTypes,
    loading,
    error,
    createFabricType,
    updateFabricType,
    deleteFabricType,
    activateFabricType,
  } = useFabricTypes();
  const [editingItem, setEditingItem] = useState<FabricType | null>(null);
  const [creating, setCreating] = useState(false);

  const handleSave = async (description: string) => {
    if (editingItem) {
      await updateFabricType(editingItem.id, { description });
    } else {
      await createFabricType({ description });
    }
  };

  const handleDelete = async (item: FabricType) => {
    const result = await Swal.fire({
      title: "¿Eliminar tipo de tela?",
      text: `Se eliminará "${item.description}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;

    try {
      await deleteFabricType(item.id);
      Swal.fire({ icon: "success", title: "Tipo de tela eliminado", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "No se pudo eliminar el tipo de tela" });
    }
  };

  const handleActivate = async (item: FabricType) => {
    try {
      await activateFabricType(item.id);
      Swal.fire({ icon: "success", title: "Tipo de tela activado", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "No se pudo activar el tipo de tela" });
    }
  };

  return (
    <>
      <CatalogTable
        title="Tipos de tela"
        items={fabricTypes}
        loading={loading}
        error={error}
        onAdd={() => setCreating(true)}
        onEdit={setEditingItem}
        onDelete={handleDelete}
        onActivate={handleActivate}
      />
      <CatalogFormModal
        open={creating}
        title="tipo de tela"
        item={null}
        onClose={() => setCreating(false)}
        onSave={handleSave}
      />
      <CatalogFormModal
        open={editingItem !== null}
        title="tipo de tela"
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSave}
      />
    </>
  );
}