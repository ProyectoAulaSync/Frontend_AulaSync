import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Copy, Plus, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Boton from "../components/Boton";
import Campo from "../components/Campo";
import CargandoTarjetas from "../components/CargandoTarjetas";
import MenuOpciones from "../components/MenuOpciones";
import EstadoError from "../components/EstadoError";
import EstadoVacio from "../components/EstadoVacio";
import Mensaje from "../components/Mensaje";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";
import { useSalas } from "../hooks/useSalas";
import { useToast } from "../hooks/useToast";
import { obtenerMateria, guardarMateria } from "../lib/materias";
import { TIEMPO_MINIMO_MS } from "../lib/constantes";
import { esAnfitrion } from "../lib/salas";
import { ApiError } from "../services/api";
import { actualizarSala, eliminarSala, unirASala } from "../services/salas";

export default function PanelPage() {
  usePageTitle("Mis salas");
  const { perfil } = useAuth();
  const location = useLocation();
  const navegar = useNavigate();
  const { estado, reintentar } = useSalas();
  const { mostrarAviso } = useToast();
  const [mostrarCarga, setMostrarCarga] = useState(false);
  const [mostrarModalUnirSala, setMostrarModalUnirSala] = useState(false);
  const [idSala, setIdSala] = useState("");
  const [uniendo, setUniendo] = useState(false);
  const [mostrarModalEditarSala, setMostrarModalEditarSala] = useState(false);
  const [salaEditandoId, setSalaEditandoId] = useState("");
  const [nombreSalaEdit, setNombreSalaEdit] = useState("");
  const [materiaSalaEdit, setMateriaSalaEdit] = useState("");
  const [mostrarConfirmarEliminar, setMostrarConfirmarEliminar] = useState(false);
  const [salaEliminandoId, setSalaEliminandoId] = useState("");
  const [mostrarModalEntrarSala, setMostrarModalEntrarSala] = useState(false);
  const [salaEntrandoId, setSalaEntrandoId] = useState("");
  const [salaEntrandoNombre, setSalaEntrandoNombre] = useState("");
  const [errorIdSala, setErrorIdSala] = useState(false);
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
      mostrarAviso("ID copiado", "exito");
    } catch {
      mostrarAviso("No se pudo copiar el ID", "info");
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

  const guardarNombreSala = async () => {
    if (!perfil || !nombreSalaEdit.trim() || !salaEditandoId) return;
    try {
      await actualizarSala(salaEditandoId, nombreSalaEdit.trim());
      if (materiaSalaEdit.trim()) {
        guardarMateria(perfil.uid, salaEditandoId, materiaSalaEdit.trim());
      }
      setMostrarModalEditarSala(false);
      setSalaEditandoId("");
      setNombreSalaEdit("");
      setMateriaSalaEdit("");
      reintentar();
    } catch {
      // Error manejado por peticion (ApiError)
    }
  };

  const eliminarSalaConfirmada = async () => {
    if (!salaEliminandoId) return;
    try {
      await eliminarSala(salaEliminandoId);
      setMostrarConfirmarEliminar(false);
      setSalaEliminandoId("");
    } catch {
      // Error manejado por peticion (ApiError)
    }
  };

  const confirmarEntrarSala = () => {
    setMostrarModalEntrarSala(false);
    if (salaEntrandoId) {
      navegar(`/salas/${encodeURIComponent(salaEntrandoId)}`);
    }
  };

  return (
    <main className="page-container">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-primary">Mis salas</h1>
          <p className="mt-2 text-text-muted">
            Administre sus espacios colaborativos o acceda a salas de estudio en curso.
          </p>
        </div>
        {mostrarCrearSalaArriba && (
          <>
            <Boton
              variante="neutral"
              onClick={() => {
                setIdSala("");
                setMostrarModalUnirSala(true);
              }}
            >
              Unirme con un ID
            </Boton>
            <Link
              to="/salas/nueva"
              state={{ backgroundLocation: location }}
              className="btn btn-primary w-full shrink-0 whitespace-nowrap sm:w-auto ml-3 sm:ml-0"
            >
              <Plus aria-hidden="true" className="h-5 w-5" />
              Crear sala
            </Link>
          </>
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

              return (
                <li
                  key={sala.id}
                  className="relative flex flex-col rounded-2xl border border-border-decor bg-white shadow-sm p-6 hover:shadow-md transition-shadow duration-200 ease-out"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-primary uppercase tracking-wide">{materia ?? "Sin asignar"}</p>
                        <h2 className="text-xl font-bold text-ink break-words">{sala.nombre}</h2>
                      </div>
                    </div>
                    <MenuOpciones
                      opciones={esPropietario
                        ? [
                            {
                              texto: "Editar sala",
                                onClick: () => {
                                  if (!perfil) return;
                                  setSalaEditandoId(sala.id);
                                  setNombreSalaEdit(sala.nombre);
                                  setMateriaSalaEdit(obtenerMateria(perfil.uid, sala.id) ?? "");
                                  setMostrarModalEditarSala(true);
                                },
                            },
                            {
                              texto: "Eliminar sala",
                              onClick: () => {
                                setSalaEliminandoId(sala.id);
                                setMostrarConfirmarEliminar(true);
                              },
                            },
                          ]
                        : []}
                    />
                  </div>

                  <div className="h-[1px] w-full bg-border-decor mb-4" />

                  <p className="mt-3 break-all flex items-center gap-2 text-sm text-text-muted">
                    <span>ID:</span>
                    <span className="flex-shrink-0 truncate max-w-[120px]">{sala.id}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void copiarId(sala.id);
                      }}
                      className="btn btn[data-modal-close] p-0 ml-1 hover:bg-surface-alt"
                      aria-label="Copiar ID"
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </p>

                  <div className="mt-auto pt-6 flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSalaEntrandoId(sala.id);
                        setSalaEntrandoNombre(sala.nombre);
                        setMostrarModalEntrarSala(true);
                      }}
                      className="btn-entrar-sala"
                    >
                      Entrar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modal: Unirse con un ID */}
      {mostrarModalUnirSala && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ink">Unirse con un ID</h3>
              <button
                onClick={() => setMostrarModalUnirSala(false)}
                className="text-text-muted hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-6 text-sm text-text-muted">
              Ingresa el ID de la sala a la que deseas unirte.
            </p>
            <Campo
              id="unir-sala-id"
              etiqueta="ID de la sala"
              obligatorio
              value={idSala}
              onChange={(e) => {
                setIdSala(e.target.value.trim());
                setErrorIdSala(false);
              }}
              placeholder="Introduce ID aquí"
              error={errorIdSala ? "Ingresa un ID válido." : null}
            />
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Boton variante="neutral" onClick={() => setMostrarModalUnirSala(false)}>
                Cancelar
              </Boton>
              <Boton
                variante="primary"
                disabled={idSala.length === 0 || uniendo}
                cargando={uniendo}
                textoCargando="Uniendo…"
                onClick={async () => {
                  if (idSala.length === 0) {
                    setErrorIdSala(true);
                    return;
                  }
                  setUniendo(true);
                  try {
                    await unirASala(idSala);
                    setErrorIdSala(false);
                    navegar(`/salas/${encodeURIComponent(idSala)}`);
                  } catch {
                    setErrorIdSala(true);
                  } finally {
                    setUniendo(false);
                  }
                }}
              >
                Unirme
              </Boton>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar nombre de sala */}
      {mostrarModalEditarSala && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ink">Editar sala</h3>
              <button
                onClick={() => setMostrarModalEditarSala(false)}
                className="text-text-muted hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-6 text-sm text-text-muted">
              Cambia el nombre y la materia o tema principal de la sala.
            </p>
            <Campo
              id="editar-sala-nombre"
              etiqueta="Nombre de la sala"
              obligatorio
              value={nombreSalaEdit}
              onChange={(e) => setNombreSalaEdit(e.target.value)}
              placeholder="Nombre de la sala"
            />
            <Campo
              id="editar-sala-materia"
              etiqueta="Materia o tema principal"
              obligatorio={false}
              value={materiaSalaEdit}
              onChange={(e) => setMateriaSalaEdit(e.target.value)}
              placeholder="Ej: Matemáticas, Física, Programación"
            />
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Boton variante="neutral" onClick={() => setMostrarModalEditarSala(false)}>
                Cancelar
              </Boton>
              <Boton
                variante="primary"
                disabled={!nombreSalaEdit.trim()}
                onClick={guardarNombreSala}
              >
                Guardar cambios
              </Boton>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar eliminación de sala */}
      {mostrarConfirmarEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ink">Eliminar sala</h3>
              <button
                onClick={() => setMostrarConfirmarEliminar(false)}
                className="text-text-muted hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-6 text-sm text-text-muted">
              ¿Estás seguro de que quieres eliminar esta sala? Esta acción no se puede deshacer.
            </p>
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Boton variante="neutral" onClick={() => setMostrarConfirmarEliminar(false)}>
                Cancelar
              </Boton>
              <Boton
                variante="danger"
                onClick={eliminarSalaConfirmada}
              >
                Eliminar sala
              </Boton>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar entrada a sala */}
      {mostrarModalEntrarSala && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ink">Entrar a la sala</h3>
              <button
                onClick={() => setMostrarModalEntrarSala(false)}
                className="text-text-muted hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-6 text-sm text-text-muted">
              Vas a entrar a la sala{" "}
              <span className="font-semibold text-ink">{salaEntrandoNombre}</span>
            </p>
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Boton variante="neutral" onClick={() => setMostrarModalEntrarSala(false)}>
                Cancelar
              </Boton>
              <Boton variante="primary" onClick={confirmarEntrarSala}>
                Entrar
              </Boton>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
