import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle2, Clock, ClipboardPaste, Link2Off, Loader2, Plus, RefreshCw, Send, TimerOff, WifiOff,
} from "lucide-react";
import { addOrderDetails, getOrderByToken } from "../../services/orderLink.service";
import type {
  ArticleOption, DraftPiece, OrderDetailItemPayload, PublicOrder,
} from "../../types/orderLink";
import { GENDER_OPTIONS, PIECE_SIZES } from "../../constants/orderDetails";
import { getApiErrorMessage, getApiErrorStatus } from "../../utils/apiError";
import { PieceCard, type PieceErrors } from "../../components/publicOrder/PieceCard";
import { PasteListModal, type ParsedRow } from "../../components/publicOrder/PasteListModal";
import { ProgressBar } from "../../components/publicOrder/ProgressBar";
import { StatusMessage } from "../../components/publicOrder/StatusMessage";
import { Modal } from "../../components/publicOrder/Modal";
import { ArticleProgress } from "../../components/publicOrder/ArticleProgress";

type View = "loading" | "notfound" | "unavailable" | "error" | "form" | "success";

const uid = () => Math.random().toString(36).slice(2, 10);
const parseApiDate = (s: string) => new Date(s.replace(" ", "T"));

const UNAVAILABLE_TEXT =
  "Este enlace ya venció o la lista ya fue enviada. Si necesitas hacer cambios, contacta a tu asesor.";

export default function PublicOrderForm() {
  const { token } = useParams<{ token: string }>();

  if (!token) {
    return (
      <StatusMessage variant="error" icon={<Link2Off className="h-8 w-8" />} title="Enlace no encontrado">
        Este enlace está incompleto. Revisa el mensaje que te enviaron o pide uno nuevo a tu asesor.
      </StatusMessage>
    );
  }

  return <OrderForm token={token} />;
}

function OrderForm({ token }: { token: string }) {
  const [view, setView] = useState<View>("loading");
  const [linkMessage, setLinkMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [pieces, setPieces] = useState<DraftPiece[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const draftKey = `order-form-draft-${token}`;
  const loaded = useRef(false);

  const blank = useCallback(
    (o: PublicOrder, from?: Partial<DraftPiece>): DraftPiece => ({
      uid: uid(),
      articleId: o.articles.length === 1 ? o.articles[0]!.articleId : (from?.articleId ?? null),
      nickname: "",
      number: "",
      size: from?.size ?? "",
      gender: from?.gender ?? GENDER_OPTIONS[0]!.value,
      observation: "",
    }),
    [],
  );

  useEffect(() => {
    let alive = true;
    getOrderByToken(token)
      .then((o) => {
        if (!alive) return;
        setOrder(o);
        let restored: DraftPiece[] | null = null;
        try {
          const raw = localStorage.getItem(draftKey);
          if (raw) restored = JSON.parse(raw);
        } catch { /* ignore */ }
        setPieces(restored?.length ? restored : [blank(o)]);
        loaded.current = true;
        setView("form");
      })
      .catch((e) => {
        if (!alive) return;
        const status = getApiErrorStatus(e);
        setLinkMessage(getApiErrorMessage(e, ""));
        if (status === 404) setView("notfound");
        else if (status !== null && status < 500) setView("unavailable");
        else setView("error");
      });
    return () => { alive = false; };
  }, [token, draftKey, blank, attempt]);

  // Autosave del borrador
  useEffect(() => {
    if (loaded.current && view === "form") localStorage.setItem(draftKey, JSON.stringify(pieces));
  }, [pieces, draftKey, view]);

  // Piezas que faltan por capturar (lo pedido menos lo ya registrado)
  const expectedPieces = useMemo(
    () => order?.articles.reduce((sum, a) => sum + Math.max(a.amount - a.piecesRegistered, 0), 0) ?? 0,
    [order],
  );

const articleOptions = useMemo<ArticleOption[]>(() => {
  if (!order) return [];
  return order.articles.map((a) => ({
    id: a.articleId,
    name: `${a.article} ${a.category}`,
    quota: Math.max(a.amount - a.piecesRegistered, 0),
    used: pieces.filter((p) => p.articleId === a.articleId).length,
  }));
}, [order, pieces]);

  const errors = useMemo(() => {
    const map: Record<string, PieceErrors> = {};
    if (!order) return map;
    for (const p of pieces) {
      const e: PieceErrors = {};
      if (!p.size) e.size = "La talla es obligatoria";
      if (order.articles.length > 1 && p.articleId == null) e.articleId = "Elige un artículo";
      if (Object.keys(e).length) map[p.uid] = e;
    }
    return map;
  }, [pieces, order]);

  const duplicates = useMemo(() => {
    const counts = new Map<string, number>();
    const key = (p: DraftPiece) => `${p.articleId}|${p.gender}|${p.number}`;
    pieces.forEach((p) => p.number && counts.set(key(p), (counts.get(key(p)) ?? 0) + 1));
    return new Set(pieces.filter((p) => p.number && (counts.get(key(p)) ?? 0) > 1).map((p) => p.uid));
  }, [pieces]);

  const filled = pieces.filter((p) => p.size && p.number).length;

  if (view === "loading") return <LoadingSkeleton />;
  if (view === "notfound")
    return (
      <StatusMessage variant="error" icon={<Link2Off className="h-8 w-8" />} title="Enlace no encontrado">
        {linkMessage || "Este enlace no existe o está mal escrito. Revisa el mensaje que te enviaron o pide uno nuevo a tu asesor."}
      </StatusMessage>
    );
  if (view === "unavailable")
    return (
      <StatusMessage variant="warning" icon={<TimerOff className="h-8 w-8" />} title="Enlace no disponible">
        {linkMessage || UNAVAILABLE_TEXT}
      </StatusMessage>
    );
  if (view === "error")
    return (
      <StatusMessage variant="error" icon={<WifiOff className="h-8 w-8" />} title="No pudimos cargar la orden">
        <p>Revisa tu conexión e inténtalo de nuevo.</p>
        <button
          type="button"
          className="btn-secondary mt-4"
          onClick={() => { setView("loading"); setAttempt((n) => n + 1); }}
        >
          <RefreshCw className="h-4 w-4" /> Reintentar
        </button>
      </StatusMessage>
    );
  if (view === "success")
    return (
      <StatusMessage variant="success" icon={<CheckCircle2 className="h-9 w-9" />} title="¡Lista enviada!">
        Recibimos tus {pieces.length} piezas de la <strong className="text-foreground">orden #{order?.id}</strong>. Tu asesor la revisará y te contactará si hay algo que ajustar.
      </StatusMessage>
    );

  const o = order!;
  const update = (id: string, patch: Partial<DraftPiece>) =>
    setPieces((ps) => ps.map((p) => (p.uid === id ? { ...p, ...patch } : p)));
  const duplicate = (i: number) =>
    setPieces((ps) => [...ps.slice(0, i + 1), blank(o, ps[i]), ...ps.slice(i + 1)]);
  const remove = (id: string) => setPieces((ps) => ps.filter((p) => p.uid !== id));
  const importRows = (rows: ParsedRow[]) => {
    setPieces((ps) => {
      const base = ps.filter((p) => p.nickname || p.number || p.size || p.observation);
      return [...base, ...rows.map((r) => ({ ...blank(o), ...r }))];
    });
    setPasteOpen(false);
  };

  const doSubmit = async () => {
    setConfirmOpen(false);
    setSending(true);
    setSendError(null);
    try {
      const details: OrderDetailItemPayload[] = pieces.map((p) => ({
        articleId: p.articleId as number,
        nickname: p.nickname.trim().toUpperCase(),
        number: p.number,
        size: p.size,
        gender: p.gender,
        observation: p.observation.trim(),
      }));
      await addOrderDetails(token, { details });
      localStorage.removeItem(draftKey);
      setView("success");
    } catch (e) {
      setSendError(
        getApiErrorMessage(e, "No pudimos enviar la lista. Revisa tu conexión e inténtalo de nuevo; tus datos se conservan."),
      );
    } finally {
      setSending(false);
    }
  };

  const onSend = () => {
    setShowErrors(true);
    if (!pieces.length) return;
    const first = pieces.find((p) => errors[p.uid]);
    if (first) {
      document.getElementById(`piece-${first.uid}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (pieces.length !== expectedPieces) setConfirmOpen(true);
    else doSubmit();
  };

  return (
    <main className="mx-auto max-w-[720px] px-4 pb-32 pt-6 sm:pb-12">
     <header className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Captura de jugadores</p>
      <h1 className="mt-1 font-display text-4xl uppercase leading-none tracking-wide text-foreground">
        Orden #{o.id} · {o.client}
      </h1>
      <ExpiryNotice expiresAt={o.expiresAt} />
    </header>

      <div className="sticky top-0 z-20 -mx-4 mb-4 border-b bg-background/90 px-4 py-3 backdrop-blur">
        <ProgressBar value={filled} max={expectedPieces} />
      </div>
      <ArticleProgress articles={articleOptions} />
      <div className="mb-4 flex gap-2">
        <button type="button" className="btn-secondary flex-1" onClick={() => setPasteOpen(true)}>
          <ClipboardPaste className="h-5 w-5" /> Pegar lista
        </button>
        <button type="button" className="btn-secondary flex-1" onClick={() => setPieces((ps) => [...ps, blank(o)])}>
          <Plus className="h-5 w-5" /> Agregar pieza
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {pieces.map((p, i) => (
          <PieceCard
            key={p.uid}
            index={i}
            piece={p}
            articles={articleOptions}
            sizes={PIECE_SIZES}
            genders={GENDER_OPTIONS}
            errors={showErrors ? errors[p.uid] : undefined}
            duplicateWarning={duplicates.has(p.uid)}
            onChange={(patch) => update(p.uid, patch)}
            onDuplicate={() => duplicate(i)}
            onRemove={() => remove(p.uid)}
          />
        ))}
        {!pieces.length && (
          <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            Aún no hay piezas. Agrega una o pega tu lista.
          </p>
        )}
      </div>

      <button type="button" className="btn-dashed mt-3 w-full" onClick={() => setPieces((ps) => [...ps, blank(o)])}>
        <Plus className="h-5 w-5" /> Agregar pieza
      </button>

      {sendError && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0" /> {sendError}
        </p>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 backdrop-blur sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0">
        <div className="mx-auto max-w-[720px]">
          <button type="button" className="btn-primary h-14 w-full text-lg" onClick={onSend} disabled={sending || !pieces.length}>
            {sending
              ? <><Loader2 className="h-5 w-5 animate-spin" /> Enviando…</>
              : <><Send className="h-5 w-5" /> Enviar {pieces.length} {pieces.length === 1 ? "pieza" : "piezas"}</>}
          </button>
        </div>
      </div>

      <PasteListModal open={pasteOpen} sizes={PIECE_SIZES} onClose={() => setPasteOpen(false)} onImport={importRows} />

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} labelledBy="confirm-title">
        <h2 id="confirm-title" className="font-display text-2xl uppercase tracking-wide">¿Enviar de todos modos?</h2>
        <p className="mt-2 text-muted-foreground">
          Capturaste <strong className="text-foreground">{pieces.length}</strong> piezas y la orden indica{" "}
          <strong className="text-foreground">{expectedPieces}</strong>. ¿Enviar de todos modos?
        </p>
        <div className="mt-5 flex gap-2">
          <button type="button" className="btn-secondary flex-1" onClick={() => setConfirmOpen(false)}>Revisar</button>
          <button type="button" className="btn-primary flex-1" onClick={doSubmit}>Enviar</button>
        </div>
      </Modal>
    </main>
  );
}

function ExpiryNotice({ expiresAt }: { expiresAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  const expiry = parseApiDate(expiresAt);
  const left = expiry.getTime() - now;
  const soon = left > 0 && left < 2 * 3600_000;
  useEffect(() => {
    if (!soon) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [soon]);
  const fmt = expiry.toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" });
  const h = Math.floor(left / 3600_000);
  const m = Math.floor((left % 3600_000) / 60_000);
  const s = Math.floor((left % 60_000) / 1000);
  return (
    <p className={`mt-3 flex flex-wrap items-center gap-1.5 text-sm ${soon ? "text-warning" : "text-muted-foreground"}`}>
      <Clock className="h-4 w-4" /> Este enlace vence el {fmt}
      {soon && (
        <span className="rounded-full bg-warning/15 px-2 py-0.5 font-mono font-semibold" aria-live="off">
          {h}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
        </span>
      )}
    </p>
  );
}

function LoadingSkeleton() {
  return (
    <main className="mx-auto max-w-[720px] px-4 pt-6" aria-busy="true" aria-label="Cargando">
      <div className="h-3 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-9 w-3/4 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-2.5 w-full animate-pulse rounded-full bg-muted" />
      {[0, 1, 2].map((i) => <div key={i} className="mt-4 h-52 animate-pulse rounded-2xl bg-muted" />)}
    </main>
  );
}