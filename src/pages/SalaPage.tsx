import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Boton from "../components/Boton";
import Cargando from "../components/Cargando";
import EstadoError from "../components/EstadoError";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";
import { obtenerMateria } from "../lib/materias";
import { esAnfitrion } from "../lib/salas";
import { ApiError } from "../services/api";
import { obtenerSala } from "../services/salas";
import type { Sala } from "../types/sala";

type EstadoSala =
  | { tipo: "cargando" }
  | { tipo: "error"; id: string; noEncontrada: boolean }
  | { tipo: "lista"; id: string; sala: Sala; materia: string | null };

export default function SalaPage() {
  const { id } = useParams<{ id: string }>();
  const { perfil } = useAuth();
  const uidPerfil = perfil?.uid;
  const [estado, setEstado] = useState<EstadoSala>({ tipo: "cargando" });
  const [intento, setIntento] = useState(0);
  const [avisoCopiado, setAvisoCopiado] = useState("");
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const salaCargada = estado.tipo === "lista" && estado.id === id ? estado : null;
  const cargando =
    Boolean(id) &&
    (estado.tipo === "cargando" || estado.id !== id);
  const errorActual = estado.tipo === "error" && estado.id === id ? estado : null;

  usePageTitle(salaCargada?.sala.nombre ?? "Sala");

  useEffect(() => {
    if (!id) return;

    const controlador = new AbortController();
    obtenerSala(id, controlador.signal)
      .then((sala) => {
        setEstado({
          tipo: "lista",
          id,
          sala,
          materia: uidPerfil ? obtenerMateria(uidPerfil, id) : null,
        });
      })
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return;
        setEstado({
          tipo: "error",
          id,
          noEncontrada: error instanceof ApiError && error.status === 404,
        });
      });
    return () => controlador.abort();
  }, [id, intento, uidPerfil]);

  useEffect(() => {
    if (estado.tipo === "lista" && estado.id === id) tituloRef.current?.focus();
  }, [estado, id]);

  async function copiarId() {
    if (!salaCargada) return;
    try {
      await navigator.clipboard.writeText(salaCargada.sala.id);
      setAvisoCopiado("ID copiado");
    } catch {
      setAvisoCopiado("No pudimos copiar el ID. Puedes seleccionarlo y copiarlo manualmente.");
    }
  }

  function reintentar() {
    setEstado({ tipo: "cargando" });
    setAvisoCopiado("");
    setIntento((actual) => actual + 1);
  }

  if (cargando) {
    return <Cargando texto="Cargando la sala…" />;
  }

  if (!id || !salaCargada) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <EstadoError
          titulo={errorActual?.noEncontrada || !id ? "No encontramos esta sala" : "No pudimos cargar esta sala"}
          texto={
            errorActual?.noEncontrada || !id
              ? "Es posible que se haya eliminado o que el enlace no sea válido."
              : "Revisa tu conexión e inténtalo de nuevo."
          }
          onReintentar={errorActual && !errorActual.noEncontrada ? reintentar : undefined}
        />
        <div className="mt-5 text-center">
          <Link to="/panel">Volver a mis salas</Link>
        </div>
      </div>
    );
  }

  const { sala, materia } = salaCargada;
  const esLaPersonaAnfitriona = perfil ? esAnfitrion(sala, perfil.uid) : false;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/panel" className="inline-flex min-h-11 items-center">Volver a mis salas</Link>
      <section className="mt-5 rounded-xl border border-border-decor bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 ref={tituloRef} tabIndex={-1}>{sala.nombre}</h1>
          {esLaPersonaAnfitriona && (
            <span className="rounded-full bg-primary-tint px-3 py-1 text-sm font-semibold text-primary">
              Anfitrión
            </span>
          )}
        </div>
        <div className="mt-6">
          <p className="text-sm font-medium text-text-muted">ID de la sala</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <code className="break-all rounded bg-surface-alt px-3 py-2 text-ink">{sala.id}</code>
            <Boton variante="neutral" onClick={() => void copiarId()}>
              Copiar ID
            </Boton>
          </div>
          <p role="status" aria-live="polite" className="mt-2 min-h-6 text-sm text-success">
            {avisoCopiado}
          </p>
        </div>
        {materia && (
          <div className="mt-4 border-t border-border-decor pt-4">
            <p className="text-sm font-medium text-text-muted">Materia o tema principal</p>
            <p className="mt-1">{materia}</p>
          </div>
        )}
      </section>
    </main>
  );
}
