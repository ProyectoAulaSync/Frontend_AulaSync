import { Link, useLocation } from "react-router-dom";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import Boton from "../components/Boton";
import CargandoTarjetas from "../components/CargandoTarjetas";
import EstadoError from "../components/EstadoError";
import EstadoVacio from "../components/EstadoVacio";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";
import { useSalas } from "../hooks/useSalas";
import { obtenerMateria } from "../lib/materias";

export default function PanelPage() {
  usePageTitle("Panel");
  const { perfil } = useAuth();
  const location = useLocation();
  const { estado, reintentar } = useSalas();
  const [mostrarCarga, setMostrarCarga] = useState(false);

  useEffect(() => {
    if (estado.tipo !== "cargando") return;
    const temporizador = window.setTimeout(() => setMostrarCarga(true), 300);
    return () => window.clearTimeout(temporizador);
  }, [estado.tipo]);

  function reintentarSalas() {
    setMostrarCarga(false);
    reintentar();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1>Panel</h1>
          {perfil && <p className="mt-1 text-text-muted">Hola, {perfil.nombres || perfil.username}.</p>}
        </div>
        <Link
          to="/salas/nueva"
          state={{ backgroundLocation: location }}
          className="btn btn-primary"
        >
          Crear sala
        </Link>
      </header>

      <div className="mt-8 flex min-h-72 items-center justify-center">
        {estado.tipo === "cargando" && mostrarCarga && <CargandoTarjetas texto="Cargando tus salas…" />}

        {estado.tipo === "error" && (
          <EstadoError titulo="No pudimos cargar tus Salas" texto="Revisa tu conexión e inténtalo de nuevo." onReintentar={reintentarSalas} />
        )}

        {estado.tipo === "listo" && estado.salas.length === 0 && (
          <EstadoVacio
            icono={<Users className="h-10 w-10 text-primary" />}
            titulo="Aún no tienes salas"
            texto="Crea una sala para organizar un espacio de estudio colaborativo. Pronto podrás unirte con el ID de una sala."
            acciones={
              <Boton variante="neutral" disabled>
                Unirse con ID
              </Boton>
            }
          />
        )}

        {estado.tipo === "listo" && estado.salas.length > 0 && (
          <section aria-labelledby="titulo-salas" className="w-full">
            <h2 id="titulo-salas">Tus Salas</h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {estado.salas.map((sala) => {
                const materia = perfil ? obtenerMateria(perfil.uid, sala.id) : null;
                return (
                  <li key={sala.id} className="rounded-xl border border-border-decor bg-white p-4 shadow-sm">
                    <h3>{sala.nombre}</h3>
                    <p className="mt-1 text-sm text-text-muted">
                      ID de la Sala: {sala.id} · {sala.rol}
                    </p>
                    {materia && <p className="mt-1 text-sm text-text-muted">Materia: {materia}</p>}
                    <Link to={`/salas/${sala.id}`} className="btn btn-primary mt-4">
                      Entrar a la Sala
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
