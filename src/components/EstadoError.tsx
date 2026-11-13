import { CircleAlert } from "lucide-react";
import Boton from "./Boton";

type Props = {
  titulo: string;
  texto: string;
  /** Si se pasa, muestra el botón «Reintentar». */
  onReintentar?: () => void;
};

// Estado «error crítico» de la guía: contenedor central con ícono de exclamación, título claro,
// una frase de apoyo y la salida («Reintentar»). Nunca muestra códigos ni texto técnico.
export default function EstadoError({ titulo, texto, onReintentar }: Props) {
  return (
    <div role="alert" className="mx-auto max-w-sm text-center">
      <div aria-hidden="true" className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-bg">
        <CircleAlert className="h-8 w-8 text-error" />
      </div>
      <h2 className="mb-2 text-xl">{titulo}</h2>
      <p className="mb-6 text-text-muted">{texto}</p>
      {onReintentar && (
        <Boton variante="neutral" onClick={onReintentar}>
          Reintentar
        </Boton>
      )}
    </div>
  );
}
