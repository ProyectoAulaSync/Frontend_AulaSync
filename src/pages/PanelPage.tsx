import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import Boton from "../components/Boton";
import CargandoTarjetas from "../components/CargandoTarjetas";
import EstadoError from "../components/EstadoError";
import EstadoVacio from "../components/EstadoVacio";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";
import { useSalas } from "../hooks/useSalas";

export default function PanelPage() {
  usePageTitle("Panel");
  const { perfil } = useAuth();
  const { estado, reintentar } = useSalas();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1>Panel</h1>
      {perfil && <p className="mt-1 text-text-muted">Hola, {perfil.nombres || perfil.username}.</p>}

      <div className="mt-8 flex min-h-72 items-center justify-center">
        {estado.tipo === "cargando" && <CargandoTarjetas texto="Cargando tus Salas…" />}

        {estado.tipo === "error" && (
          <EstadoError titulo="No pudimos cargar tus Salas" texto="Revisa tu conexión e inténtalo de nuevo." onReintentar={reintentar} />
        )}

        {estado.tipo === "listo" && estado.salas.length === 0 && (
          <EstadoVacio
            icono={<Users className="h-10 w-10 text-primary" />}
            titulo="Aún no tienes salas"
            texto="Pronto podrás crear una sala o unirte a una con su ID para estudiar con tu grupo."
            acciones={
              <>
                {/* La creación y la unión a Salas se construyen en un sprint posterior. */}
                <Boton disabled>Crear sala</Boton>
                <Boton variante="neutral" disabled>
                  Unirse con ID
                </Boton>
              </>
            }
          />
        )}

        {estado.tipo === "listo" && estado.salas.length > 0 && (
          <section aria-labelledby="titulo-salas" className="w-full">
            <h2 id="titulo-salas">Tus Salas</h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {estado.salas.map((sala) => (
                <li key={sala.id} className="rounded-xl border border-border-decor bg-white p-4 shadow-sm">
                  <h3>{sala.nombre}</h3>
                  <p className="mt-1 text-sm text-text-muted">
                    ID de la Sala: {sala.id} · {sala.rol}
                  </p>
                  <Link to={`/salas/${sala.id}`} className="btn btn-primary mt-4">
                    Entrar a la Sala
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
