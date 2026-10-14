import { useEffect, type ReactNode } from "react";

export function Modal({ open, onClose, labelledBy, children }: { open: boolean; onClose: () => void; labelledBy: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <div className="absolute inset-0 bg-foreground/50 animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-t-3xl bg-card p-5 shadow-card animate-in slide-in-from-bottom-8 sm:rounded-3xl">
        {children}
      </div>
    </div>
  );
}