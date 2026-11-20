import { useEffect, useRef, type ReactNode } from "react";
import Boton from "./Boton";
import ModalBase from "./ModalBase";

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
  const confirmarRef = useRef(onConfirmar);

  useEffect(() => {
    confirmarRef.current = onConfirmar;
  }, [onConfirmar]);

  return (
    <ModalBase
      abierto={abierto}
      titulo={titulo}
      descripcion={descripcion}
      error={error}
      confirmando={confirmando}
      rol="alertdialog"
      ancho="max-w-md"
      selectorFocoInicial="[data-modal-cancel]"
      onCerrar={onCerrar}
    >
      {children}
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
    </ModalBase>
  );
}
