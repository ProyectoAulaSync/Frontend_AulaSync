import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Boton from "./Boton";

type Props = {
  abierto: boolean;
  titulo: string;
  descripcion?: string;
  eyebrow?: string;
  children: ReactNode;
  error?: string | null;
  confirmando?: boolean;
  rol?: "dialog" | "alertdialog";
  nivelTitulo?: "h1" | "h2";
  ancho?: "max-w-md" | "max-w-xl";
  mostrarCerrar?: boolean;
  pantallaCompletaMovil?: boolean;
  selectorFocoInicial?: string;
  onCerrar: () => void;
};

export default function ModalBase({
  abierto,
  titulo,
  descripcion,
  eyebrow,
  children,
  error,
  confirmando = false,
  rol = "dialog",
  nivelTitulo = "h2",
  ancho = "max-w-md",
  mostrarCerrar = false,
  pantallaCompletaMovil = false,
  selectorFocoInicial,
  onCerrar,
}: Props) {
  const id = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef(onCerrar);
  const confirmandoRef = useRef(confirmando);

  useEffect(() => {
    cerrarRef.current = onCerrar;
    confirmandoRef.current = confirmando;
  }, [onCerrar, confirmando]);

  useEffect(() => {
    if (!abierto) return;

    const focoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialogo = dialogRef.current;
    const destinoInicial = selectorFocoInicial
      ? dialogo?.querySelector<HTMLElement>(selectorFocoInicial)
      : dialogo?.querySelector<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
    (destinoInicial ?? dialogo)?.focus();

    function manejarTeclado(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        if (!confirmandoRef.current) cerrarRef.current();
        return;
      }
      if (evento.key !== "Tab") return;

      const actual = dialogRef.current;
      if (!actual) return;
      const enfocables = Array.from(
        actual.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((elemento) => !elemento.closest("[hidden],[aria-hidden='true']"));

      if (enfocables.length === 0) {
        evento.preventDefault();
        actual.focus();
        return;
      }

      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (!actual.contains(document.activeElement)) {
        evento.preventDefault();
        (evento.shiftKey ? ultimo : primero).focus();
      } else if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", manejarTeclado);
    return () => {
      document.removeEventListener("keydown", manejarTeclado);
      document.body.style.overflow = overflowAnterior;
      focoAnterior?.focus();
    };
  }, [abierto, selectorFocoInicial]);

  if (!abierto) return null;

  const descripcionId = descripcion ? `${id}-descripcion` : undefined;
  const clasePantallaCompleta = pantallaCompletaMovil
    ? "max-sm:bg-white max-sm:p-0"
    : "";
  const claseDialogoPantallaCompleta = pantallaCompletaMovil
    ? "max-sm:min-h-dvh max-sm:max-h-dvh max-sm:max-w-none max-sm:rounded-none max-sm:p-4"
    : "";
  const Titulo = nivelTitulo;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 p-4 ${clasePantallaCompleta}`}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget && !confirmando) onCerrar();
      }}
    >
      <div
        ref={dialogRef}
        role={rol}
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        aria-describedby={descripcionId}
        tabIndex={-1}
        className={`relative max-h-[calc(100dvh-2rem)] w-full ${ancho} overflow-y-auto rounded-xl bg-white p-6 shadow-xl ${claseDialogoPantallaCompleta}`}
      >
        {(eyebrow || mostrarCerrar) && (
          <div className="mb-1 flex items-start justify-between gap-4">
            {eyebrow ? <p className="font-heading text-sm font-semibold text-primary">{eyebrow}</p> : <span />}
            {mostrarCerrar && (
              <Boton
                variante="neutral"
                aria-label="Cerrar"
                onClick={onCerrar}
                disabled={confirmando}
                icono={<X aria-hidden="true" className="h-5 w-5" />}
              />
            )}
          </div>
        )}
        <Titulo id={`${id}-titulo`} className={nivelTitulo === "h1" ? "text-2xl" : "text-xl"}>{titulo}</Titulo>
        {descripcion && (
          <p id={descripcionId} className="mt-2 text-text-muted">
            {descripcion}
          </p>
        )}
        {error && <p role="alert" className="mt-4 text-sm font-medium text-error">{error}</p>}
        {children}
      </div>
    </div>,
    document.body,
  );
}
