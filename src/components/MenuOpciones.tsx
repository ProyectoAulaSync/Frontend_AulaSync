import { MoreVertical } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type OpcionMenu = {
  texto: string;
  onClick: () => void;
};

export default function MenuOpciones({ opciones }: { opciones: OpcionMenu[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [posicion, setPosicion] = useState<{ top: number; left: number } | null>(null);

  const abrir = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const btn = btnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setPosicion({ top: rect.bottom + 6, left: rect.right - 160 });
    }
    setAbierto(true);
  }, []);

  const cerrar = useCallback(() => {
    setAbierto(false);
    setPosicion(null);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        cerrar();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cerrar]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        ref={btnRef}
        onClick={abrir}
        className="btn btn[data-modal-close] p-0"
        aria-label="Más opciones"
      >
        <MoreVertical aria-hidden="true" className="h-5 w-5" />
      </button>
      {abierto && posicion && (
        <div
          className="fixed w-48 rounded-xl border border-border-decor bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] py-2 z-60"
          style={{ top: `${posicion.top}px`, left: `${posicion.left}px` }}
        >
          {opciones.map((opcion, i) => (
            <button
              key={i}
              onClick={() => {
                opcion.onClick();
                cerrar();
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
