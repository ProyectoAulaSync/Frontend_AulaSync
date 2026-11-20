import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Boton from "./Boton";

type Props = {
  abierto: boolean;
  titulo: string;
  descripcion: string;
  children?: ReactNode;
  error?: string | null;
  textoConfirmar: string;
  textoConfirmando: string;
  confirmando?: boolean;
  onCerrar: () => void;
  onConfirmar: () => void;
};

export default function ModalConfirmacion({
  abierto,
  titulo,
  descripcion,
  children,
  error,
  textoConfirmar,
  textoConfirmando,
  confirmando = false,
  onCerrar,
  onConfirmar,
}: Props) {
  const id = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmarRef = useRef(onConfirmar);
  const cerrarRef = useRef(onCerrar);
  const confirmandoRef = useRef(confirmando);

  useEffect(() => {
    confirmarRef.current = onConfirmar;
    cerrarRef.current = onCerrar;
    confirmandoRef.current = confirmando;
  }, [onConfirmar, onCerrar, confirmando]);

  useEffect(() => {
    if (!abierto) return;

    const focoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLButtonElement>("[data-modal-cancel]")?.focus();

    function manejarTeclado(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        if (!confirmandoRef.current) cerrarRef.current();
        return;
      }
      if (evento.key !== "Tab") return;

      const dialogo = dialogRef.current;
      if (!dialogo) return;
      const enfocables = Array.from(
        dialogo.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (enfocables.length === 0) {
        evento.preventDefault();
        dialogo.focus();
        return;
      }

      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (evento.shiftKey && document.activeElement === primero) {
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
  }, [abierto]);

  if (!abierto) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 p-4"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget && !confirmando) onCerrar();
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        aria-describedby={`${id}-descripcion`}
        tabIndex={-1}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id={`${id}-titulo`} className="text-xl">{titulo}</h2>
        <p id={`${id}-descripcion`} className="mt-2 text-text-muted">{descripcion}</p>
        {children && <div className="mt-4">{children}</div>}
        {error && <p role="alert" className="mt-4 text-sm font-medium text-error">{error}</p>}
        <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Boton
            data-modal-cancel
            variante="neutral"
            onClick={onCerrar}
            disabled={confirmando}
          >
            Cancelar
          </Boton>
          <Boton
            variante="danger"
            onClick={() => confirmarRef.current()}
            cargando={confirmando}
            textoCargando={textoConfirmando}
          >
            {error ? "Reintentar" : textoConfirmar}
          </Boton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
