import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, X } from "lucide-react";
import { financeService } from "../../services/finance.service";
import type { ExpenseType, PaymentMethod } from "../../types/finance";
import { alertError, alertLoading, alertSuccess } from "../../utils/alerts";

/* ───────────────────────── UI local (Tailwind) ───────────────────────── */

const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

/* Button */
const buttonVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "border bg-card hover:bg-secondary",
  ghost: "hover:bg-secondary",
};

function Button({
  variant = "default",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonVariants }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium whitespace-nowrap transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

/* Input */
function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-md border bg-card px-3 text-sm outline-none",
        "placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/* Label */
function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm leading-none font-medium", className)} {...props} />;
}

/* Dialog */
const DialogContext = createContext<(v: boolean) => void>(() => {});

function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onOpenChange]);

  if (!open) return null;
  return <DialogContext.Provider value={onOpenChange}>{children}</DialogContext.Provider>;
}

function DialogContent({ className, children }: { className?: string; children: ReactNode }) {
  const onOpenChange = useContext(DialogContext);
  return createPortal(
    <div className="finance-theme fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 grid w-full max-w-lg gap-4 rounded-xl border bg-card p-6 shadow-xl",
          className,
        )}
      >
        {children}
        <button
          type="button"
          aria-label="Cerrar"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground hover:bg-secondary"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>,
    document.body,
  );
}

function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-1.5 pr-6", className)} {...props} />;
}

function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />;
}

function DialogDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
  );
}

/* Select */
interface SelectContextValue {
  value: string;
  onValueChange: (v: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  labels: Record<string, string>;
  register: (value: string, label: string) => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelect() {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error("Los componentes Select* deben usarse dentro de <Select>");
  return ctx;
}

function Select({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const ref = useRef<HTMLDivElement>(null);

  const register = useCallback((v: string, label: string) => {
    setLabels((prev) => (prev[v] === label ? prev : { ...prev, [v]: label }));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, labels, register }}>
      <div ref={ref} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ children }: { children: ReactNode }) {
  const { open, setOpen } = useSelect();
  return (
    <button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className="flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
      <ChevronDown className="size-4 shrink-0 opacity-50" />
    </button>
  );
}

function SelectValue() {
  const { value, labels } = useSelect();
  return <span className="truncate">{labels[value] ?? ""}</span>;
}

function SelectContent({ children }: { children: ReactNode }) {
  const { open } = useSelect();
  // Siempre montado (oculto) para que los items registren su etiqueta
  return (
    <div
      role="listbox"
      className={cn(
        "absolute top-full left-0 z-50 mt-1 max-h-60 w-full min-w-32 overflow-auto rounded-md border bg-card p-1 shadow-lg",
        !open && "hidden",
      )}
    >
      {children}
    </div>
  );
}

function SelectItem({ value, children }: { value: string; children: string }) {
  const ctx = useSelect();
  const selected = ctx.value === value;

  useLayoutEffect(() => {
    ctx.register(value, children);
  }, [ctx.register, value, children]);

  return (
    <div
      role="option"
      aria-selected={selected}
      onClick={() => {
        ctx.onValueChange(value);
        ctx.setOpen(false);
      }}
      className={cn(
        "relative flex cursor-pointer items-center rounded-sm py-1.5 pr-8 pl-2 text-sm select-none hover:bg-secondary",
        selected && "bg-accent font-medium",
      )}
    >
      {children}
      {selected && <Check className="absolute right-2 size-4" />}
    </div>
  );
}

/* ───────────────────────── ExpenseDialog ───────────────────────── */

const TYPES: { value: ExpenseType; label: string }[] = [
  { value: "servicio", label: "Servicio" },
  { value: "renta", label: "Renta" },
  { value: "material", label: "Material" },
  { value: "transporte", label: "Transporte" },
  { value: "publicidad", label: "Publicidad" },
  { value: "mantenimiento", label: "Mantenimiento" },
];

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}

export function ExpenseDialog({ open, onOpenChange, onCreated }: Props) {
  const [type, setType] = useState<ExpenseType>("servicio");
  const [method, setMethod] = useState<PaymentMethod>("efectivo");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setType("servicio");
    setMethod("efectivo");
    setAmount("");
    setError("");
  };

  const save = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return setError("Escribe un monto válido.");

    setSaving(true);
    setError("");
    onOpenChange(false); // cierra el modal antes de mostrar el alert
    void alertLoading("Agregando gasto…", "Estamos registrando el gasto.");
    try {
      const res = await financeService.createExpense({
        amount: value,
        type,
        paymentMethod: method,
      });
      reset();
      onCreated();
      void alertSuccess(res.message, "¡Gasto registrado!");
    } catch {
      await alertError("No se pudo registrar el gasto.");
      onOpenChange(true); // reabre el modal con los datos que ya había capturado
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar gasto</DialogTitle>
          <DialogDescription>Anota una salida de dinero del negocio.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Tipo de gasto</Label>
            <Select value={type} onValueChange={(v) => setType(v as ExpenseType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="e-amount">Monto</Label>
              <Input
                id="e-amount"
                type="number"
                min={0.01}
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Método de pago</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Guardando…" : "Guardar gasto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}