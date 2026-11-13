import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";

type Variante = "primary" | "secondary" | "neutral" | "danger";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  /** primary (azul): acciones principales · neutral (blanco/gris): secundarias · danger (rojo): destructivas. */
  variante?: Variante;
  /** Mientras envía: muestra `textoCargando` y bloquea un segundo clic. */
  cargando?: boolean;
  /** Texto de la acción en curso, ej. «Creando…», «Entrando…», «Guardando…». */
  textoCargando?: string;
  icono?: ReactNode;
  /** El botón ocupa todo el ancho (formularios). */
  ancho?: boolean;
};

// Botón único de la aplicación: mismas variantes y tamaño táctil (44 px) en todas las pantallas.
export default function Boton({
  variante = "primary",
  cargando = false,
  textoCargando,
  icono,
  ancho = false,
  type = "button",
  onClick,
  children,
  ...resto
}: Props) {
  function alHacerClic(evento: MouseEvent<HTMLButtonElement>) {
    // aria-busy en vez de disabled: el foco no se pierde y no se permite un segundo envío.
    if (cargando) {
      evento.preventDefault();
      return;
    }
    onClick?.(evento);
  }

  return (
    <button
      {...resto}
      type={type}
      onClick={alHacerClic}
      aria-busy={cargando || undefined}
      className={`btn btn-${variante}${ancho ? " w-full" : ""}`}
    >
      {!cargando && icono}
      {cargando ? (textoCargando ?? children) : children}
    </button>
  );
}
