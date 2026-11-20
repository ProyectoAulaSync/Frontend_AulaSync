import { useContext } from "react";
import { ToastContext, type ToastContextValor } from "../context/toast-context";

export function useToast(): ToastContextValor {
  const valor = useContext(ToastContext);
  if (!valor) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return valor;
}
