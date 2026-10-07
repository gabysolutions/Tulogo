import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import{downloadImage} from "../../utils/downloadImage";

interface Props {
  images: string[];
  startIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
}

export function Lightbox({ images, startIndex, open, onOpenChange, title }: Props) {
  const [index, setIndex] = useState(startIndex);
  const [downloading, setDownloading] = useState(false);
  
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadImage(currentSrc, `${title || "imagen"}-${index + 1}.jpg`);
    } finally {
      setDownloading(false);
    }
  };


  useEffect(() => setIndex(startIndex), [startIndex, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length, onOpenChange]);

  // Bloquea el scroll del body mientras el lightbox está abierto
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open || images.length === 0) return null;

  const currentSrc = images[index];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => onOpenChange(false)}
    >
      <div className="mb-3 flex w-full max-w-4xl items-center justify-between text-white">
        <p className="text-sm font-medium">
          {title} · {index + 1} / {images.length}
        </p>
        <div className="flex items-center gap-2">
          <a
            href={currentSrc}
            download={`${title || "imagen"}-${index + 1}.jpg`}
            target="_blank"
            rel="noreferrer"
            onClick={handleDownload}
           
            aria-label="Descargar imagen"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/20 transition hover:bg-white/30"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => onOpenChange(false)}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/20 transition hover:bg-white/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <img
          src={currentSrc}
          alt={`${title} ${index + 1}`}
          className="max-h-[80vh] w-full rounded-2xl object-contain"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-gray-400 text-white transition hover:bg-gray-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              onClick={() => setIndex((i) => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-gray-400 text-white transition hover:bg-gray-200"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}