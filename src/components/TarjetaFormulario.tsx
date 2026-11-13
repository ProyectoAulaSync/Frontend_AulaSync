import type { ReactNode } from "react";

type Props = {
  titulo: string;
  descripcion?: string;
  centrado?: boolean;
  children: ReactNode;
};

// Contenedor común de Iniciar sesión, Crear cuenta y Elegir nombre de usuario (tarjeta blanca con borde fino).
export default function TarjetaFormulario({ titulo, descripcion, centrado = false, children }: Props) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="rounded-xl border border-border-decor bg-white p-6 shadow-sm sm:p-8">
        <div className={`mb-6 ${centrado ? "text-center" : ""}`}>
          <h1 className="text-2xl">{titulo}</h1>
          {descripcion && <p className="mt-1 text-sm text-text-muted">{descripcion}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
