import { createContext } from "react";

export type TipoAviso = "exito" | "info";

export type ToastContextValor = {
  /** Muestra un aviso breve y emergente (abajo a la derecha) que desaparece solo. */
  mostrarAviso: (texto: string, tipo?: TipoAviso) => void;
};

export const ToastContext = createContext<ToastContextValor | null>(null);
