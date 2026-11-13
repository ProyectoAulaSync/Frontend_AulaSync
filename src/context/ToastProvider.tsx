import { CircleCheck, Info, X } from "lucide-react";
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { ToastContext, type TipoAviso, type ToastContextValor } from "./toast-context";

type Aviso = { id: number; texto: string; tipo: TipoAviso };

// Tiempo suficiente para leerlo (WCAG 2.2.1); la persona también puede cerrarlo antes.
const DURACION_MS = 5000;

// Avisos emergentes abajo a la derecha. Viven fuera de las rutas, así sobreviven al cambio de pantalla
// (por ejemplo, «Cerraste sesión.» se ve ya en el inicio). El lector de pantalla los anuncia sin mover el foco.
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const siguiente = useRef(0);

  const cerrar = useCallback((id: number) => {
    setAvisos((lista) => lista.filter((a) => a.id !== id));
  }, []);

  const mostrarAviso = useCallback(
    (texto: string, tipo: TipoAviso = "exito") => {
      const id = ++siguiente.current;
      setAvisos((lista) => [...lista, { id, texto, tipo }]);
      setTimeout(() => cerrar(id), DURACION_MS);
    },
    [cerrar],
  );

  const valor = useMemo<ToastContextValor>(() => ({ mostrarAviso }), [mostrarAviso]);

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 left-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:max-w-sm"
      >
        {avisos.map(({ id, texto, tipo }) => {
          const Icono = tipo === "exito" ? CircleCheck : Info;
          return (
            <div
              key={id}
              className="pointer-events-auto flex w-full items-center gap-3 rounded-lg bg-ink py-2 pr-2 pl-4 text-room-text shadow-lg"
            >
              <Icono aria-hidden="true" className="h-5 w-5 shrink-0 text-room-success" />
              <p className="flex-1">{texto}</p>
              <button
                type="button"
                onClick={() => cerrar(id)}
                aria-label="Cerrar aviso"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-room-text-muted hover:text-room-text focus-visible:outline-room-focus"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
