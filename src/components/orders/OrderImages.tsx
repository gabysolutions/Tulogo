import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import type { Order } from "../../types/order";

interface Props {
  order: Order;
}

export default function OrderImages({
  order,
}: Props) {
  const [current, setCurrent] = useState(0);

  const images = order.images;
   

  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">
          Diseños aprobados
        </h3>

        <div
          className="
            flex
            h-64
            items-center
            justify-center
            rounded-xl
            border-2
            border-dashed
            border-gray-300
            text-sm
            text-gray-400
          "
        >
          No hay imágenes disponibles
        </div>
      </div>
    );
  }

  function next() {
    setCurrent((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  }

  function previous() {
    setCurrent((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  }

  return (
    <section className="rounded-2xl border border-gray-300 bg-white p-5 shadow-sm">
      {/* Header */}

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">
            Diseños aprobados
          </h3>

          <p className="text-xs text-gray-500">
            {images.length} imagen
            {images.length > 1 ? "es" : ""}
          </p>
        </div>

        
      </div>

      {/* Imagen */}

      <div className="relative overflow-hidden rounded-xl border border-gray-200">
        <img
          src={images[current]}
          alt={`Diseño ${current + 1}`}
          className="
            h-[420px]
            w-full
            object-cover
            transition-all
            duration-300
          "
        />

        {/* Flechas */}

        {images.length > 1 && (
          <>
            <button
              onClick={previous}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                rounded-full
                bg-white/90
                p-2
                shadow
                transition
                hover:bg-white
              "
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={next}
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                rounded-full
                bg-white/90
                p-2
                shadow
                transition
                hover:bg-white
              "
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Contador */}

        <div
          className="
            absolute
            bottom-3
            right-3
            rounded-full
            bg-black/70
            px-3
            py-1
            text-xs
            text-white
          "
        >
          {current + 1} / {images.length}
        </div>
      </div>

      {/* Indicadores */}

      {images.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`
                h-2.5
                rounded-full
                transition-all
                ${
                  current === index
                    ? "w-8 bg-blue-600"
                    : "w-2.5 bg-gray-300"
                }
              `}
            />
          ))}
        </div>
      )}

      {/* Miniaturas */}

      {images.length > 1 && (
        <div className="mt-5 grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`
                overflow-hidden
                rounded-lg
                border-2
                transition
                ${
                  current === index
                    ? "border-blue-600"
                    : "border-transparent hover:border-gray-300"
                }
              `}
            >
              <img
                src={image}
                alt={`Miniatura ${index + 1}`}
                className="
                  aspect-[4/5]
                  w-full
                  object-cover
                "
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}