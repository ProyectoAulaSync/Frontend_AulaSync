import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type OpcionMenu = {
  texto: string;
  onClick: () => void;
};

export default function MenuOpciones({ opciones }: { opciones: OpcionMenu[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setAbierto((a) => !a)}
        className="btn btn[data-modal-close] p-0"
        aria-label="Más opciones"
      >
        <MoreVertical aria-hidden="true" className="h-5 w-5" />
      </button>
      {abierto && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border-decor bg-white shadow-lg py-2 z-50">
          {opciones.map((opcion, i) => (
            <button
              key={i}
              onClick={() => {
                opcion.onClick();
                setAbierto(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-surface-alt transition-colors duration-150 ease-out"
            >
              {opcion.texto}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
