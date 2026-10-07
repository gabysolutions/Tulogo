import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Trash2 } from "lucide-react";

interface Props {
  images: string[];
  alt: string;
  emptyTitle: string;
  emptyIcon: React.ReactNode;
  emptyAction: string;
  onEmptyAction?: () => void;
  onOpen?: (index: number) => void;
  onDelete?: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function ImageCarousel({
  images,
  alt,
  emptyTitle,
  emptyIcon,
  emptyAction,
  onEmptyAction,
  onOpen,
  onDelete,
  autoPlay = false,
  autoPlayInterval = 4000,
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!autoPlay || paused || images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, paused, images.length, autoPlayInterval]);

  // Si se eliminó una imagen y el índice quedó fuera de rango, lo ajustamos
  useEffect(() => {
    if (index >= images.length && images.length > 0) {
      setIndex(images.length - 1);
    }
  }, [images.length, index]);

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
        <div className="text-slate-400">{emptyIcon}</div>
        <p className="text-sm text-slate-500">{emptyTitle}</p>
        <button
          type="button"
          onClick={onEmptyAction}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          {emptyAction}
        </button>
      </div>
    );
  }

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div
      className="group/carousel relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => onOpen?.(i)}
            className="relative w-full shrink-0 cursor-zoom-in"
            aria-label={`${alt} ${i + 1}`}
          >
            <img
              src={src}
              alt={`${alt} ${i + 1}`}
              loading="lazy"
              width={800}
              height={600}
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover/carousel:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 opacity-0 transition-opacity duration-200 group-hover/carousel:opacity-100">
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Anterior"
              className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Siguiente"
              className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1.5">
        <span className="rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
          {index + 1} / {images.length}
        </span>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white">
          <Maximize2 className="h-3 w-3" />
        </span>
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(index);
          }}
          aria-label="Eliminar imagen"
          className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity duration-200 hover:bg-red-600 group-hover/carousel:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir a la imagen ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full bg-black/60 transition-all duration-300 ${
                i === index ? "w-5 opacity-100" : "w-1.5 opacity-50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}