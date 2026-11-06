import { useCallback, useEffect, useState } from "react";
import { Loader2, RotateCw } from "lucide-react";
import Mensaje from "../components/Mensaje";
import { usePageTitle } from "../hooks/usePageTitle";
import { obtenerMensaje, type MensajeBase } from "../services/api";

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "exito"; datos: MensajeBase };

function formatear(valor: unknown): string {
  if (valor === null || valor === undefined) return "—";
  if (typeof valor === "object") return JSON.stringify(valor);
  return String(valor);
}

export default function BaseTecnicaPage() {
  usePageTitle("Estado de la conexión");
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [intento, setIntento] = useState(0);

  const reintentar = useCallback(() => {
    setEstado({ tipo: "cargando" });
    setIntento((n) => n + 1);
  }, []);

  useEffect(() => {
    const controlador = new AbortController();
    obtenerMensaje(controlador.signal)
      .then((datos) => setEstado({ tipo: "exito", datos }))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setEstado({ tipo: "error" });
      });
    return () => controlador.abort();
  }, [intento]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1>Estado de la conexión</h1>
      <p className="mt-2 max-w-prose text-text-muted">
        Esta pantalla comprueba que la aplicación, el servidor y la base de datos funcionan juntos.
      </p>

      <div className="mt-6 max-w-2xl">
        {estado.tipo === "cargando" && (
          <div role="status" className="flex items-center gap-3 rounded-xl border border-border-decor bg-surface p-4">
            <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
            <p>Conectando con el servidor…</p>
          </div>
        )}

        {estado.tipo === "error" && (
          <Mensaje
            tipo="error"
            titulo="No pudimos conectar con el servidor"
            accion={
              <button type="button" className="btn btn-primary" onClick={reintentar}>
                <RotateCw aria-hidden="true" className="h-5 w-5" />
                Reintentar
              </button>
            }
          >
            Revisa tu conexión e inténtalo de nuevo.
          </Mensaje>
        )}

        {estado.tipo === "exito" && (
          <>
            <Mensaje tipo="exito" titulo="Conexión exitosa">
              El servidor respondió con datos de Firestore.
            </Mensaje>
            <section aria-labelledby="titulo-dato" className="mt-6 rounded-xl border border-border-decor bg-white p-6 shadow-sm">
              <h2 id="titulo-dato">Dato recibido desde la base de datos</h2>
              <dl className="mt-4 space-y-3">
                {Object.entries(estado.datos).map(([campo, valor]) => (
                  <div key={campo}>
                    <dt className="font-bold">{campo}</dt>
                    <dd className="break-words">{formatear(valor)}</dd>
                  </div>
                ))}
              </dl>
              <button type="button" className="btn btn-secondary mt-6" onClick={reintentar}>
                Volver a consultar
              </button>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
