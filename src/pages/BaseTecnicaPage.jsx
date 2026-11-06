import { useCallback, useEffect, useState } from "react";
import { CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import { usePageTitle } from "../hooks/usePageTitle";
import { obtenerBaseTecnica } from "../services/api";

// Estados posibles: { tipo: "cargando" } | { tipo: "error" } | { tipo: "exito", datos }
export default function BaseTecnicaPage() {
  usePageTitle("Estado de la conexión");
  const [estado, setEstado] = useState({ tipo: "cargando" });
  const [intento, setIntento] = useState(0);

  const consultar = useCallback((signal) => {
    setEstado({ tipo: "cargando" });
    obtenerBaseTecnica(signal)
      .then((datos) => setEstado({ tipo: "exito", datos }))
      .catch((e) => {
        if (e.name !== "AbortError") setEstado({ tipo: "error" });
      });
  }, []);

  useEffect(() => {
    const controlador = new AbortController();
    consultar(controlador.signal);
    return () => controlador.abort();
  }, [consultar, intento]);

  return (
    <>
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
          <div role="alert" className="rounded-lg border-l-4 border-error bg-error-bg p-4 text-error-text">
            <div className="flex items-start gap-3">
              <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-error" />
              <div>
                <p className="font-bold">No pudimos conectar con el servidor</p>
                <p>Revisa tu conexión e inténtalo de nuevo.</p>
              </div>
            </div>
            <button type="button" className="btn btn-primary mt-4" onClick={() => setIntento((n) => n + 1)}>
              Reintentar
            </button>
          </div>
        )}

        {estado.tipo === "exito" && (
          <>
            <div role="status" className="rounded-lg border-l-4 border-success bg-success-bg p-4 text-success-text">
              <div className="flex items-start gap-3">
                <CircleCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                <div>
                  <p className="font-bold">Conexión exitosa</p>
                  <p>El servidor respondió con datos de Firestore.</p>
                </div>
              </div>
            </div>

            <section aria-labelledby="titulo-dato" className="mt-6 rounded-xl border border-border-decor bg-white p-6 shadow-sm">
              <h2 id="titulo-dato">Dato recibido desde la base de datos</h2>
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="font-bold">Mensaje</dt>
                  <dd>{estado.datos.mensaje}</dd>
                </div>
                <div>
                  <dt className="font-bold">Última actualización</dt>
                  <dd>
                    {new Date(estado.datos.actualizadoEn).toLocaleString("es-CO", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold">Origen</dt>
                  <dd>Firestore, a través de la API</dd>
                </div>
              </dl>
              <button type="button" className="btn btn-secondary mt-6" onClick={() => setIntento((n) => n + 1)}>
                Volver a consultar
              </button>
            </section>
          </>
        )}
      </div>
    </>
  );
}
