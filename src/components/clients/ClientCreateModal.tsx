import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import type { ClientPayload, ClientTaxInformationPayload } from "../../types/client";
import { CatalogSelect } from "./CatalogSelect";
import { FISCAL_REGIMES, CFDI_USES } from "../../constants/sat-catalogs";

interface ClientCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: ClientPayload, taxInfo?: ClientTaxInformationPayload) => Promise<void>;
}

type FormState = Omit<ClientPayload, "status" | "municipality" | "neighborhood" | "registrationDate">;


type TaxFormState = Omit<ClientTaxInformationPayload, "rfc">;

const EMPTY_FORM: FormState = {
  name: "",
  paternal_last_name: "",
  maternal_last_name: "",
  phone: "",
  email: "",
  rfc: "",
  street: "",
  number: "",
};

const EMPTY_TAX_FORM: TaxFormState = {
  fiscalName: "",
  fiscalRegime: "",
  fiscalZipCode: "",
  cfdiUse: "",
};

const RFC_REGEX = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/;

const inputClass =
  "w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500";

export function ClientCreateModal({ open, onClose, onSave }: ClientCreateModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [taxForm, setTaxForm] = useState<TaxFormState>(EMPTY_TAX_FORM);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleChange = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleTaxChange = (field: keyof TaxFormState) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setTaxForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setTaxForm(EMPTY_TAX_FORM);
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const rfc = (form.rfc ?? "").trim().toUpperCase();
    const { fiscalName, fiscalRegime, fiscalZipCode, cfdiUse } = taxForm;
    const hasAnyTax = !!(rfc || fiscalName.trim() || fiscalRegime || fiscalZipCode || cfdiUse);

    let taxInfo: ClientTaxInformationPayload | undefined;

    if (hasAnyTax) {
      if (!rfc || !fiscalName.trim() || !fiscalRegime || !fiscalZipCode || !cfdiUse) {
        Swal.fire({
          icon: "warning",
          title: "Datos fiscales incompletos",
          text: "Si capturas datos fiscales, completa RFC, razón social, régimen, C.P. fiscal y uso de CFDI.",
        });
        return;
      }
      if (!RFC_REGEX.test(rfc)) {
        Swal.fire({ icon: "warning", title: "RFC inválido", text: "Revisa el formato del RFC." });
        return;
      }
      if (!/^\d{5}$/.test(fiscalZipCode)) {
        Swal.fire({ icon: "warning", title: "C.P. inválido", text: "El código postal debe tener 5 dígitos." });
        return;
      }
      taxInfo = { rfc, fiscalName: fiscalName.trim(), fiscalRegime, fiscalZipCode, cfdiUse };
    }

    setSaving(true);
    try {
      await onSave(
        {
          ...form,
          rfc,
          registrationDate: new Date().toISOString(),
          status: 1,
        },
        taxInfo
      );
      handleClose();
    } catch {
      Swal.fire({
        icon: "error",
        title: "No se pudo crear el cliente",
        text: "Intenta de nuevo en unos segundos.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Nuevo cliente</h3>
            <p className="mt-0.5 text-xs text-slate-500">Registra un cliente nuevo en el sistema</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <section>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Datos del cliente
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nombre">
                  <input className={inputClass} value={form.name} onChange={handleChange("name")} required />
                </Field>
                <Field label="Apellido paterno">
                  <input className={inputClass} value={form.paternal_last_name} onChange={handleChange("paternal_last_name")} required />
                </Field>
                <Field label="Apellido materno">
                  <input className={inputClass} value={form.maternal_last_name} onChange={handleChange("maternal_last_name")} required />
                </Field>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Contacto
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Correo">
                  <input type="email" className={inputClass} value={form.email} onChange={handleChange("email")} />
                </Field>
                <Field label="Teléfono">
                  <input className={inputClass} value={form.phone} onChange={handleChange("phone")} required />
                </Field>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-5">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Datos fiscales
              </p>
              <p className="mb-3 text-xs text-slate-500">Opcional. Puedes completarlos después al editar el cliente.</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="RFC">
                  <input
                    className={`${inputClass} uppercase`}
                    value={form.rfc ?? ""}
                    onChange={handleChange("rfc")}
                    maxLength={13}
                  />
                </Field>
                <Field label="Razón social">
                  <input
                    className={inputClass}
                    value={taxForm.fiscalName}
                    onChange={handleTaxChange("fiscalName")}
                  />
                </Field>
                  <Field label="Régimen fiscal">
                                  <CatalogSelect
                                      value={taxForm.fiscalRegime}
                                      onChange={handleTaxChange("fiscalRegime")}
                                      options={FISCAL_REGIMES}
                                    />
                                </Field>
                <Field label="C.P. fiscal">
                  <input
                    className={inputClass}
                    value={taxForm.fiscalZipCode}
                    onChange={handleTaxChange("fiscalZipCode")}
                    placeholder="82139"
                    maxLength={5}
                    inputMode="numeric"
                  />
                </Field>
                  <Field label="Uso de CFDI">
                                  <CatalogSelect
                                    value={taxForm.cfdiUse}
                                    onChange={handleTaxChange("cfdiUse")}
                                    options={CFDI_USES}
                                  />
                                </Field>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Dirección
              </p>
              <div className="grid grid-cols-[1fr_auto] gap-4">
                <Field label="Calle">
                  <input className={inputClass} value={form.street} onChange={handleChange("street")} />
                </Field>
                <Field label="Número">
                  <input className={`${inputClass} w-24`} value={form.number} onChange={handleChange("number")} />
                </Field>
              </div>
              {/* TODO: cambiar a <select> con catálogo real cuando exista el endpoint de municipios/colonias */}
            </section>
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-5 py-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}