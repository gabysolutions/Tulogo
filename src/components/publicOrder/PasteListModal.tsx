import { useState } from "react";
import { X } from "lucide-react";
import { Modal } from "./Modal";

export interface ParsedRow {
  nickname: string;
  number: string;
  size: string;
  sizeFlagged: boolean;
}


const SIZE_GROUPS: string[][] = [
  ["xch", "xs", "extra chica", "extrachica", "xchica"],
  ["ch", "s", "chica", "small"],
  ["m", "med", "mediana", "mediano", "medium"],
  ["g", "l", "grande", "large"],
  ["xg", "xl", "extra grande", "extragrande"],
  ["xxg", "xxl", "2xl", "2xg"],
];

export function normalizeSize(raw: string, sizes: string[]): string {
  const v = raw.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!v) return "";
  const direct = sizes.find((s) => s.toLowerCase() === v);
  if (direct) return direct;
  const group = SIZE_GROUPS.find((g) => g.includes(v));
  if (!group) return "";
  return sizes.find((s) => group.includes(s.toLowerCase())) ?? "";
}

export function parseList(text: string, sizes: string[]): ParsedRow[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", num = "", size = ""] = line.split(/[,;\t]/).map((p) => p.trim());
      const norm = normalizeSize(size, sizes);
      return {
        nickname: name.toUpperCase().slice(0, 20),
        number: num.replace(/\D/g, "").slice(0, 3),
        size: norm,
        sizeFlagged: !norm,
      };
    });
}

export function PasteListModal({ open, sizes, onClose, onImport }: { open: boolean; sizes: string[]; onClose: () => void; onImport: (rows: ParsedRow[]) => void }) {
  const [text, setText] = useState("");
  const rows = parseList(text, sizes);
  const flagged = rows.filter((r) => r.sizeFlagged).length;

  return (
    <Modal open={open} onClose={onClose} labelledBy="paste-title">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="paste-title" className="font-display text-2xl uppercase tracking-wide">Pegar lista</h2>
        <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar"><X className="h-5 w-5" /></button>
      </div>
      <label htmlFor="paste-area" className="text-sm text-muted-foreground">
        Una pieza por línea: <strong className="text-foreground">NOMBRE, NÚMERO, TALLA</strong>. Puedes separar con coma, punto y coma o tabulador (Excel).
      </label>
      <textarea
        id="paste-area"
        className="field mt-2 min-h-44 py-3 font-mono text-sm"
        placeholder={"PÉREZ, 10, M\nGARCÍA, 7, grande\nLÓPEZ; 23; CH"}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {rows.length > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          {rows.length} {rows.length === 1 ? "fila detectada" : "filas detectadas"}
          {flagged > 0 && <span className="text-warning"> · {flagged} con talla no reconocida</span>}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
        <button
          type="button"
          className="btn-primary flex-1"
          disabled={!rows.length}
          onClick={() => { onImport(rows); setText(""); }}
        >
          Agregar {rows.length || ""}
        </button>
      </div>
    </Modal>
  );
}