import type { ReactNode } from "react";

type Props = {
  /** Ícono ilustrativo (ya con su tamaño y color). */
  icono: ReactNode;
  titulo: string;
  texto: string;
  /** Botones: el principal azul va primero. Ninguna vista termina en un callejón sin salida. */
  acciones?: ReactNode;
};

// Estado «vacío» de la guía: la petición fue exitosa pero no hay contenido.
// Ícono ilustrativo + invitación directa + acción principal debajo.
export default function EstadoVacio({ icono, titulo, texto, acciones }: Props) {
  return (
    <div className="mx-auto max-w-sm text-center">
      <div
        aria-hidden="true"
        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-border-decor bg-white shadow-sm"
      >
        {icono}
      </div>
      <h2 className="mb-2 text-xl">{titulo}</h2>
      <p className="mb-6 text-text-muted">{texto}</p>
      {acciones && <div className="flex flex-wrap justify-center gap-3">{acciones}</div>}
    </div>
  );
}
