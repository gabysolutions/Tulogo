import { useState, useEffect, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import type { Client, ClientTaxInformationPayload } from "../../types/client";
import { CatalogSelect } from "./CatalogSelect";
import { FISCAL_REGIMES, CFDI_USES } from "../../constants/sat-catalogs";

interface ClientEditModalProps {
  client: Client | null;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Client) => Promise<void>;
  onSaveTaxInfo: (clientId: number, payload: ClientTaxInformationPayload) => Promise<void>;
}

type FormState = Pick<
  Client,
  "name" | "paternal_last_name" | "maternal_last_name" | "phone" | "email" | "rfc"
>;

type TaxFormState = Omit<ClientTaxInformationPayload, "rfc">;

const EMPTY_FORM: FormState = {
  name: "",
  paternal_last_name: "",
  maternal_last_name: "",
  phone: "",
  email: "",
  rfc: "",
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

export function ClientEditModal({ client, open, onClose, onSave, onSaveTaxInfo }: ClientEditModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [taxForm, setTaxForm] = useState<TaxFormState>(EMPTY_TAX_FORM);
  const [saving, setSaving] = useState(false);
  const [savingTax, setSavingTax] = useState(false);

  useEffect(() => {
    if (client) {
     const { name, paternal_last_name, maternal_last_name, phone, email, rfc } = client;
     setForm({ name, paternal_last_name, maternal_last_name, phone, email, rfc });
      setTaxForm({
        fiscalName: client.fiscalName ?? "",
        fiscalRegime: client.fiscalRegime ?? "",
        fiscalZipCode: client.fiscalZipCode ?? "",
        cfdiUse: client.cfdiUse ?? "",
      });
    }
  }, [client]);

  if (!open || !client) return null;

  const handleChange = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTaxChange =
  (field: keyof TaxFormState) =>
  (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setTaxForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...client, ...form });
      onClose();
    } catch {
      Swal.fire({
        icon: "error",
        title: "No se pudo actualizar el cliente",
        text: "Intenta de nuevo en unos segundos.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTax = async () => {
    const rfc = (form.rfc ?? "").trim().toUpperCase();

    if (!rfc || !taxForm.fiscalName.trim() || !taxForm.fiscalRegime || !taxForm.fiscalZipCode || !taxForm.cfdiUse) {
      Swal.fire({
        icon: "warning",
        title: "Datos fiscales incompletos",
        text: "Completa RFC, razón social, régimen, C.P. fiscal y uso de CFDI.",
      });
      return;
    }
    if (!RFC_REGEX.test(rfc)) {
      Swal.fire({ icon: "warning", title: "RFC inválido", text: "Revisa el formato del RFC." });
      return;
    }
    if (!/^\d{5}$/.test(taxForm.fiscalZipCode)) {
      Swal.fire({ icon: "warning", title: "C.P. inválido", text: "El código postal debe tener 5 dígitos." });
      return;
    }

    setSavingTax(true);
    try {
      await onSaveTaxInfo(client.id, { rfc, ...taxForm });
      setForm((prev) => ({ ...prev, rfc }));
      Swal.fire({
        icon: "success",
        title: "Datos fiscales actualizados",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "No se pudieron guardar los datos fiscales",
        text: "Intenta de nuevo en unos segundos.",
      });
    } finally {
      setSavingTax(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Editar cliente</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Modificando los datos de {client.fullName || client.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
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
                  <input className={inputClass} value={form.name} onChange={handleChange("name")} />
                </Field>
                <Field label="Apellido paterno">
                  <input className={inputClass} value={form.paternal_last_name} onChange={handleChange("paternal_last_name")} />
                </Field>
                <Field label="Apellido materno">
                  <input className={inputClass} value={form.maternal_last_name} onChange={handleChange("maternal_last_name")} />
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
                  <input className={inputClass} value={form.phone} onChange={handleChange("phone")} />
                </Field>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Datos fiscales
                </p>
                <button
                  type="button"
                  onClick={handleSaveTax}
                  disabled={savingTax}
                  className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingTax ? "Guardando..." : "Guardar datos fiscales"}
                </button>
              </div>
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

            {/* TODO: cambiar a <select> con catálogo real cuando exista el endpoint de municipios/colonias */}
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
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
              {saving ? "Guardando..." : "Guardar cambios"}
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