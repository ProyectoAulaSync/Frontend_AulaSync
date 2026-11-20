import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { MATERIAS } from "../lib/materias";

type Props = {
  valor: string;
  onCambio: (valor: string) => void;
};

const OPCIONES = ["Sin materia", ...MATERIAS];

export default function SelectorMateria({ valor, onCambio }: Props) {
  const id = useId();
  const etiquetaId = `${id}-etiqueta`;
  const listboxId = `${id}-listbox`;
  const controlRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(-1);
  const indiceSeleccionado = OPCIONES.findIndex((opcion) => (opcion === "Sin materia" ? !valor : opcion === valor));
  const valorMostrado = valor || "";

  useEffect(() => {
    if (!abierto) return;

    function cerrarAlHacerClicFuera(evento: PointerEvent) {
      if (evento.target instanceof Node && !controlRef.current?.contains(evento.target)) {
        setAbierto(false);
        setIndiceActivo(-1);
      }
    }

    document.addEventListener("pointerdown", cerrarAlHacerClicFuera);
    return () => document.removeEventListener("pointerdown", cerrarAlHacerClicFuera);
  }, [abierto]);

  useEffect(() => {
    if (!abierto || indiceActivo < 0) return;
    listboxRef.current
      ?.querySelector<HTMLElement>(`[data-option-index="${indiceActivo}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [abierto, indiceActivo]);

  function abrir(indice = indiceSeleccionado >= 0 ? indiceSeleccionado : 0) {
    setIndiceActivo(indice);
    setAbierto(true);
  }

  function seleccionar(indice: number) {
    const opcion = OPCIONES[indice];
    if (opcion !== undefined) onCambio(opcion === "Sin materia" ? "" : opcion);
    setAbierto(false);
    setIndiceActivo(-1);
  }

  function manejarTeclado(evento: KeyboardEvent<HTMLButtonElement>) {
    if (evento.key === "Escape" && abierto) {
      evento.preventDefault();
      evento.stopPropagation();
      setAbierto(false);
      setIndiceActivo(-1);
      return;
    }

    if (evento.key === "Tab") {
      setAbierto(false);
      setIndiceActivo(-1);
      return;
    }

    if (!abierto) {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        abrir();
      } else if (evento.key === "ArrowDown") {
        evento.preventDefault();
        abrir(indiceSeleccionado >= 0 ? Math.min(indiceSeleccionado + 1, OPCIONES.length - 1) : 0);
      } else if (evento.key === "ArrowUp") {
        evento.preventDefault();
        abrir(indiceSeleccionado >= 0 ? Math.max(indiceSeleccionado - 1, 0) : OPCIONES.length - 1);
      }
      return;
    }

    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      setIndiceActivo((indice) => Math.min(indice + 1, OPCIONES.length - 1));
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault();
      setIndiceActivo((indice) => Math.max(indice - 1, 0));
    } else if (evento.key === "Home") {
      evento.preventDefault();
      setIndiceActivo(0);
    } else if (evento.key === "End") {
      evento.preventDefault();
      setIndiceActivo(OPCIONES.length - 1);
    } else if (evento.key === "Enter") {
      evento.preventDefault();
      seleccionar(indiceActivo);
    } else if (evento.key === " ") {
      evento.preventDefault();
    }
  }

  return (
    <div ref={controlRef} className="relative">
      <label id={etiquetaId} htmlFor={`${id}-control`} className="mb-1 block text-sm font-medium">
        Materia o tema principal
      </label>
      <button
        id={`${id}-control`}
        type="button"
        role="combobox"
        aria-labelledby={etiquetaId}
        aria-expanded={abierto}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-activedescendant={abierto && indiceActivo >= 0 ? `${id}-opcion-${indiceActivo}` : undefined}
        onClick={() => (abierto ? (setAbierto(false), setIndiceActivo(-1)) : abrir())}
        onKeyDown={manejarTeclado}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-border-control bg-white px-4 py-2 text-left text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className={valorMostrado ? "" : "text-text-subtle"}>
          {valorMostrado || "Elige una materia (opcional)"}
        </span>
        <ChevronDown aria-hidden="true" className={`h-5 w-5 shrink-0 text-text-muted transition-transform ${abierto ? "rotate-180" : ""}`} />
      </button>
      {abierto && (
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={etiquetaId}
          className="mt-1 max-h-60 overflow-y-auto overscroll-contain rounded-lg border border-border-control bg-white py-1 shadow-lg"
        >
          {OPCIONES.map((opcion, indice) => {
            const seleccionada = opcion === "Sin materia" ? !valor : opcion === valor;
            const activa = indice === indiceActivo;
            return (
              <div
                key={opcion}
                id={`${id}-opcion-${indice}`}
                data-option-index={indice}
                role="option"
                aria-selected={seleccionada}
                onMouseEnter={() => setIndiceActivo(indice)}
                onMouseDown={(evento) => evento.preventDefault()}
                onClick={() => seleccionar(indice)}
                className={`mx-1 cursor-pointer rounded-md px-3 py-2 text-ink ${
                  activa ? "bg-primary-tint text-primary-active ring-2 ring-inset ring-primary" : "hover:bg-primary-tint hover:text-primary-active"
                }`}
              >
                {opcion}
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-1.5 text-sm text-text-muted">Opcional. Puedes elegir «Sin materia» para dejarlo vacío.</p>
    </div>
  );
}
