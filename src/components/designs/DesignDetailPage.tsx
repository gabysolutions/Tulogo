import { useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileImage,
  MessageSquare,
  Palette,
  Pencil,
  Send,
  Shirt,
  Trash2,
  Upload,
  UserPlus,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useDesign } from "../../hooks/useDesign";
import { DesignStatus, type DesignDetail, type DesignComment } from "../../types/design";
import {
  addFileReferenceService,
  assignDesignerService,
  claimDesignService,
  acceptDesignDetailService,
  rejectDesignDetailService,
  removeDesignImgService,
  sendDesignToReviewService,
  updateDesignDetailService,
  uploadDesignImgService,
  getAvailableDesignersService,
} from "../../services/design.service";
import { deleteFileService } from "../../services/file.service";
import { uploadManyToCloudinary, uploadToCloudinary } from "../../lib/cloudinary";

import { ImageCarousel } from "../../components/designs/ImageCarousel";
import { Lightbox } from "../../components/designs/Lightbox";
import { StatusBadge } from "../../components/designs/StatusBadge";
import { DesignDetailModal } from "../../components/designs/DesignDetailModal";

const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const STEPS = [
  { key: "refs", label: "Referencias", icon: FileImage },
  { key: "design", label: "Diseño", icon: Palette },
  { key: "review", label: "Revisión", icon: Eye },
  { key: "final", label: "Resultado", icon: CheckCircle2 },
];

function stepProgress(status: DesignStatus, hasProposal: boolean) {
  if (status === DesignStatus.APPROVED || status === DesignStatus.REJECTED) return 4;
  if (status === DesignStatus.REVIEW) return 3;
  if (hasProposal) return 2;
  return 0;
}

function isDetailComplete(detail: DesignDetail): boolean {
  return Boolean(
    detail.teamName?.trim() &&
      detail.mainColor?.trim() &&
      detail.secondaryColor?.trim() &&
      detail.frontLogo?.trim()
  );
}

function Track({ status, hasProposal }: { status: DesignStatus; hasProposal: boolean }) {
  const done = stepProgress(status, hasProposal);
  const rejected = status === DesignStatus.REJECTED;

  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((step, i) => {
        const active = i < done;
        const isLast = i === STEPS.length - 1;
        const Icon = isLast && rejected ? XCircle : step.icon;
        return (
          <div key={step.key} className="flex flex-1 items-center gap-1.5">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div
                className={`h-1 rounded-full transition-colors duration-500 ${
                  active
                    ? isLast && rejected
                      ? "bg-red-500"
                      : isLast
                      ? "bg-emerald-500"
                      : "bg-slate-700"
                    : "bg-slate-200"
                }`}
              />
              <span
                className={`flex items-center gap-1 truncate text-[10px] font-medium uppercase tracking-wide ${
                  active ? "text-slate-600" : "text-slate-400"
                }`}
              >
                <Icon className="h-3 w-3 shrink-0" />
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CommentsSection({ comments }: { comments: DesignComment[] }) {
  const [open, setOpen] = useState(false);

  if (comments.length === 0) return null;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between border-b border-slate-200 py-3 text-sm font-medium text-slate-700"
      >
        <span className="flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-slate-400" />
          Comentarios
          <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1.5 text-[11px] font-semibold text-red-600">
            {comments.length}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-2 rounded-xl bg-slate-50 p-4">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <div className="grid size-7 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                <XCircle className="h-4 w-4" />
              </div>
              <div className="max-w-[85%]">
                <div className="rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-sm leading-snug text-slate-700 shadow-sm ring-1 ring-slate-200">
                  {c.comment}
                </div>
                <p className="mt-1 pl-1 text-[11px] text-slate-400">{c.registration_date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="truncate text-sm text-slate-800">{value || "—"}</dd>
    </div>
  );
}

function Swatch({ label, color }: { label: string; color: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 flex items-center gap-2 text-sm">
        <span
          className="h-4 w-4 shrink-0 rounded-full border border-slate-200"
          style={{ backgroundColor: color || "#e2e8f0" }}
        />
        <span className="truncate text-slate-700">{color || "—"}</span>
      </dd>
    </div>
  );
}

async function confirmAccept(): Promise<boolean> {
  const result = await Swal.fire({
    title: "¿Aceptar este artículo?",
    text: "El artículo quedará aprobado y listo para producción.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#16a34a",
    cancelButtonColor: "#94a3b8",
  });
  return result.isConfirmed;
}

async function confirmReject(): Promise<string | null> {
  const { value } = await Swal.fire({
    title: "¿Rechazar este artículo?",
    text: "El diseñador tendrá que subir una nueva propuesta.",
    icon: "warning",
    input: "textarea",
    inputLabel: "Motivo del rechazo",
    inputPlaceholder: "Escribe el motivo del rechazo...",
    inputAttributes: {
      "aria-label": "Motivo del rechazo",
    },
    showCancelButton: true,
    confirmButtonText: "Rechazar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#94a3b8",
    preConfirm: (comment) => {
      if (!comment || !comment.trim()) {
        Swal.showValidationMessage("Debes indicar un motivo de rechazo");
        return false;
      }
      return comment.trim();
    },
  });

  return value ?? null;
}

async function confirmDeleteReference(): Promise<boolean> {
  const result = await Swal.fire({
    title: "¿Eliminar esta referencia?",
    text: "Podrás subir una nueva en su lugar.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#94a3b8",
  });
  return result.isConfirmed;
}

async function confirmDeleteProposal(): Promise<boolean> {
  const result = await Swal.fire({
    title: "¿Quitar esta propuesta?",
    text: "Podrás subir una nueva en su lugar.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Quitar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#94a3b8",
  });
  return result.isConfirmed;
}

async function askDesigner(options: { id: number; name: string }[]): Promise<number | null> {
  const inputOptions = options.reduce<Record<number, string>>((acc, d) => {
    acc[d.id] = d.name;
    return acc;
  }, {});

  const { value } = await Swal.fire({
    title: "Asignar diseñador",
    input: "select",
    inputOptions,
    inputPlaceholder: "Selecciona un diseñador",
    showCancelButton: true,
    confirmButtonText: "Asignar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#1e293b",
    cancelButtonColor: "#94a3b8",
    preConfirm: (id) => {
      if (!id) {
        Swal.showValidationMessage("Selecciona un diseñador");
        return false;
      }
      return id;
    },
  });

  return value ? Number(value) : null;
}

export default function DesignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDesigner = user?.role === "diseñador";
  const isAdmin = user?.role === "administrador";

  const designId = Number(id);
  const { design, loading, error, refetch } = useDesign(designId);

  const [activeDetailId, setActiveDetailId] = useState<number | undefined>(undefined);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [uploadingRef, setUploadingRef] = useState(false);
  const [uploadingProposal, setUploadingProposal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number; title: string } | null>(null);

  const referenceInputRef = useRef<HTMLInputElement>(null);
  const proposalInputRef = useRef<HTMLInputElement>(null);

  const soon = (label: string) => toast.fire({ icon: "info", title: label });

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-8">
        <p className="text-sm text-slate-400">Cargando diseño...</p>
      </main>
    );
  }

  if (error || !design) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-8">
        <p className="text-sm text-red-500">{error ?? "Diseño no encontrado"}</p>
        <Link to="/diseños" className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600">
          <ArrowLeft size={16} /> Volver a Diseños
        </Link>
      </main>
    );
  }

  const details = design.details ?? [];
  const activeDetail = details.find((d) => d.id === activeDetailId) ?? details[0];

  if (!activeDetail) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-8">
        <Link to="/diseños" className="mb-4 inline-flex items-center gap-1 text-sm text-blue-600">
          <ArrowLeft size={16} /> Volver a Diseños
        </Link>
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
          Este diseño aún no tiene artículos registrados.
        </div>
      </main>
    );
  }

  const references = activeDetail.files.map((f) => f.url);
  const proposal = activeDetail.designImg ? [activeDetail.designImg] : [];
  const allDetailsComplete = details.every(isDetailComplete);
  const allHaveReferences = details.every((d) => d.files.length > 0);
  const canSendToReview = allHaveReferences && allDetailsComplete;

  const canDeleteReferences =
    design.status === DesignStatus.PENDING || design.status === DesignStatus.REJECTED;

  // La propuesta se puede quitar/reemplazar también en PENDING (antes de enviar a revisión).
  const canDeleteProposal =
    (isDesigner || isAdmin) &&
    proposal.length > 0 &&
    (design.status === DesignStatus.PENDING ||
      design.status === DesignStatus.REVIEW ||
      design.status === DesignStatus.REJECTED);

  const handleUploadReferences = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploadingRef(true);
    try {
      const uploaded = await uploadManyToCloudinary(Array.from(fileList));
      for (const result of uploaded) {
        await addFileReferenceService(activeDetail.id, { url: result.url });
      }
      toast.fire({ icon: "success", title: "Referencias subidas" });
      refetch();
    } catch (err) {
      toast.fire({ icon: "error", title: err instanceof Error ? err.message : "Error al subir referencias" });
    } finally {
      setUploadingRef(false);
    }
  };

  const handleDeleteReference = async (index: number) => {
    const file = activeDetail.files[index];
    if (!file) return;

    const confirmed = await confirmDeleteReference();
    if (!confirmed) return;

    setBusy(true);
    try {
      const res = await deleteFileService(file.id);
      toast.fire({ icon: "success", title: res.message });
      refetch();
    } catch (err: any) {
      toast.fire({ icon: "error", title: err?.response?.data?.message ?? "No se pudo eliminar la referencia" });
    } finally {
      setBusy(false);
    }
  };

  const handleUploadProposal = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploadingProposal(true);
    try {
      const result = await uploadToCloudinary(fileList[0]);
      await uploadDesignImgService(activeDetail.id, { url: result.url });
      toast.fire({ icon: "success", title: "Propuesta subida" });
      refetch();
    } catch (err) {
      toast.fire({ icon: "error", title: err instanceof Error ? err.message : "Error al subir la propuesta" });
    } finally {
      setUploadingProposal(false);
    }
  };

  const handleRemoveProposal = async () => {
    const confirmed = await confirmDeleteProposal();
    if (!confirmed) return;

    setBusy(true);
    try {
      const res = await removeDesignImgService(activeDetail.id);
      toast.fire({ icon: "success", title: res.message });
      refetch();
    } catch (err: any) {
      toast.fire({ icon: "error", title: err?.response?.data?.message ?? "No se pudo quitar la propuesta" });
    } finally {
      setBusy(false);
    }
  };

  const handleAssignDesigner = async () => {
    let designers: { id: number; name: string }[] = [];
    try {
      designers = await getAvailableDesignersService();
    } catch (err: any) {
      toast.fire({ icon: "error", title: err?.response?.data?.message ?? "No se pudo cargar la lista de diseñadores" });
      return;
    }
    if (designers.length === 0) {
      toast.fire({ icon: "info", title: "No hay diseñadores disponibles" });
      return;
    }
    const designerId = await askDesigner(designers);
    if (!designerId) return;

    setBusy(true);
    try {
      const res = await assignDesignerService(design.id, { designerId });
      toast.fire({ icon: "success", title: res.message });
      refetch();
    } catch (err: any) {
      toast.fire({ icon: "error", title: err?.response?.data?.message ?? "No se pudo asignar el diseñador" });
    } finally {
      setBusy(false);
    }
  };

  const handleClaim = async () => {
    setBusy(true);
    try {
      const res = await claimDesignService(design.id);
      toast.fire({ icon: "success", title: res.message });
      refetch();
    } catch (err: any) {
      toast.fire({ icon: "error", title: err?.response?.data?.message ?? "No se pudo reclamar el diseño" });
    } finally {
      setBusy(false);
    }
  };

  const handleSendToReview = async () => {
    if (!canSendToReview) return;
    setBusy(true);
    try {
      const res = await sendDesignToReviewService(design.id);
      toast.fire({ icon: "success", title: res.message });
      refetch();
    } catch (err: any) {
      toast.fire({ icon: "error", title: err?.response?.data?.message ?? "No se pudo enviar a revisión" });
    } finally {
      setBusy(false);
    }
  };

  const handleSaveDetail = async (updatedDetail: DesignDetail) => {
    setBusy(true);
    try {
      await updateDesignDetailService(activeDetail.id, {
        teamName: updatedDetail.teamName ?? undefined,
        mainColor: updatedDetail.mainColor ?? undefined,
        secondaryColor: updatedDetail.secondaryColor ?? undefined,
        frontLogo: updatedDetail.frontLogo ?? undefined,
        reverseLogo: updatedDetail.reverseLogo ?? undefined,
        printerType: updatedDetail.printerType ?? undefined,
        observations: updatedDetail.observations ?? undefined,
      });
      toast.fire({ icon: "success", title: "Detalle actualizado" });
      setDetailModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.fire({ icon: "error", title: err?.response?.data?.message ?? "No se pudo actualizar el detalle" });
    } finally {
      setBusy(false);
    }
  };

  const handleAccept = async () => {
    const confirmed = await confirmAccept();
    if (!confirmed) return;
    setBusy(true);
    try {
      const res = await acceptDesignDetailService(activeDetail.id);
      toast.fire({ icon: "success", title: res.message });
      refetch();
    } catch (err: any) {
      toast.fire({ icon: "error", title: err?.response?.data?.message ?? "No se pudo aceptar" });
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    const comment = await confirmReject();
    if (comment === null) return;

    setBusy(true);
    try {
      const res = await rejectDesignDetailService(activeDetail.id, { comment });
      toast.fire({ icon: "success", title: res.message });
      refetch();
    } catch (err: any) {
      toast.fire({ icon: "error", title: err?.response?.data?.message ?? "No se pudo rechazar" });
    } finally {
      setBusy(false);
    }
  };

  const designLevelActions = () => {
    if (design.status === DesignStatus.PENDING) {
      return (
        <>
          <button
            onClick={() => referenceInputRef.current?.click()}
            disabled={uploadingRef}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload size={16} />
            {uploadingRef ? "Subiendo..." : "Subir Referencias"}
          </button>

          {design.designerId ? (
            !isDesigner && (
              <button
                onClick={handleAssignDesigner}
                disabled={busy}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <UserPlus size={16} /> Reasignar Diseñador
              </button>
            )
          ) : (
            <>
              <button
                onClick={handleClaim}
                disabled={busy}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <UserPlus size={16} /> Reclamar para mí
              </button>
              {!isDesigner && (
                <button
                  onClick={handleAssignDesigner}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  <UserPlus size={16} /> Asignar Diseñador
                </button>
              )}
            </>
          )}

          {isDesigner && (
            <button
              onClick={() => proposalInputRef.current?.click()}
              disabled={uploadingProposal}
              className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload size={16} />
              {uploadingProposal ? "Subiendo..." : proposal.length ? "Reemplazar Propuesta" : "Subir Propuesta"}
            </button>
          )}

          {canDeleteProposal && (
            <button
              onClick={handleRemoveProposal}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
            >
              <Trash2 size={16} /> Quitar Propuesta
            </button>
          )}

          <button
            onClick={handleSendToReview}
            disabled={!canSendToReview || busy}
            title={
              canSendToReview
                ? "Enviar este diseño a revisión"
                : "Sube al menos una referencia por artículo y completa el detalle (equipo, colores, logo) para poder enviarlo a revisión"
            }
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Send size={16} /> Enviar a Revisión
          </button>
        </>
      );
    }

    if (design.status === DesignStatus.REJECTED) {
      return (
        <>
          {canDeleteProposal && (
            <button
              onClick={handleRemoveProposal}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
            >
              <Trash2 size={16} /> Quitar Diseño
            </button>
          )}
          <button
            onClick={handleSendToReview}
            disabled={!canSendToReview || busy}
            title={
              canSendToReview
                ? "Enviar este diseño a revisión"
                : "Sube al menos una referencia por artículo y completa el detalle (equipo, colores, logo) para poder enviarlo a revisión"
            }
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Send size={16} /> Enviar a Revisión
          </button>
        </>
      );
    }

    if (design.status === DesignStatus.APPROVED) {
      return (
        <>
          <button
            onClick={() =>
              proposal.length
                ? setLightbox({ images: proposal, index: 0, title: "Diseño propuesto" })
                : soon("Sin diseño")
            }
            className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
          >
            <Eye size={16} /> Ver Diseño
          </button>
        </>
      );
    }

    return null;
  };

  const detailLevelActions = () => {
    if (design.status !== DesignStatus.REVIEW) return null;

    return (
      <>
        {isDesigner && (
          <button
            onClick={() => proposalInputRef.current?.click()}
            disabled={uploadingProposal}
            className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload size={16} />
            {uploadingProposal ? "Subiendo..." : proposal.length ? "Reemplazar Propuesta" : "Subir Propuesta"}
          </button>
        )}

        {canDeleteProposal && (
          <button
            onClick={handleRemoveProposal}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
          >
            <Trash2 size={16} /> Quitar
          </button>
        )}

        {!isDesigner && (
          <>
            <button
              onClick={handleAccept}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              <CheckCircle2 size={16} /> Aceptar
            </button>
            <button
              onClick={handleReject}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              <XCircle size={16} /> Rechazar
            </button>
          </>
        )}
      </>
    );
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <button
        onClick={() => navigate("/diseños")}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft size={16} /> Volver a Diseños
      </button>

      <input
        ref={referenceInputRef}
        type="file"
        accept="image/*"
        multiple
        disabled={uploadingRef}
        className="hidden"
        onChange={(e) => {
          handleUploadReferences(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={proposalInputRef}
        type="file"
        accept="image/*"
        disabled={uploadingProposal}
        className="hidden"
        onChange={(e) => {
          handleUploadProposal(e.target.files);
          e.target.value = "";
        }}
      />

      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight text-slate-500">
            COT-{String(design.quoteId).padStart(4, "0")}
          </p>
          <h1 className="truncate text-2xl font-bold text-slate-800">
            {activeDetail.teamName ?? "Sin equipo"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Palette className="h-3.5 w-3.5" />
              {design.designerName === "SIN ASIGNAR" ? "Sin asignar" : design.designerName}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {design.deliveryDate}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {design.status === DesignStatus.PENDING && (
            <button
              type="button"
              onClick={() => setDetailModalOpen(true)}
              title="Editar detalle del diseño"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <StatusBadge status={design.status} />
        </div>
      </header>

      {details.length > 1 && (
        <div className="mt-5 flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
          {details.map((d, i) => {
            const complete = isDetailComplete(d);
            const active = d.id === activeDetail.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveDetailId(d.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  active ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Shirt className="h-3 w-3" />
                {d.description || `Artículo ${i + 1}`}
                {!complete && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${active ? "bg-amber-300" : "bg-amber-500"}`}
                    title="Detalle incompleto"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <Track status={design.status} hasProposal={proposal.length > 0} />
      </div>

      {design.status === DesignStatus.PENDING && !canSendToReview && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Sube al menos una referencia por artículo y completa el detalle (equipo, colores y logo principal) para poder enviarlo a revisión.
        </p>
      )}

      {design.status === DesignStatus.REJECTED && (
        <CommentsSection comments={activeDetail.comments ?? []} />
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Referencias del Cliente
          </h3>
          <ImageCarousel
            images={references}
            alt={`Referencia de ${activeDetail.teamName ?? ""}`}
            emptyTitle="No hay referencias cargadas"
            emptyIcon={<FileImage className="h-6 w-6" />}
            emptyAction="Subir Referencias"
            onEmptyAction={() => referenceInputRef.current?.click()}
            onOpen={(index) => setLightbox({ images: references, index, title: "Referencias del cliente" })}
            onDelete={canDeleteReferences ? handleDeleteReference : undefined}
            autoPlay
          />
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Diseño Propuesto
          </h3>
          <ImageCarousel
            images={proposal}
            alt={`Propuesta para ${activeDetail.teamName ?? ""}`}
            emptyTitle="Aún no hay propuesta"
            emptyIcon={<Palette className="h-6 w-6" />}
            emptyAction="Subir Diseño"
            onEmptyAction={() => proposalInputRef.current?.click()}
            onOpen={(index) => setLightbox({ images: proposal, index, title: "Diseño propuesto" })}
            onDelete={canDeleteProposal ? () => handleRemoveProposal() : undefined}
            autoPlay
          />
        </section>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          className="flex w-full items-center justify-between border-b border-slate-200 py-3 text-sm font-medium text-slate-700"
        >
          Detalles del Diseño
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${detailsOpen ? "rotate-180" : ""}`}
          />
        </button>

        {detailsOpen && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-slate-50 p-4">
            <Detail label="Artículo" value={activeDetail.description} />
            <Detail label="Categoría" value={activeDetail.category} />
            <Detail label="Nombre del equipo" value={activeDetail.teamName} />
            <Detail label="Tipo de impresión" value={activeDetail.printerType} />
            <Swatch label="Color principal" color={activeDetail.mainColor} />
            <Swatch label="Color secundario" color={activeDetail.secondaryColor} />
            <Detail label="Logo principal" value={activeDetail.frontLogo} />
            <Detail label="Logo trasero" value={activeDetail.reverseLogo} />
            <div className="col-span-2">
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">Observaciones</dt>
              <dd className="text-sm text-slate-800">{activeDetail.observations || "—"}</dd>
            </div>
          </dl>
        )}
      </div>

      <CommentsSection comments={activeDetail.comments ?? []} />

      <footer className="mt-8 flex flex-wrap gap-2 border-t border-slate-200 pt-6">
        {designLevelActions()}
        {detailLevelActions()}
      </footer>

      <Lightbox
        open={lightbox !== null}
        images={lightbox?.images ?? []}
        startIndex={lightbox?.index ?? 0}
        title={lightbox?.title ?? ""}
        onOpenChange={(v) => !v && setLightbox(null)}
      />

      <DesignDetailModal
        open={detailModalOpen}
        initialDetail={activeDetail}
        onClose={() => setDetailModalOpen(false)}
        onSave={handleSaveDetail}
      />
    </main>
  );
}