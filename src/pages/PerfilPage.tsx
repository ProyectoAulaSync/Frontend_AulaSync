import { Pencil, Mail } from "lucide-react";
import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";
import Boton from "../components/Boton";
import Campo from "../components/Campo";
import Cargando from "../components/Cargando";
import EstadoError from "../components/EstadoError";
import Mensaje from "../components/Mensaje";
import ModalConfirmacion from "../components/ModalConfirmacion";
import SelectorAvatar from "../components/SelectorAvatar";
import { useAuth } from "../hooks/useAuth";
import { useDisponibilidadUsuario } from "../hooks/useDisponibilidadUsuario";
import { usePageTitle } from "../hooks/usePageTitle";
import { useToast } from "../hooks/useToast";
import { AVATAR_INICIALES } from "../lib/avatares";
import {
  validarApellidos,
  validarAvatar,
  validarNombreDeUsuario,
  validarNombres,
} from "../lib/validaciones";
import { cerrarSesion } from "../services/auth";
import { actualizarMiPerfil, ApiError, eliminarMiCuenta, type CambiosPerfil, type PerfilUsuario } from "../services/api";

type CampoPerfil = "nombres" | "apellidos" | "username";
type CampoErrorPerfil = CampoPerfil | "avatar";
type ValoresPerfil = Record<CampoPerfil, string> & { avatar: string };
type ErroresPerfil = Partial<Record<CampoErrorPerfil, string>>;
type CamposTocados = Record<CampoErrorPerfil, boolean>;

const sinErrores: CamposTocados = { nombres: false, apellidos: false, username: false, avatar: false };
const valorVacio: ValoresPerfil = { nombres: "", apellidos: "", username: "", avatar: AVATAR_INICIALES };
const ERROR_USERNAME = "Ese nombre de usuario ya está en uso. Prueba con otro.";

function valoresDesdePerfil(perfil: PerfilUsuario): ValoresPerfil {
  return {
    nombres: perfil.nombres,
    apellidos: perfil.apellidos,
    username: perfil.username ?? "",
    avatar: perfil.avatar ?? AVATAR_INICIALES,
  };
}

function cambiosDesdePerfil(perfil: PerfilUsuario, valores: ValoresPerfil): CambiosPerfil {
  const cambios: CambiosPerfil = {};
  const nombres = valores.nombres.trim();
  const apellidos = valores.apellidos.trim();
  const username = valores.username.trim();

  if (nombres !== perfil.nombres) cambios.nombres = nombres;
  if (apellidos !== perfil.apellidos) cambios.apellidos = apellidos;
  if (username !== perfil.username) cambios.username = username;
  if (valores.avatar !== (perfil.avatar ?? AVATAR_INICIALES)) cambios.avatar = valores.avatar;
  return cambios;
}

function nombreCampoPerfil(campo: string): CampoErrorPerfil | null {
  const nombre = campo.split(".").at(-1);
  return nombre === "nombres" || nombre === "apellidos" || nombre === "username" || nombre === "avatar"
    ? nombre
    : null;
}

function erroresDeApi(error: ApiError): ErroresPerfil {
  const errores: ErroresPerfil = {};
  if (error.field) {
    const campo = nombreCampoPerfil(error.field);
    if (campo) errores[campo] = error.message;
  }
  for (const { field, message } of error.fields) {
    const campo = nombreCampoPerfil(field);
    if (campo) errores[campo] = message;
  }
  if (error.code === "USERNAME_TAKEN") errores.username = ERROR_USERNAME;
  return errores;
}

export default function PerfilPage() {
  usePageTitle("Mi perfil");
  const { estado, perfil, establecerPerfil, reintentar } = useAuth();
  const navegar = useNavigate();
  const { mostrarAviso } = useToast();
  const [valores, setValores] = useState<ValoresPerfil>(() => (perfil ? valoresDesdePerfil(perfil) : valorVacio));
  const [tocados, setTocados] = useState<CamposTocados>(sinErrores);
  const [erroresApi, setErroresApi] = useState<ErroresPerfil>({});
  const [fallo, setFallo] = useState<string | null>(null);
  const [perfilIncompleto, setPerfilIncompleto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [avisoGuardado, setAvisoGuardado] = useState("");
  const [editando, setEditando] = useState(false);
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false);
  const [errorEliminacion, setErrorEliminacion] = useState<string | null>(null);
  const primerCampoRef = useRef<HTMLInputElement>(null);
  const edicionAnterior = useRef(false);

  useEffect(() => {
    if (editando) {
      primerCampoRef.current?.focus();
    } else if (edicionAnterior.current) {
      document.getElementById("editar-perfil")?.focus();
    }
    edicionAnterior.current = editando;
  }, [editando]);

  const usernameOriginal = perfil?.username ?? "";
  const usernameSinCambios = valores.username.trim() === usernameOriginal;
  const disponibilidad = useDisponibilidadUsuario(usernameSinCambios ? "" : valores.username);
  const cambios = perfil ? cambiosDesdePerfil(perfil, valores) : {};
  const nombreUsuarioError = validarNombreDeUsuario(valores.username);
  const validaciones = {
    nombres: validarNombres(valores.nombres),
    apellidos: validarApellidos(valores.apellidos),
    username: nombreUsuarioError,
    avatar: perfil && valores.avatar !== (perfil.avatar ?? AVATAR_INICIALES) ? validarAvatar(valores.avatar) : null,
  };
  const errorDisponibilidad = !usernameSinCambios && disponibilidad === "ocupado" ? ERROR_USERNAME : null;
  const sinErroresDeValidacion =
    Object.values(validaciones).every((error) => error === null) &&
    !errorDisponibilidad &&
    (usernameSinCambios || disponibilidad !== "verificando");
  const hayCambios = Object.keys(cambios).length > 0;
  const puedeGuardar =
    hayCambios &&
    sinErroresDeValidacion &&
    Object.keys(erroresApi).length === 0 &&
    !guardando;

  function cambiarCampo(campo: keyof ValoresPerfil, valor: string) {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }));
    setErroresApi((anteriores) => {
      const siguientes = { ...anteriores };
      delete siguientes[campo];
      return siguientes;
    });
    setFallo(null);
    setPerfilIncompleto(false);
    setAvisoGuardado("");
  }

  function tocarCampo(campo: keyof CamposTocados) {
    setTocados((anteriores) => ({ ...anteriores, [campo]: true }));
  }

  function iniciarEdicion() {
    if (!perfil) return;
    setConfirmarEliminacion(false);
    setValores(valoresDesdePerfil(perfil));
    setTocados(sinErrores);
    setErroresApi({});
    setFallo(null);
    setPerfilIncompleto(false);
    setAvisoGuardado("");
    setEditando(true);
  }

  function abrirConfirmacionEliminacion() {
    setErrorEliminacion(null);
    setConfirmarEliminacion(true);
  }

  function cerrarConfirmacionEliminacion() {
    if (eliminandoCuenta) return;
    setErrorEliminacion(null);
    setConfirmarEliminacion(false);
  }

  function cancelar() {
    if (!perfil) return;
    setValores(valoresDesdePerfil(perfil));
    setTocados(sinErrores);
    setErroresApi({});
    setFallo(null);
    setPerfilIncompleto(false);
    setAvisoGuardado("");
    setEditando(false);
  }

  async function guardar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setTocados({ nombres: true, apellidos: true, username: true, avatar: true });
    if (!perfil || !puedeGuardar) return;

    setGuardando(true);
    setFallo(null);
    setPerfilIncompleto(false);
    setAvisoGuardado("");
    try {
      const perfilActualizado = await actualizarMiPerfil(cambios);
      establecerPerfil(perfilActualizado);
      setValores(valoresDesdePerfil(perfilActualizado));
      setErroresApi({});
      setTocados(sinErrores);
      setAvisoGuardado("Cambios guardados");
      setEditando(false);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === "TIMEOUT") {
          setFallo("El servidor tardó demasiado en responder. Inténtalo de nuevo.");
          setErroresApi({});
        } else if (error.code === "PROFILE_INCOMPLETE") {
          setPerfilIncompleto(true);
          setErroresApi({});
        } else {
          const errores = erroresDeApi(error);
          setErroresApi(errores);
          setFallo(Object.keys(errores).length ? null : "No pudimos guardar tus cambios. Inténtalo de nuevo.");
        }
      } else {
        setFallo("No pudimos guardar tus cambios. Inténtalo de nuevo.");
      }
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarCuenta() {
    setEliminandoCuenta(true);
    setErrorEliminacion(null);
    try {
      await eliminarMiCuenta();
    } catch {
      setErrorEliminacion("No pudimos eliminar tu cuenta. Inténtalo de nuevo.");
      setEliminandoCuenta(false);
      return;
    }

    navegar("/");
    setConfirmarEliminacion(false);
    await cerrarSesion().catch(() => undefined);
    mostrarAviso("Tu cuenta fue eliminada.");
    setEliminandoCuenta(false);
  }

  if (estado === "cargando") return <Cargando texto="Cargando tu perfil…" />;
  if (estado === "error") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <EstadoError
          titulo="No pudimos cargar tu perfil"
          texto="Revisa tu conexión e inténtalo de nuevo."
          onReintentar={reintentar}
        />
      </div>
    );
  }
  if (!perfil) return <Cargando />;

  const erroresVisibles = {
    nombres: erroresApi.nombres ?? (tocados.nombres ? validaciones.nombres : null),
    apellidos: erroresApi.apellidos ?? (tocados.apellidos ? validaciones.apellidos : null),
    username: erroresApi.username ?? (tocados.username ? validaciones.username ?? errorDisponibilidad : null),
    avatar: erroresApi.avatar ?? (tocados.avatar ? validaciones.avatar : null),
  };
  const usuarioDisponible =
    !usernameSinCambios && !erroresVisibles.username && !nombreUsuarioError && disponibilidad === "disponible"
      ? "Nombre de usuario disponible."
      : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-heading text-sm font-semibold text-primary">Cuenta</p>
          <h1 className="mt-1">Mi perfil</h1>
          <p className="mt-2 text-text-muted">Administra tu información personal.</p>
        </div>
        {!editando && (
          <Boton id="editar-perfil" variante="neutral" onClick={iniciarEdicion} icono={<Pencil aria-hidden="true" className="h-4 w-4" />}>
            Editar perfil
          </Boton>
        )}
      </header>

      <p aria-live="polite" className="mb-4 min-h-6 font-medium text-success">{avisoGuardado}</p>

      <article className="rounded-xl border border-border-decor bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <Avatar avatar={perfil.avatar} nombres={perfil.nombres} apellidos={perfil.apellidos} tamano={100} />
          <div>
            <p className="font-heading text-2xl font-semibold">{perfil.nombres} {perfil.apellidos}</p>
            <p className="mt-1 text-text-muted">@{perfil.username ?? "Sin nombre de usuario"}</p>
          </div>
        </div>

        <section aria-labelledby="titulo-informacion-personal" className="mt-8 border-t border-border-decor pt-6">
          <h2 id="titulo-informacion-personal" className="mb-5 font-heading text-sm font-bold uppercase tracking-wide text-text-muted">
            Información personal
          </h2>

          {fallo && <div className="mb-5"><Mensaje tipo="error" titulo={fallo} /></div>}
          {perfilIncompleto && (
            <div className="mb-5">
              <Mensaje tipo="error" titulo="Tu perfil está incompleto">
                Completa los datos obligatorios del perfil e inténtalo de nuevo.
              </Mensaje>
            </div>
          )}

          {editando ? (
            <form onSubmit={guardar} noValidate className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Campo
                  id="perfil-nombres"
                  ref={primerCampoRef}
                  etiqueta="Nombres"
                  obligatorio
                  autoComplete="given-name"
                  value={valores.nombres}
                  onChange={(evento) => cambiarCampo("nombres", evento.target.value)}
                  onBlur={() => tocarCampo("nombres")}
                  error={erroresVisibles.nombres}
                />
                <Campo
                  id="perfil-apellidos"
                  etiqueta="Apellidos"
                  obligatorio
                  autoComplete="family-name"
                  value={valores.apellidos}
                  onChange={(evento) => cambiarCampo("apellidos", evento.target.value)}
                  onBlur={() => tocarCampo("apellidos")}
                  error={erroresVisibles.apellidos}
                />
                <Campo
                  id="perfil-username"
                  etiqueta="Nombre de usuario"
                  obligatorio
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  ayuda="De 3 a 20 caracteres: letras, números y guion bajo."
                  value={valores.username}
                  onChange={(evento) => cambiarCampo("username", evento.target.value)}
                  onBlur={() => tocarCampo("username")}
                  error={erroresVisibles.username}
                  exito={usuarioDisponible}
                />
                <div>
                  <p className="mb-1 text-sm font-medium">Correo electrónico</p>
                  <div className="flex min-h-11 items-center gap-2 rounded-lg border border-border-decor bg-surface-alt px-4 py-2 text-ink">
                    <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-text-muted" />
                    <span className="break-all">{perfil.email}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-text-muted">El correo no se puede editar.</p>
                </div>
              </div>

              <div onBlur={() => tocarCampo("avatar")}>
                <SelectorAvatar
                  valor={valores.avatar}
                  onCambio={(avatar) => cambiarCampo("avatar", avatar)}
                  nombres={valores.nombres}
                  apellidos={valores.apellidos}
                />
                {erroresVisibles.avatar && <p role="alert" className="mt-2 text-sm text-error">{erroresVisibles.avatar}</p>}
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Boton variante="neutral" onClick={cancelar} disabled={guardando}>
                  Cancelar
                </Boton>
                <Boton type="submit" cargando={guardando} textoCargando="Guardando…" disabled={!puedeGuardar}>
                  Guardar cambios
                </Boton>
              </div>
            </form>
          ) : (
            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="mb-1 text-sm font-medium">Nombre completo</dt>
                <dd className="min-h-11 rounded-lg border border-border-decor bg-surface-alt px-4 py-2">
                  {perfil.nombres} {perfil.apellidos}
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-sm font-medium">Nombre de usuario</dt>
                <dd className="min-h-11 rounded-lg border border-border-decor bg-surface-alt px-4 py-2">
                  @{perfil.username ?? "Sin nombre de usuario"}
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-sm font-medium">Correo electrónico</dt>
                <dd className="min-h-11 rounded-lg border border-border-decor bg-surface-alt px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-text-muted" />
                    <span className="break-all">{perfil.email}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-text-muted">El correo no se puede editar.</p>
                </dd>
              </div>
            </dl>
          )}
        </section>

        {!editando && (
          <section aria-labelledby="titulo-eliminar-cuenta" className="mt-8 border-t border-border-decor pt-6">
            <h2 id="titulo-eliminar-cuenta" className="text-lg">Eliminar cuenta</h2>
            <p className="mt-1 text-sm text-text-muted">
              Esta acción eliminará tu cuenta y los datos asociados. No se puede deshacer.
            </p>
            <div className="mt-4">
              <Boton variante="danger" onClick={abrirConfirmacionEliminacion}>
                Eliminar cuenta
              </Boton>
            </div>
          </section>
        )}
      </article>
      <ModalConfirmacion
        abierto={confirmarEliminacion}
        titulo="¿Eliminar tu cuenta?"
        descripcion="Se eliminarán tu cuenta y los datos asociados. Esta acción no se puede deshacer."
        error={errorEliminacion}
        textoConfirmar="Eliminar cuenta"
        textoConfirmando="Eliminando…"
        confirmando={eliminandoCuenta}
        onCerrar={cerrarConfirmacionEliminacion}
        onConfirmar={() => void eliminarCuenta()}
      />
    </div>
  );
}
