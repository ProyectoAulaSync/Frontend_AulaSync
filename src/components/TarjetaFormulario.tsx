import type { ReactNode } from "react";

type Props = {
  titulo: string;
  descripcion?: string;
  insignia?: string;
  antesTitulo?: ReactNode;
  centrado?: boolean;
  children: ReactNode;
};

export default function TarjetaFormulario({
  titulo,
  descripcion,
  insignia,
  antesTitulo,
  centrado = false,
  children,
}: Props) {
  return (
    <div className="w-full min-w-0">
      {antesTitulo}
      {insignia && (
        <p className="mb-3 w-fit rounded-full bg-primary-tint px-3 py-1 text-sm font-semibold text-primary-active">
          {insignia}
        </p>
      )}
      <div className={`mb-6 ${centrado ? "text-center" : ""}`}>
        <h1 className="text-3xl">{titulo}</h1>
        {descripcion && <p className="mt-2 text-text-muted">{descripcion}</p>}
      </div>
      {children}
    </div>
  );
}
