// src/pages/users/Users.tsx

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "../../components/ui/page-header";
import RoleSummaryCards from "../../components/users/RoleSummaryCards";
import UsersTable from "../../components/users/UsersTable";
import UserFormModal from "../../components/users/UserFormModal";
import UserPrivilegesModal from "../../components/users/UserPrivilegesModal";
import { useUsers } from "../../hooks/useUsers";
import type { User } from "../../types/user";

export default function Users() {
  const { users, loading, submitting, createUser, updateUser, deleteUser, toggleStatus } = useUsers();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [privilegesOpen, setPrivilegesOpen] = useState(false);
  const [privilegesUser, setPrivilegesUser] = useState<User | null>(null);

  const openCreateModal = () => {
    setFormMode("create");
    setSelectedUser(null);
    setFormOpen(true);
  };

  const openEditModal = (user: User) => {
    setFormMode("edit");
    setSelectedUser(user);
    setFormOpen(true);
  };

  const openPrivilegesModal = (id: number) => {
    const user = users.find((u) => u.id === id) ?? null;
    setPrivilegesUser(user);
    setPrivilegesOpen(true);
  };

  return (
    <main className="flex min-h-screen flex-col gap-6 bg-gray-100">
      <div className="space-y-6 bg-gray-100 p-6">
      <PageHeader
        title="Usuarios y roles"
        description="Administra accesos, permisos y perfiles del equipo."
        actions={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-m text-white shadow-m shadow-primary/30 hover:bg-blue-500"
          >
            <Plus className="size-5 text-white" /> Invitar usuario
          </button>
        }
      />

      <RoleSummaryCards users={users} />

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
      ) : (
        <UsersTable
          users={users}
          onEdit={openEditModal}
          onDelete={deleteUser}
          onToggleStatus={toggleStatus}
          onViewPrivileges={openPrivilegesModal}
        />
      )}

      <UserFormModal
        open={formOpen}
        mode={formMode}
        initialUser={selectedUser}
        onClose={() => setFormOpen(false)}
        onCreate={createUser}
        onUpdate={updateUser}
        submitting={submitting}
      />

      <UserPrivilegesModal
        open={privilegesOpen}
        user={privilegesUser}
        onClose={() => setPrivilegesOpen(false)}
      />
    </div>
    </main>
  );
}