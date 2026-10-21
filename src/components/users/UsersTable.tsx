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

const fullName = (u: User) =>
  [u.name, u.paternal_last_name, u.maternal_last_name].filter(Boolean).join(" ");

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

function Avatar({ name }: { name: string }) {
  return (
    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-700 text-xs font-semibold text-white">
      {initials(name)}
    </div>
  );
}

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

  // Botones de acciones: se reutilizan en la tabla y en las tarjetas móviles
  const renderActions = (u: User) => (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onEdit(u)}
        title="Editar usuario"
        aria-label="Editar usuario"
        className="rounded-md p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700 md:p-1.5"
      >
        <Pencil className="size-4" />
      </button>

      <button
        onClick={() => onViewPrivileges(u.id)}
        title="Ver permisos"
        aria-label="Ver permisos"
        className="rounded-md p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700 md:p-1.5"
      >
        <ShieldCheck className="size-4" />
      </button>

      {u.status === 0 && (
        <button
          onClick={() => handleToggleStatus(u.id, u.status, u.name)}
          title="Activar usuario"
          aria-label="Activar usuario"
          className="rounded-md p-2 text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-600 md:p-1.5"
        >
          <Power className="size-4" />
        </button>
      )}

      {u.status === 1 && (
        <button
          onClick={() => handleDelete(u.id, u.name)}
          title="Eliminar usuario"
          aria-label="Eliminar usuario"
          className="rounded-md p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 md:p-1.5"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Móvil: tarjetas */}
      <div className="divide-y divide-slate-200 md:hidden">
        {users.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-400">Sin usuarios.</p>
        )}
        {users.map((u) => (
          <div key={u.id} className="flex items-start gap-3 px-4 py-4">
            <Avatar name={u.name} />

            <div className="min-w-0 flex-1 space-y-2">
              <p className="font-medium text-slate-800">{fullName(u)}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  {roleLabel(u.role)}
                </span>
                <StatusBadge status={u.status === 1 ? "Activo" : "Inactivo"} />
              </div>
            </div>

            <div className="shrink-0">{renderActions(u)}</div>
          </div>
        ))}
      </div>

      {/* Tablet / escritorio: tabla */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {["Usuario", "Rol", "Estado", "Acciones"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} />
                    <span className="font-medium">{fullName(u)}</span>
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

                <td className="px-4 py-3">{renderActions(u)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}