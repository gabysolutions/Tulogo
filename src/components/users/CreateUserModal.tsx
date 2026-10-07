// components/usuarios/CreateUserModal.tsx

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { ROLE_OPTIONS } from "../../types/user";
import type { CreateUserPayload, UserRole } from "../../types/user";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateUserPayload) => Promise<boolean>;
  submitting: boolean;
}

const emptyForm: CreateUserPayload = {
  name: "",
  paternal_last_name: "",
  maternal_last_name: "",
  role: "ventas",
  username: "",
  password: "",
};

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors";

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function CreateUserModal({ open, onClose, onSubmit, submitting }: Props) {
  const [form, setForm] = useState<CreateUserPayload>(emptyForm);
  const [attemptedSave, setAttemptedSave] = useState(false);

  if (!open) return null;

  const handleChange = (field: keyof CreateUserPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value } as CreateUserPayload));
  };

  const errors = {
    name: !form.name.trim() ? "El nombre es obligatorio." : undefined,
    paternal_last_name: !form.paternal_last_name.trim() ? "El apellido paterno es obligatorio." : undefined,
    maternal_last_name: !form.maternal_last_name.trim() ? "El apellido materno es obligatorio." : undefined,
    username: !form.username.trim() ? "El usuario es obligatorio." : undefined,
    password: !form.password.trim() ? "La contraseña es obligatoria." : undefined,
  };

  const canSave = Object.values(errors).every((e) => !e);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAttemptedSave(true);

    if (!canSave) return;

    const ok = await onSubmit(form);
    if (ok) {
      setForm(emptyForm);
      setAttemptedSave(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Invitar usuario</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Completa los datos para dar de alta a un nuevo usuario
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} id="create-user-form" className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <Field label="Nombre">
            <input
              className={`${inputCls} ${attemptedSave && errors.name ? "border-red-400" : ""}`}
              placeholder="Ej: Juan"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {attemptedSave && errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Apellido paterno">
              <input
                className={`${inputCls} ${attemptedSave && errors.paternal_last_name ? "border-red-400" : ""}`}
                placeholder="Ej: Pérez"
                value={form.paternal_last_name}
                onChange={(e) => handleChange("paternal_last_name", e.target.value)}
              />
              {attemptedSave && errors.paternal_last_name && (
                <p className="mt-1 text-xs text-red-600">{errors.paternal_last_name}</p>
              )}
            </Field>

            <Field label="Apellido materno">
              <input
                className={`${inputCls} ${attemptedSave && errors.maternal_last_name ? "border-red-400" : ""}`}
                placeholder="Ej: López"
                value={form.maternal_last_name}
                onChange={(e) => handleChange("maternal_last_name", e.target.value)}
              />
              {attemptedSave && errors.maternal_last_name && (
                <p className="mt-1 text-xs text-red-600">{errors.maternal_last_name}</p>
              )}
            </Field>
          </div>

          <Field label="Rol">
            <select
              className={`${inputCls} cursor-pointer`}
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value as UserRole)}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Usuario">
            <input
              className={`${inputCls} ${attemptedSave && errors.username ? "border-red-400" : ""}`}
              placeholder="Ej: jperez"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
            />
            {attemptedSave && errors.username && (
              <p className="mt-1 text-xs text-red-600">{errors.username}</p>
            )}
          </Field>

          <Field label="Contraseña">
            <input
              className={`${inputCls} ${attemptedSave && errors.password ? "border-red-400" : ""}`}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
            {attemptedSave && errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </Field>
        </form>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="create-user-form"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}