import { Link, useLocation } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Boton from "../components/Boton";
import CargandoTarjetas from "../components/CargandoTarjetas";
import EstadoError from "../components/EstadoError";
import EstadoVacio from "../components/EstadoVacio";
import Mensaje from "../components/Mensaje";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";
import { useSalas } from "../hooks/useSalas";
import { obtenerMateria } from "../lib/materias";
import { TIEMPO_MINIMO_MS } from "../lib/constantes";
import { esAnfitrion } from "../lib/salas";
import { ApiError } from "../services/api";

export default function PanelPage() {
  usePageTitle("Mis salas");
  const { perfil } = useAuth();
  const location = useLocation();
  const { estado, reintentar } = useSalas();
  const [mostrarCarga, setMostrarCarga] = useState(false);
  const [avisoCopiado, setAvisoCopiado] = useState<{ salaId: string; texto: string } | null>(null);
  const cargaMostradaEn = useRef<number | null>(null);

  useEffect(() => {
    if (estado.tipo !== "cargando") return;
    const temporizador = window.setTimeout(() => {
      cargaMostradaEn.current = performance.now();
      setMostrarCarga(true);
    }, 300);
    return () => window.clearTimeout(temporizador);
  }, [estado.tipo]);

  useEffect(() => {
    if (estado.tipo === "cargando" || !mostrarCarga || cargaMostradaEn.current === null) return;
    const tiempoVisible = performance.now() - cargaMostradaEn.current;
    const restante = Math.max(0, TIEMPO_MINIMO_MS - tiempoVisible);
    const temporizador = window.setTimeout(() => {
      cargaMostradaEn.current = null;
      setMostrarCarga(false);
    }, restante);
    return () => window.clearTimeout(temporizador);
  }, [estado.tipo, mostrarCarga]);

  function reintentarSalas() {
    setMostrarCarga(false);
    cargaMostradaEn.current = null;
    reintentar();
  }

  async function copiarId(salaId: string) {
    try {
      await navigator.clipboard.writeText(salaId);
      setAvisoCopiado({ salaId, texto: "ID copiado" });
    } catch {
      setAvisoCopiado({ salaId, texto: "No se pudo copiar el ID" });
    }
  }

  const perfilIncompleto =
    estado.tipo === "error" &&
    estado.error instanceof ApiError &&
    estado.error.status === 403 &&
    estado.error.code === "PROFILE_INCOMPLETE";
  const mostrarCrearSalaArriba =
    estado.tipo !== "listo" ||
    mostrarCarga ||
    estado.salas.length > 0;

  return (
    <main className="page-container bg-transparent">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-primary">Mis salas</h1>
          <p className="mt-2 text-text-muted">
            Administre sus espacios colaborativos o acceda a salas de estudio en curso.
          </p>
        </div>
        {mostrarCrearSalaArriba && (
          <Link
            to="/salas/nueva"
            state={{ backgroundLocation: location }}
            className="btn btn-primary w-full shrink-0 whitespace-nowrap sm:w-auto"
          >
            <Plus aria-hidden="true" className="h-5 w-5" />
            Crear sala
          </Link>
        )}
      </header>

      <div className="mt-8">
        {estado.tipo === "listo" && (
          <p className="mb-5 font-heading font-semibold" aria-live="polite">
            {estado.salas.length} {estado.salas.length === 1 ? "sala" : "salas"}
          </p>
        )}

        {mostrarCarga && (
          <CargandoTarjetas cantidad={6} texto="Cargando tus salas…" />
        )}

        {estado.tipo === "error" && !mostrarCarga && perfilIncompleto && (
          <Mensaje tipo="error" titulo="Completa tu perfil para ver tus salas">
            Termina de configurar tu perfil y vuelve a intentarlo.
          </Mensaje>
        )}

        {estado.tipo === "error" && !mostrarCarga && !perfilIncompleto && (
          <EstadoError
            titulo="No pudimos cargar tus salas"
            texto="Revisa tu conexión e inténtalo de nuevo."
            onReintentar={reintentarSalas}
          />
        )}

        {estado.tipo === "listo" && !mostrarCarga && estado.salas.length === 0 && (
          <EstadoVacio
            icono={<Users className="h-10 w-10 text-primary" />}
            titulo="Aún no tienes salas"
            texto="Crea tu primera sala y organiza un espacio colaborativo para estudiar con tu grupo."
            acciones={
              <Link
                to="/salas/nueva"
                state={{ backgroundLocation: location }}
                className="btn btn-primary w-full sm:w-auto"
              >
                <Plus aria-hidden="true" className="h-5 w-5" />
                Crear sala
              </Link>
            }
          />
        )}

        {estado.tipo === "listo" && !mostrarCarga && estado.salas.length > 0 && (
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {estado.salas.map((sala) => {
              const materia = perfil ? obtenerMateria(perfil.uid, sala.id) : null;
              const esPropietario = perfil ? esAnfitrion(sala, perfil.uid) : false;
              const aviso = avisoCopiado?.salaId === sala.id ? avisoCopiado.texto : "";

              return (
                <li
                  key={sala.id}
                  className="flex min-w-0 flex-col rounded-xl border border-border-decor bg-white p-5 shadow-sm"
                >
                  {esPropietario && (
                    <span className="mb-3 w-fit rounded-full bg-primary-tint px-3 py-1 text-sm font-semibold text-primary-active">
                      Anfitrión
                    </span>
                  )}
                  <h2 className="break-words text-xl">{sala.nombre}</h2>
                  {materia && <p className="mt-2 text-text-muted">{materia}</p>}
                  <p className="mt-3 break-all text-sm text-text-muted">ID: {sala.id}</p>
                  <p
                    role="status"
                    aria-live="polite"
                    className={`mt-2 min-h-6 text-sm ${aviso.startsWith("No se pudo") ? "text-error" : "text-success"}`}
                  >
                    {aviso}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-3 pt-2">
                    <Boton variante="neutral" onClick={() => void copiarId(sala.id)}>
                      Copiar ID
                    </Boton>
                    <Link to={`/salas/${encodeURIComponent(sala.id)}`} className="btn btn-neutral">
                      Entrar
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
