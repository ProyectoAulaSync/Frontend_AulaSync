import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "required"> & {
  id: string;
  etiqueta: string;
  /** Campo requerido: muestra el asterisco (*) junto a la etiqueta. */
  obligatorio?: boolean;
  /** Línea gris bajo el campo con la regla, antes de que se cometa el error. */
  ayuda?: string;
  /** Mensaje de error (texto rojo con ícono) justo debajo del campo. */
  error?: ReactNode;
  /** Mensaje de éxito (texto verde con ícono). */
  exito?: string | null;
  /** Oculta la etiqueta a la vista pero la deja para lectores de pantalla. */
  etiquetaOculta?: boolean;
  /** Botón dentro del campo, a la derecha (ej. mostrar contraseña). */
  accionFinal?: ReactNode;
  /** Contenido bajo los mensajes (ej. requisitos de contraseña). */
  pie?: ReactNode;
  /** Id del contenido de `pie`, para vincularlo con aria-describedby. */
  idPie?: string;
  centrado?: boolean;
  ref?: Ref<HTMLInputElement>;
};

// Campo único de todos los formularios: label asociado, ayuda y error vinculados con aria-describedby,
// y el error nunca depende solo del color (borde + ícono + texto).
export default function Campo({
  id,
  etiqueta,
  obligatorio = false,
  ayuda,
  error,
  exito,
  etiquetaOculta = false,
  accionFinal,
  pie,
  idPie,
  centrado = false,
  ref,
  ...resto
}: Props) {
  const idAyuda = `${id}-ayuda`;
  const idError = `${id}-error`;
  const idExito = `${id}-exito`;
  const describedBy =
    [error ? idError : null, exito ? idExito : null, ayuda ? idAyuda : null, pie ? idPie : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const borde = error ? "border-error" : exito ? "border-success" : "border-border-control";

  return (
    <div>
      <label htmlFor={id} className={etiquetaOculta ? "sr-only" : "mb-1 block text-sm font-medium"}>
        {etiqueta}
        {obligatorio && (
          <span aria-hidden="true" className="text-error">
            {" "}
            *
          </span>
        )}
      </label>

      <div className="relative">
        <input
          {...resto}
          ref={ref}
          id={id}
          aria-required={obligatorio || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`min-h-11 w-full rounded-lg border bg-white px-4 py-2 text-ink placeholder:text-text-subtle ${borde} ${
            accionFinal ? "pr-12" : ""
          } ${centrado ? "text-center text-lg" : ""}`}
        />
        {accionFinal && <div className="absolute inset-y-0 right-1 flex items-center">{accionFinal}</div>}
      </div>

      {error && (
        <p id={idError} role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm text-error">
          <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
      {exito && (
        <p id={idExito} role="status" className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-success">
          <CircleCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {exito}
        </p>
      )}
      {ayuda && (
        <p id={idAyuda} className="mt-1.5 text-sm text-text-muted">
          {ayuda}
        </p>
      )}
      {pie}
    </div>
  );
}
