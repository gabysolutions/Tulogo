import type { ReactNode } from "react";
import { Copy, Trash2, AlertTriangle } from "lucide-react";
import type { ArticleOption, DetailGender, DraftPiece, GenderOption } from "../../types/orderLink";

export interface PieceErrors {
  size?: string;
  number?: string;
  articleId?: string;
  gender?: string;
}

interface Props {
  index: number;
  piece: DraftPiece;
  articles: ArticleOption[];
  sizes: string[];
  genders: readonly GenderOption[];
  errors?: PieceErrors | undefined;
  duplicateWarning?: boolean | undefined;
  onChange: (patch: Partial<DraftPiece>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function PieceCard({
  index, piece, articles, sizes, genders, errors = {}, duplicateWarning, onChange, onDuplicate, onRemove,
}: Props) {
  const id = (f: string) => `p-${piece.uid}-${f}`;
  const hasError = Object.values(errors).some(Boolean);

  return (
    <article
      id={`piece-${piece.uid}`}
      className={`rounded-2xl border bg-card p-4 shadow-card transition-colors ${hasError ? "border-destructive" : ""}`}
      aria-label={`Pieza ${index + 1}`}
    >
      <header className="mb-3 flex items-center justify-between">
        <span className="font-display text-xl uppercase tracking-wide text-foreground">
          Pieza <span className="text-primary">{String(index + 1).padStart(2, "0")}</span>
        </span>
        <div className="flex gap-1">
          <button type="button" onClick={onDuplicate} className="btn-icon" aria-label={`Duplicar pieza ${index + 1}`}>
            <Copy className="h-5 w-5" />
          </button>
          <button type="button" onClick={onRemove} className="btn-icon hover:text-destructive" aria-label={`Eliminar pieza ${index + 1}`}>
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-[1fr_6rem] gap-3">
        <Field label="Nombre" htmlFor={id("nick")}>
          <input
            id={id("nick")}
            className="field uppercase"
            value={piece.nickname}
            maxLength={20}
            autoCapitalize="characters"
            placeholder="Ej. PÉREZ"
            onChange={(e) => onChange({ nickname: e.target.value.toUpperCase().slice(0, 20) })}
          />
        </Field>
        <Field label="Número" htmlFor={id("num")} error={errors.number} errId={id("num-err")}>
          <input
            id={id("num")}
            className="field text-center font-display text-xl"
            value={piece.number}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={3}
            placeholder="00"
            aria-invalid={!!errors.number}
            aria-describedby={errors.number ? id("num-err") : undefined}
            onChange={(e) => onChange({ number: e.target.value.replace(/\D/g, "").slice(0, 3) })}
          />
        </Field>

        <Field label="Talla" htmlFor={id("size")} error={errors.size ?? (piece.sizeFlagged && !piece.size ? "Talla no reconocida" : undefined)} errId={id("size-err")}>
          <select
            id={id("size")}
            className="field"
            value={piece.size}
            aria-invalid={!!errors.size}
            aria-describedby={errors.size || piece.sizeFlagged ? id("size-err") : undefined}
            onChange={(e) => onChange({ size: e.target.value, sizeFlagged: false })}
          >
            <option value="">Elegir…</option>
            {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Corte" htmlFor={id("gender")} error={errors.gender} errId={id("gender-err")}>
          <select
            id={id("gender")}
            className="field px-2"
            value={piece.gender}
            aria-invalid={!!errors.gender}
            onChange={(e) => onChange({ gender: e.target.value as DetailGender })}
          >
            {genders.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </Field>

       {articles.length > 1 && (() => {
          
          const selectable = articles.filter((a) => a.id === piece.articleId || a.used < a.quota);

          return (
            <div className="col-span-2">
              <Field label="Artículo" htmlFor={id("art")} error={errors.articleId} errId={id("art-err")}>
                <select
                  id={id("art")}
                  className="field"
                  value={piece.articleId ?? ""}
                  aria-invalid={!!errors.articleId}
                  aria-describedby={errors.articleId ? id("art-err") : undefined}
                  onChange={(e) => onChange({ articleId: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">Elegir…</option>
                  {selectable.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} · {a.used >= a.quota ? "completo" : `faltan ${a.quota - a.used}`}
                    </option>
                  ))}
                </select>
                {selectable.length === 0 && piece.articleId == null && (
                  <span className="text-xs text-muted-foreground">
                    Ya capturaste todas las piezas de la orden.
                  </span>
                )}
              </Field>
            </div>
          );
        })()}

        <div className="col-span-2">
          <Field label="Observación (opcional)" htmlFor={id("obs")}>
            <input
              id={id("obs")}
              className="field"
              value={piece.observation}
              maxLength={100}
              placeholder="Ej. manga larga"
              onChange={(e) => onChange({ observation: e.target.value.slice(0, 100) })}
            />
          </Field>
        </div>
      </div>

      {duplicateWarning && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-warning/15 px-3 py-2 text-sm text-warning-foreground" role="status">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
          El número {piece.number} se repite en este artículo y corte
        </p>
      )}
    </article>
  );
}

function Field({ label, htmlFor, error, errId, children }: { label: string; htmlFor: string; error?: string | undefined; errId?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
      {error && <span id={errId} className="text-xs font-medium text-destructive">{error}</span>}
    </div>
  );
}