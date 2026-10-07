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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const fields: { label: string; key: keyof ConfigType; span?: string }[] = [
    { label: "Nombre de la empresa", key: "companyName", span: "col-span-2" },
    { label: "RFC", key: "rfc" },
    { label: "Teléfono", key: "phone" },
    { label: "Correo electrónico", key: "email", span: "col-span-2" },
    { label: "Calle", key: "street" },
    { label: "Número", key: "number" },
    { label: "Colonia", key: "neighborhood" },
    { label: "Código Postal", key: "zipCode" },
    { label: "Ciudad", key: "city" },
    { label: "Estado", key: "state" },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Configuración
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ label, key, span }) => (
            <div key={key} className={span}>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {label}
              </label>
              <input
                type={key === "email" ? "email" : "text"}
                value={config[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default Config;