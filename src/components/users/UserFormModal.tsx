import { useEffect, useState, type FormEvent } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import { ROLE_OPTIONS } from "../../types/user";
import type { CreateUserPayload, UpdateUserPayload, User, UserRole } from "../../types/user";

type FormState = {
  name: string;
  paternal_last_name: string;
  maternal_last_name: string;
  role: UserRole;
  username: string;
  password: string;
};

interface Props {
  open: boolean;
  mode: "create" | "edit";
  initialUser?: User | null;
  onClose: () => void;
  onCreate: (payload: CreateUserPayload) => Promise<boolean>;
  onUpdate: (id: number, payload: UpdateUserPayload) => Promise<boolean>;
  submitting: boolean;
}

const emptyForm: FormState = {
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

export default function UserFormModal({
  open,
  mode,
  initialUser,
  onClose,
  onCreate,
  onUpdate,
  submitting,
}: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const UPPERCASE_FIELDS: (keyof FormState)[] = ["name", "paternal_last_name", "maternal_last_name"];

  useEffect(() => {
    if (mode === "edit" && initialUser) {
      setForm({
        name: initialUser.name.toUpperCase(),
        paternal_last_name: initialUser.paternal_last_name.toUpperCase(),
        maternal_last_name: initialUser.maternal_last_name.toUpperCase(),
        role: initialUser.role,
        username: initialUser.username,
        password: "",
      });
    } else {
      setForm(emptyForm);
    }
    setAttemptedSave(false);
  }, [mode, initialUser, open]);

  if (!open) return null;

  const handleChange = (field: keyof FormState, value: string) => {
    const finalValue = UPPERCASE_FIELDS.includes(field) ? value.toUpperCase() : value;
    setForm((prev) => ({ ...prev, [field]: finalValue }));
  };

  const errors = {
    name: !form.name.trim() ? "El nombre es obligatorio." : undefined,
    paternal_last_name: !form.paternal_last_name.trim() ? "El apellido paterno es obligatorio." : undefined,
    maternal_last_name: !form.maternal_last_name.trim() ? "El apellido materno es obligatorio." : undefined,
    username: !form.username.trim() ? "El usuario es obligatorio." : undefined,
    // Solo obligatoria al crear; al editar se puede dejar en blanco para no cambiarla
    password: mode === "create" && !form.password.trim() ? "La contraseña es obligatoria." : undefined,
  };

  const canSave = Object.values(errors).every((e) => !e);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setAttemptedSave(true);

    if (!canSave) return;

    // Confirmación solo al editar
    if (mode === "edit") {
      const result = await Swal.fire({
        icon: "question",
        title: "¿Guardar cambios?",
        text: form.password.trim()
          ? `Se actualizarán los datos y la contraseña de ${form.name} ${form.paternal_last_name}.`
          : `Se actualizarán los datos de ${form.name} ${form.paternal_last_name}.`,
        showCancelButton: true,
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#2563eb",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;
    }

    try {
      const ok =
        mode === "create"
          ? await onCreate(form)
          : await onUpdate(initialUser!.id, {
              name: form.name,
              paternal_last_name: form.paternal_last_name,
              maternal_last_name: form.maternal_last_name,
              role: form.role,
              username: form.username,
              // Solo se manda si el usuario escribió una nueva
              ...(form.password.trim() ? { password: form.password } : {}),
            });

      if (ok) {
        setForm(emptyForm);
        setAttemptedSave(false);
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: mode === "create" ? "No se pudo crear el usuario" : "No se pudo actualizar el usuario",
          text: "Verifica los datos e intenta de nuevo.",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: mode === "create" ? "No se pudo crear el usuario" : "No se pudo actualizar el usuario",
        text: "Ocurrió un error inesperado. Intenta de nuevo en unos segundos.",
      });
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
            <h3 className="text-sm font-semibold text-slate-800">
              {mode === "create" ? "Invitar usuario" : "Editar usuario"}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {mode === "create"
                ? "Completa los datos para dar de alta a un nuevo usuario"
                : "Actualiza los datos del usuario"}
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
        <form onSubmit={handleSubmit} id="user-form" className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
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
            <div className="relative">
              <input
                className={`${inputCls} pr-10 ${attemptedSave && errors.password ? "border-red-400" : ""}`}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {attemptedSave && errors.password ? (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            ) : mode === "edit" ? (
              <p className="mt-1 text-xs text-slate-400"></p>
            ) : null}
          </Field>
        </form>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="user-form"
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