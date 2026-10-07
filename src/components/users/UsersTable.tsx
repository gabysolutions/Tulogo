// components/usuarios/UsersTable.tsx

import { Pencil, ShieldCheck, Trash2, Power } from "lucide-react";
import Swal from "sweetalert2";
import { StatusBadge } from "../../components/ui/status-badge";
import { ROLE_OPTIONS } from "../../types/user";
import type { User } from "../../types/user";

interface Props {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => Promise<boolean>;
  onToggleStatus: (id: number, currentStatus: number) => Promise<boolean>;
  onViewPrivileges: (id: number) => void;
}

const roleLabel = (role: User["role"]) =>
  ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;

export default function UsersTable({
  users,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewPrivileges,
}: Props) {
  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      icon: "warning",
      title: `¿Eliminar a ${name}?`,
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    const ok = await onDelete(id);
    if (ok) {
      Swal.fire({ icon: "success", title: "Usuario eliminado", timer: 1500, showConfirmButton: false });
    } else {
      Swal.fire({ icon: "error", title: "No se pudo eliminar el usuario", text: "Intenta de nuevo en unos segundos." });
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: number, name: string) => {
    const activating = currentStatus === 0;

    const result = await Swal.fire({
      icon: "question",
      title: activating ? `¿Activar a ${name}?` : `¿Desactivar a ${name}?`,
      text: activating
        ? "El usuario podrá volver a iniciar sesión."
        : "El usuario perderá acceso al sistema.",
      showCancelButton: true,
      confirmButtonText: activating ? "Sí, activar" : "Sí, desactivar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
    });

    if (!result.isConfirmed) return;

    const ok = await onToggleStatus(id, currentStatus);
    if (ok) {
      Swal.fire({
        icon: "success",
        title: activating ? "Usuario activado" : "Usuario desactivado",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({ icon: "error", title: "No se pudo actualizar el estatus", text: "Intenta de nuevo en unos segundos." });
    }
  };

  return (
    <div className="rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            {["Usuario", "Rol", "Estado", "Acciones"].map((h) => (
              <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white border border-slate-200">
          {users.map((u) => (
            <tr key={u.id} className="border border-slate-200 hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-blue-700 grid place-items-center text-white text-xs font-semibold">
                    {u.name.split(" ").map((p) => p[0]).join("")}
                  </div>
                  <span className="font-medium">
                    {u.name} {u.paternal_last_name} {u.maternal_last_name}
                  </span>
                </div>
              </td>

              <td className="px-4 py-3">
                <span className="inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium">
                  {roleLabel(u.role)}
                </span>
              </td>

              <td className="px-4 py-3">
                <StatusBadge status={u.status === 1 ? "Activo" : "Inactivo"} />
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(u)}
                    title="Editar usuario"
                    className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Pencil className="size-4" />
                  </button>

                  <button
                    onClick={() => onViewPrivileges(u.id)}
                    title="Ver permisos"
                    className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
                  >
                    <ShieldCheck className="size-4" />
                  </button>

                  {u.status === 0 && (
                    <button
                      onClick={() => handleToggleStatus(u.id, u.status, u.name)}
                      title="Activar usuario"
                      className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
                    >
                      <Power className="size-4" />
                    </button>
                  )}

                  {u.status === 1 && (
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      title="Eliminar usuario"
                      className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
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
    </div>
  );
}