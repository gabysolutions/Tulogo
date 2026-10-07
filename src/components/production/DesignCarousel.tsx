import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

interface Props {
  images: string[];
  alt: string;
  className?: string;
}

export function DesignCarousel({ images, alt, className = "" }: Props) {
  const [index, setIndex] = useState(0);
  const hasImages = images.length > 0;
  const multiple = images.length > 1;

  function go(delta: number, e: React.MouseEvent) {
    e.stopPropagation();
    setIndex((prev) => (prev + delta + images.length) % images.length);
  }

  return (
    <div
      className={`group/carousel relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 ${className}`}
    >
      {hasImages ? (
        <img
          src={images[index]}
          alt={`${alt} — diseño ${index + 1}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover/carousel:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-slate-400">
          <ImageIcon className="size-6" />
        </div>
      )}

      {hasImages && (
        <div className="absolute left-2 top-2 rounded-md bg-white/85 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wide text-slate-700 shadow-sm backdrop-blur">
          Diseño aprobado
        </div>
      )}

      {multiple && (
        <>
          <button
            type="button"
            aria-label="Diseño anterior"
            onClick={(e) => go(-1, e)}
            className="absolute left-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-700 opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-white group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Siguiente diseño"
            onClick={(e) => go(1, e)}
            className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-700 opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-white group-hover/carousel:opacity-100"
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {images.map((img, i) => (
              <button
                key={img}
                type="button"
                aria-label={`Ver diseño ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}