import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

type Tipo = "error" | "exito" | "advertencia" | "info";

// Patrón de la guía visual (6.4): ícono + título + texto + acción opcional.
const estilos: Record<Tipo, { caja: string; icono: string; rol: "alert" | "status"; Icono: typeof Info }> = {
  error: { caja: "border-error bg-error-bg text-error-text", icono: "text-error", rol: "alert", Icono: CircleAlert },
  exito: { caja: "border-success bg-success-bg text-success-text", icono: "text-success", rol: "status", Icono: CircleCheck },
  advertencia: { caja: "border-warning bg-warning-bg text-warning-text", icono: "text-warning", rol: "status", Icono: TriangleAlert },
  info: { caja: "border-primary bg-primary-tint text-primary-active", icono: "text-primary", rol: "status", Icono: Info },
};

type Props = { tipo: Tipo; titulo: string; children?: ReactNode; accion?: ReactNode };

export default function Mensaje({ tipo, titulo, children, accion }: Props) {
  const { caja, icono, rol, Icono } = estilos[tipo];
  return (
    <div role={rol} className={`rounded-lg border-l-4 p-4 ${caja}`}>
      <div className="flex items-start gap-3">
        <Icono aria-hidden="true" className={`mt-0.5 h-5 w-5 shrink-0 ${icono}`} />
        <div>
          <p className="font-bold">{titulo}</p>
          {children && <p>{children}</p>}
        </div>
      </div>
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}
