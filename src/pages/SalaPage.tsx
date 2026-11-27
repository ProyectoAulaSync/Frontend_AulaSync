import { useParams, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Boton from "../components/Boton";
import Campo from "../components/Campo";
import Cargando from "../components/Cargando";
import { CircleAlert, CircleCheck, Info, Home, User, LogOut, X, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { esAnfitrion } from "../lib/salas";
import { conectar, desconectar } from "../services/realtime";
import { obtenerSala, actualizarSala, eliminarSala } from "../services/salas";
import { obtenerHistorialMensajes } from "../services/api";
import type { Sala } from "../types/sala";
import { usePageTitle } from "../hooks/usePageTitle";
import EstadoVacio from "../components/EstadoVacio";

type Mensaje = {
  id: string;
  nombre: string;
  hora: string;
  texto: string;
};

type ChatEstado =
  | { tipo: "cargando" }
  | { tipo: "activo"; mensajes: Mensaje[] }
  | { tipo: "error"; mensaje: string; mensajes: Mensaje[] }
  | { tipo: "reconexion" }
  | { tipo: "mensajes-vacios" };

type EstadoSala =
  | { tipo: "cargando" }
  | { tipo: "error"; id: string; noEncontrada: boolean }
  | { tipo: "lista"; id: string; sala: Sala; materia: string | null };

function formatearHora(fecha: Date): string {
  const horas = fecha.getHours().toString().padStart(2, "0");
  const minutos = fecha.getMinutes().toString().padStart(2, "0");
  return `${horas}:${minutos}`;
}

export default function SalaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { perfil } = useAuth();
  const uidPerfil = perfil?.uid;
  const [estadoSala, setEstadoSala] = useState<EstadoSala>({ tipo: "cargando" });
  const [chat, setChat] = useState<ChatEstado>({ tipo: "cargando" });
  const [socket, setSocket] = useState<any>(null);
  const [textoMensaje, setTextoMensaje] = useState("");
  const [nombreEdit, setNombreEdit] = useState("");
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [editando, setEditando] = useState(false);
  const mensajesRef = useRef<Mensaje[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  usePageTitle("Sala");

  useEffect(() => {
    if (!id) return;

    const controlador = new AbortController();
    obtenerSala(id, controlador.signal)
      .then((sala) => {
        setEstadoSala({
          tipo: "lista",
          id,
          sala,
          materia: uidPerfil ? sala.nombre : null,
        });
        setNombreEdit(sala.nombre);
      })
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return;
        setEstadoSala({
          tipo: "error",
          id,
          noEncontrada: error instanceof Error && error.message === "Not found",
        });
      });
    return () => {
      controlador.abort();
      desconectar();
      setSocket(null);
    };
  }, [id, uidPerfil]);

  useEffect(() => {
    if (estadoSala.tipo !== "lista" || !estadoSala.sala) return;

    obtenerHistorialMensajes(id!).then((mensajesBackend) => {
      const mensajes: Mensaje[] = mensajesBackend.map((m) => ({
        id: m.id,
        nombre: m.autorNombre,
        hora: formatearHora(new Date(m.creadoEn)),
        texto: m.texto,
      }));
      setChat({ tipo: "activo", mensajes });
    });
  }, [estadoSala.tipo, estadoSala.tipo === "lista" ? estadoSala.sala.id : undefined]);

  useEffect(() => {
    if (estadoSala.tipo !== "lista" || !estadoSala.sala) return;

    const socketInstance = conectar() as any;
    setSocket(socketInstance);

    socketInstance.on("mensaje-nuevo", (mensaje: any) => {
      setChat((prev) => {
        if (prev.tipo !== "activo") return prev;
        const actualizado = [...prev.mensajes, mensaje];
        mensajesRef.current = actualizado;
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: "instant",
          });
        }
        return { tipo: "activo", mensajes: actualizado };
      });
    });

    socketInstance.on("usuario-conectado", (nombre: string) => {
      setChat((prev) => {
        if (prev.tipo !== "activo") return prev;
        const aviso: Mensaje = {
          id: Date.now().toString(),
          nombre,
          hora: formatearHora(new Date()),
          texto: "se unió a la sala",
        };
        const actualizado = [...prev.mensajes, aviso];
        mensajesRef.current = actualizado;
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: "instant",
          });
        }
        return { tipo: "activo", mensajes: actualizado };
      });
    });

    socketInstance.on("usuario-desconectado", (nombre: string) => {
      setChat((prev) => {
        if (prev.tipo !== "activo") return prev;
        const aviso: Mensaje = {
          id: Date.now().toString(),
          nombre,
          hora: formatearHora(new Date()),
          texto: "salió de la sala",
        };
        const actualizado = [...prev.mensajes, aviso];
        mensajesRef.current = actualizado;
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: "instant",
          });
        }
        return { tipo: "activo", mensajes: actualizado };
      });
    });

    socketInstance.on("reconexion exitosa", () => {
      setChat({ tipo: "activo", mensajes: mensajesRef.current });
    });

    socketInstance.on("error-conexion", (err: string) => {
      setChat((prev) => {
        if (prev.tipo === "activo") {
          return { tipo: "error", mensaje: err, mensajes: prev.mensajes };
        }
        if (prev.tipo === "error") {
          return { tipo: "error", mensaje: err, mensajes: prev.mensajes };
        }
        return prev;
      });
    });

    return () => {
      socketInstance.off("mensaje-nuevo");
      socketInstance.off("usuario-conectado");
      socketInstance.off("usuario-desconectado");
      socketInstance.off("reconexion exitosa");
      socketInstance.off("error-conexion");
    };
  }, [socket]);

  useEffect(() => {
    if (chat.tipo === "activo") {
      if (chat.mensajes.length === 0) {
        setChat({ tipo: "activo", mensajes: chat.mensajes });
      }
    }
  }, [chat.tipo, chat.tipo === "activo" ? chat.mensajes.length : 0]);

  if (chat.tipo === "cargando") {
    return <Cargando texto="Cargando el chat…" />;
  }

  if (chat.tipo === "error") {
    return (
      <div className="mx-auto max-w-sm p-6 text-center">
        <CircleAlert aria-hidden="true" className="mx-auto mb-4 h-12 w-12 text-error" />
        <h2 className="mb-2 text-xl">Error en el chat</h2>
        <p className="mb-6 text-text-muted">{chat.mensaje}</p>
        <Boton variante="neutral" onClick={() => setChat({ tipo: "cargando" })}>
          Reintentar
        </Boton>
      </div>
    );
  }

  if (chat.tipo === "reconexion") {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center px-4 py-12">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <span className="motion-safe:animate-[spin_1.8s_linear_infinite] absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary motion-reduce:hidden" />
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-tint">
            <CircleCheck className="h-8 w-8 text-primary" />
          </span>
        </div>
        <p role="status" aria-live="polite" className="mt-4 font-heading font-semibold text-ink">
          Reconectando…
        </p>
      </div>
    );
  }

  if (chat.tipo === "mensajes-vacios") {
    return <EstadoVacio icono={<Info className="h-12 w-12 text-primary" />} titulo="Sin mensajes" texto="Aún no hay mensajes en esta sala. Sé el primero en escribir!" />;
  }

  const sala = estadoSala.tipo === "lista" ? estadoSala.sala : null;

  const abrirModalEdicion = () => {
    setNombreEdit(sala?.nombre ?? "");
    setMostrarModalEdicion(true);
  };

  const manejarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textoMensaje.trim() || chat.tipo !== "activo") return;
    const mensaje: Mensaje = {
      id: Date.now().toString(),
      nombre: perfil?.nombres ?? "Anónimo",
      hora: formatearHora(new Date()),
      texto: textoMensaje,
    };
    setChat((prev) => {
      if (prev.tipo !== "activo") return prev;
      const actualizado = [...prev.mensajes, mensaje];
      mensajesRef.current = actualizado;
      setTextoMensaje("");
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: "instant",
        });
      }
      return { tipo: "activo", mensajes: actualizado };
    });
  };

  const guardarNombre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreEdit.trim() || !sala) return;
    setEditando(true);
    try {
      const actualizada = await actualizarSala(sala.id, nombreEdit.trim());
      setEstadoSala((prev) => ({
        ...prev,
        tipo: "lista" as const,
        id: actualizada.id,
        sala: actualizada,
        materia: uidPerfil ? actualizada.nombre : null,
      }));
      setMostrarModalEdicion(false);
    } catch {
      // Error handled by toast or could show inline error
    } finally {
      setEditando(false);
    }
  };

  const eliminarSalaConfirmada = async () => {
    if (!sala) return;
    setEliminando(true);
    try {
      await eliminarSala(sala.id);
      // Redirect to panel after deletion
      window.location.href = "/panel";
    } catch {
      // Error handled
    } finally {
      setEliminando(false);
      setMostrarConfirmacionEliminar(false);
    }
  };

  const salirDeSala = () => {
    if (socket) {
      desconectar();
      setSocket(null);
    }
    navigate("/panel");
  };

  return (
    <>
      {/* Modal de edición de nombre */}
      {mostrarModalEdicion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ink">Editar nombre de la sala</h3>
              <button
                onClick={() => setMostrarModalEdicion(false)}
                className="text-text-muted hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={guardarNombre} className="space-y-3">
              <Campo
                id="nombre-sala"
                etiqueta="Nombre de la sala"
                obligatorio
                value={nombreEdit}
                onChange={(e) => setNombreEdit(e.target.value)}
                placeholder="Nombre de la sala"
              />
              <div className="flex flex-row-reverse gap-2">
                <Boton variante="neutral" onClick={() => setMostrarModalEdicion(false)}>
                  Cancelar
                </Boton>
                <Boton variante="primary" disabled={editando || !nombreEdit.trim()}>
                  {editando ? "Guardando…" : "Guardar cambios"}
                </Boton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {mostrarConfirmacionEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ink">Eliminar sala</h3>
              <button
                onClick={() => setMostrarConfirmacionEliminar(false)}
                className="text-text-muted hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-text-muted mb-6">
              ¿Estás seguro de que quieres eliminar esta sala? Esta acción no se puede deshacer.
            </p>
            <div className="flex flex-row-reverse gap-2">
              <Boton variante="neutral" onClick={() => setMostrarConfirmacionEliminar(false)}>
                Cancelar
              </Boton>
              <Boton variante="danger" disabled={eliminando} onClick={eliminarSalaConfirmada}>
                {eliminando ? "Eliminando…" : "Eliminar sala"}
              </Boton>
            </div>
          </div>
        </div>
        )}

      {/* Layout contenedor principal: centrado y responsivo */}
      <div className="relative min-h-screen w-full bg-[#F8FAFC]">

        {/* Sidebar izquierda (fija en desktop, colapsada en móvil) */}
        <aside className="fixed inset-y-0 left-0 z-20 w-57 h-full bg-white border-r border-[#E2E8F0] flex flex-col lg:hidden hidden lg:flex">
          <div className="flex-none px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-lg">
                <Home className="h-4 w-4" />
              </div>
              <h1 className="font-bold text-ink text-xl">AulaSync</h1>
            </div>
          </div>
          <div className="flex-none h-[1px] bg-[#E2E8F0] mx-6 my-3" />
          <div className="flex-none px-6">
            <span className="block text-[10px] uppercase tracking-wider text-text-muted font-medium mb-4">
              MENÚ PRINCIPAL
            </span>
          </div>
          <nav className="flex-none px-6 space-y-1">
            <a
              href="#"
              className="flex items-center gap-3 h-[34px] rounded-lg bg-primary-tint text-primary font-semibold px-3"
            >
              <Home className="h-4 w-4" />
              <span className="text-sm">Mis salas</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 h-[34px] rounded-lg text-text-muted hover:bg-[#F1F5F9] hover:text-ink px-3 transition-colors"
            >
              <User className="h-4 w-4" />
              <span className="text-sm">Mi perfil</span>
            </a>
          </nav>
          <div className="flex-1" />
          <div className="flex-none px-6 pt-4 pb-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-tint flex items-center justify-center text-primary">
                <span className="text-xs font-bold">MG</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-ink">María González</span>
                <span className="text-[10px] text-text-muted">Estudiante</span>
              </div>
              <span className="ml-auto text-text-muted">&gt;</span>
            </div>
          </div>
          <div className="flex-none px-6 pt-2 pb-6">
            <button className="flex items-center gap-2 w-full h-[34px] rounded-lg px-3 text-text-muted hover:bg-[#F1F5F9] hover:text-ink transition-colors">
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* Área de contenido principal (derecha) - centrado y responsivo */}
        <main className="flex-none pl-[228px] min-h-screen w-full max-w-full mx-auto px-4 lg:px-0 lg:pl-[228px]">
          <div className="max-w-[1300px] mx-auto">
            {/* Encabezado de la sala */}
            <header className="flex-none pt-8 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Link to="/panel" className="flex items-center gap-1 text-[12px] font-medium text-ink hover:text-primary">
                  <span className="text-[10px]">‹</span>
                  <span>Mis salas</span>
                </Link>
              </div>
              <h1 className="text-[28px] font-bold text-ink mb-1">{estadoSala.tipo === "lista" ? estadoSala.sala?.nombre ?? "Sala" : "Sala"}</h1>
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                <span>3 personas conectadas · ID {estadoSala.tipo === "lista" ? estadoSala.sala?.id : ""}</span>
              </div>
            </header>

            {/* Línea divisoria */}
            <div className="flex-none h-[1px] bg-[#E2E8F0] mb-6" />

            {/* Contenido: dos columnas en desktop, apiladas en móvil */}
            <div className="grid grid-cols-1 lg:grid-cols-[665px_265px] gap-[18px]">
              {/* Columna izquierda: Chat */}
              <div className="flex flex-col h-[calc(100vh-176px)] lg:h-auto min-h-[500px]">
                <section className="flex-none rounded-lg border border-[#E2E8F0] bg-white p-0 shadow-sm flex flex-col h-full">
                  <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-ink">Chat de la sala</h2>
                      <p className="text-[11px] text-text-muted mt-0.5">Conversación visible para todos</p>
                    </div>
                  </div>

                  <div ref={messagesContainerRef} className="flex-none h-[430px] lg:h-[60vh] overflow-y-auto p-6" role="status" aria-live="polite">
                    {chat.tipo === "activo" && chat.mensajes.length > 0 && chat.mensajes.map((m) => (
                      <div key={m.id} className={`mb-3 flex flex-col ${m.nombre === (perfil?.nombres ?? "") ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`flex items-baseline gap-1 ${m.nombre === (perfil?.nombres ?? "") ? "justify-end text-right" : "justify-start text-left"} mb-0.5`}>
                          <span className={`text-[10px] font-semibold ${m.nombre === (perfil?.nombres ?? "") ? "text-ink" : "text-text-muted"}`}>
                            {m.nombre === (perfil?.nombres ?? "") ? "Tú" : m.nombre}
                          </span>
                          <span className="text-[10px] text-text-muted">{m.hora}</span>
                        </div>
                        <p className={`max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap break-words ${m.nombre === (perfil?.nombres ?? "") ? "bg-primary text-white" : "bg-[#F1F4F8] text-text-muted"}`}>
                          {m.texto}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex-none border-t border-[#E2E8F0] p-6">
                    <form
                      onSubmit={manejarEdicion}
                      className="flex items-end gap-2"
                      aria-label="Enviar mensaje"
                    >
                      <Campo
                        id="mensaje"
                        etiqueta=""
                        obligatorio={false}
                        value={textoMensaje}
                        onChange={(e) => setTextoMensaje(e.target.value)}
                        placeholder="Escribe un mensaje"
                        disabled={chat.tipo !== "activo"}
                        etiquetaOculta
                      />
                      <Boton
                        variante="primary"
                        disabled={chat.tipo !== "activo" || !textoMensaje.trim()}
                      >
                        <span className="flex items-center gap-1">
                          <span className="h-4 w-4">✈</span>
                          <span>Enviar</span>
                        </span>
                      </Boton>
                    </form>
                    <p className="text-[11px] text-text-muted mt-2">Presiona Enter para enviar.</p>
                  </div>
                </section>
              </div>

              {/* Columna derecha: tarjetas apiladas */}
              <div className="flex flex-col gap-[18px]">
                {/* 1) Participantes */}
                <section className="flex-none rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-ink">Participantes</h2>
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-tint flex items-center justify-center text-primary text-[10px] font-bold">
                      3
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { iniciales: "MG", nombre: "María González", rol: "Anfitriona" },
                      { iniciales: "DC", nombre: "Daniel Cruz", rol: "Participante" },
                      { iniciales: "JL", nombre: "Juan López", rol: "Participante" },
                    ].map((p) => (
                      <div key={p.iniciales} className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[10px] font-bold text-text-muted">
                          {p.iniciales}
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-ink truncate">{p.nombre}</span>
                          <span className="text-[10px] text-text-muted truncate">{p.rol}</span>
                        </div>
                        <span className="flex-shrink-0 h-2 w-2 rounded-full bg-[#10B981]" />
                      </div>
                    ))}
                  </div>
                </section>

                {/* 2) Acciones del anfitrión (solo para el anfitrión) */}
                {uidPerfil && estadoSala.tipo === "lista" && estadoSala.sala && esAnfitrion(estadoSala.sala, uidPerfil) && (
                  <section className="flex-none rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col">
                    <div>
                      <h2 className="text-sm font-semibold text-ink">Acciones del anfitrión</h2>
                      <p className="text-[11px] text-text-muted mt-0.5">Solo tú puedes cambiar o eliminar esta sala.</p>
                    </div>
                    <div className="mt-4 flex flex-col gap-1.5">
                      <Boton variante="neutral" onClick={abrirModalEdicion}>
                        <span className="h-4 w-4"><Edit2 /></span>
                        <span>Editar nombre</span>
                      </Boton>
                      <Boton variante="neutral" onClick={() => setMostrarConfirmacionEliminar(true)}>
                        <span className="h-4 w-4"><Trash2 /></span>
                        <span>Eliminar sala</span>
                      </Boton>
                    </div>
                  </section>
                )}

                {/* 3) Salir de la sala */}
                <section className="flex-none rounded-lg border border-[#FBCFE8] bg-[#FFF1F2] p-6 shadow-sm flex flex-col">
                  <div>
                    <h2 className="text-sm font-semibold text-ink">Salir de la sala</h2>
                    <p className="text-[11px] text-text-muted mt-0.5">Podrás volver a entrar mientras la sala exista.</p>
                  </div>
                  <div className="mt-4">
                    <Boton variante="neutral" onClick={salirDeSala}>
                      <span className="h-4 w-4">↪</span>
                      <span>Salir de la sala</span>
                    </Boton>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>

        {/* Botón flotante de ayuda (esquina inferior derecha) */}
        <button
          className="fixed bottom-[32px] right-[32px] z-50 h-[32px] w-[32px] rounded-full bg-black flex items-center justify-center text-white text-xs font-bold shadow-lg hover:bg-[#666] transition-colors"
          aria-label="Ayuda"
        >
          <span className="text-[14px]">?</span>
        </button>
      </div>
    </>
  );
}