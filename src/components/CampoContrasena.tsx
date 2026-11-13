import { useState, type ComponentProps } from "react";
import { Circle, CircleCheck, CircleAlert, Eye, EyeOff } from "lucide-react";
import Campo from "./Campo";
import { requisitosDeContrasena } from "../lib/validaciones";

type PropsCampo = Omit<ComponentProps<typeof Campo>, "type" | "accionFinal" | "pie" | "idPie" | "value"> & {
  value: string;
};

type Props = PropsCampo & {
  /** Muestra la política de contraseña (solo al crear cuenta; al iniciar sesión no se muestra). */
  mostrarRequisitos?: boolean;
  /** Tras intentar enviar sin cumplirlos, los pendientes se resaltan en rojo con su ícono. */
  resaltarPendientes?: boolean;
};

// Contraseña con botón «Mostrar contraseña» / «Ocultar contraseña» dentro del campo (por eso no se pide repetirla).
export default function CampoContrasena({ mostrarRequisitos = false, resaltarPendientes = false, ...campo }: Props) {
  const [visible, setVisible] = useState(false);
  const requisitos = requisitosDeContrasena(campo.value);
  const iniciado = campo.value.length > 0;
  const completa = requisitos.every((r) => r.cumplido);
  const idRequisitos = `${campo.id}-requisitos`;

  return (
    <Campo
      {...campo}
      type={visible ? "text" : "password"}
      // El mensaje de éxito solo existe cuando se muestran los requisitos (al crear cuenta).
      exito={mostrarRequisitos && iniciado && completa ? "Cumple todos los requisitos." : campo.exito}
      accionFinal={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-text-muted hover:text-ink"
        >
          {visible ? <EyeOff aria-hidden="true" className="h-5 w-5" /> : <Eye aria-hidden="true" className="h-5 w-5" />}
        </button>
      }
      idPie={mostrarRequisitos ? idRequisitos : undefined}
      pie={
        mostrarRequisitos ? (
          <ul id={idRequisitos} className="mt-3 space-y-1.5 rounded-lg border border-border-decor bg-surface p-3">
            {requisitos.map(({ id, texto, cumplido }) => {
              const pendienteResaltado = !cumplido && resaltarPendientes;
              const Icono = cumplido ? CircleCheck : pendienteResaltado ? CircleAlert : Circle;
              const color = cumplido ? "text-success" : pendienteResaltado ? "text-error" : "text-text-muted";
              return (
                <li key={id} className={`flex items-center gap-2 text-sm ${color}`}>
                  <Icono aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span>{texto}</span>
                  <span className="sr-only">{cumplido ? "Cumplido" : "Pendiente"}</span>
                </li>
              );
            })}
          </ul>
        ) : undefined
      }
    />
  );
}
