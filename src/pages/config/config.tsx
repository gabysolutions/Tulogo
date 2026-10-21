import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Loader2, Save } from "lucide-react";
import { getConfig, updateConfig } from "../../services/config.service";
import type { Config as ConfigType } from "../../types/config";

const emptyConfig: ConfigType = {
  companyName: "",
  phone: "",
  email: "",
  rfc: "",
  zipCode: "",
  city: "",
  state: "",
  street: "",
  number: "",
  neighborhood: "",
};

type Field = {
  label: string;
  key: keyof ConfigType;
  span?: string;
  inputMode?: "text" | "tel" | "numeric" | "email";
};

// "sm:col-span-2": en móvil la cuadrícula es de 1 columna, así que no se debe forzar col-span-2
const fields: Field[] = [
  { label: "Nombre de la empresa", key: "companyName", span: "sm:col-span-2" },
  { label: "RFC", key: "rfc" },
  { label: "Teléfono", key: "phone", inputMode: "tel" },
  { label: "Correo electrónico", key: "email", span: "sm:col-span-2", inputMode: "email" },
  { label: "Calle", key: "street" },
  { label: "Número", key: "number" },
  { label: "Colonia", key: "neighborhood" },
  { label: "Código Postal", key: "zipCode", inputMode: "numeric" },
  { label: "Ciudad", key: "city" },
  { label: "Estado", key: "state" },
];

export const Config = () => {
  const [config, setConfig] = useState<ConfigType>(emptyConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getConfig();
        setConfig(data);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar la configuración.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleChange = (field: keyof ConfigType, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await updateConfig(config);
      Swal.fire({
        icon: "success",
        title: "¡Listo!",
        text: response.message,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar la configuración.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-semibold text-gray-800 sm:mb-6 sm:text-2xl">
        Configuración
      </h1>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map(({ label, key, span, inputMode }) => (
            <div key={key} className={`min-w-0 ${span ?? ""}`}>
              <label
                htmlFor={key}
                className="mb-1 block text-sm font-medium text-gray-600"
              >
                {label}
              </label>
              <input
                id={key}
                type={key === "email" ? "email" : "text"}
                inputMode={inputMode}
                value={config[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                // text-base en móvil evita el zoom automático de iOS al enfocar el campo
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:py-2 sm:text-sm"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex sm:justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60 sm:w-auto sm:py-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default Config;