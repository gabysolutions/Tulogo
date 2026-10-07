import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, ChevronDown } from "lucide-react";
import { lastMonths, monthLabel } from "../../utils/format";

/* ───────────────────────── Select local (Tailwind) ───────────────────────── */

const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

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

function SelectTrigger({ className, children }: { className?: string; children: ReactNode }) {
  const { open, setOpen } = useSelect();
  return (
    <button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-9 items-center justify-between gap-2 rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
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

function SelectItem({
  value,
  children,
  className,
}: {
  value: string;
  children: string;
  className?: string;
}) {
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
        selected && "font-medium",
        className,
      )}
    >
      {children}
      {selected && <Check className="absolute right-2 size-4" />}
    </div>
  );
}

/* ───────────────────────── MonthSelector ───────────────────────── */

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function MonthSelector({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[190px] bg-card capitalize">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {lastMonths(12).map((m) => (
          <SelectItem key={m} value={m} className="capitalize">
            {monthLabel(m)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}