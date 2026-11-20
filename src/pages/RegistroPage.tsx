import { useState, type SubmitEvent } from "react";
import { Link } from "react-router-dom";
import Boton from "../components/Boton";
import BotonGoogle from "../components/BotonGoogle";
import Campo from "../components/Campo";
import CampoContrasena from "../components/CampoContrasena";
import Mensaje from "../components/Mensaje";
import SelectorAvatar from "../components/SelectorAvatar";
import TarjetaFormulario from "../components/TarjetaFormulario";
import { useAuth } from "../hooks/useAuth";
import { useDisponibilidadUsuario } from "../hooks/useDisponibilidadUsuario";
import { usePageTitle } from "../hooks/usePageTitle";
import { AVATAR_INICIALES } from "../lib/avatares";
import {
  validarApellidos,
  validarContrasenaNueva,
  validarCorreo,
  validarNombreDeUsuario,
  validarNombres,
} from "../lib/validaciones";
import { ApiError } from "../services/api";
import { continuarConGoogle, ErrorAuth, mensajeDeError, MENSAJES, registrarYEntrar } from "../services/auth";

type Campos = "nombres" | "apellidos" | "username" | "email" | "password";
const ORDEN: Campos[] = ["nombres", "apellidos", "username", "email", "password"];
const ID = (campo: Campos) => `registro-${campo}`;

type Fallo = { tipo: "error" | "info"; texto: string };

export default function RegistroPage() {
  usePageTitle("Crear cuenta");
  const { establecerPerfil } = useAuth();

  const [valores, setValores] = useState({ nombres: "", apellidos: "", username: "", email: "", password: "" });
  const [avatar, setAvatar] = useState(AVATAR_INICIALES);
  const [tocados, setTocados] = useState<Partial<Record<Campos, boolean>>>({});
  const [intentado, setIntentado] = useState(false);
  const [enviando, setEnviando] = useState<"cuenta" | "google" | null>(null);
  const [fallo, setFallo] = useState<Fallo | null>(null);
  // Errores que solo conoce el servidor (correo ya registrado, usuario ocupado…), ligados al valor que los causó.
  const [rechazados, setRechazados] = useState<Partial<Record<Campos, { valor: string; mensaje: string }>>>({});

  const disponibilidad = useDisponibilidadUsuario(valores.username);

  const errores: Record<Campos, string | null> = {
    nombres: validarNombres(valores.nombres),
    apellidos: validarApellidos(valores.apellidos),
    username: validarNombreDeUsuario(valores.username),
    email: validarCorreo(valores.email),
    password: validarContrasenaNueva(valores.password),
  };
  if (!errores.username && disponibilidad === "ocupado") {
    errores.username = "Ese nombre de usuario ya está en uso. Prueba con otro.";
  }

  function cambiar(campo: Campos, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }));
  }

  // El error se muestra al salir del campo o al enviar, y se actualiza en vivo mientras se corrige.
  function errorVisible(campo: Campos): string | null {
    const rechazo = rechazados[campo];
    if (rechazo && rechazo.valor === valores[campo]) return rechazo.mensaje;
    return tocados[campo] || intentado ? errores[campo] : null;
  }

  function tocar(campo: Campos) {
    setTocados((t) => ({ ...t, [campo]: true }));
  }

  function aplicarErrorDelServidor(error: ApiError) {
    const campo = error.field as Campos | undefined;
    if (error.code === "EMAIL_TAKEN") {
      setRechazados((r) => ({ ...r, email: { valor: valores.email, mensaje: "Este correo ya tiene una cuenta." } }));
      document.getElementById(ID("email"))?.focus();
    } else if (error.code === "USERNAME_TAKEN") {
      const mensaje = "Ese nombre de usuario ya está en uso. Prueba con otro.";
      setRechazados((r) => ({ ...r, username: { valor: valores.username, mensaje } }));
      document.getElementById(ID("username"))?.focus();
    } else if (error.code === "VALIDATION_ERROR" || (campo && ORDEN.includes(campo))) {
      const nuevos: typeof rechazados = {};
      for (const { field, message } of error.fields) {
        const clave = field as Campos;
        if (ORDEN.includes(clave)) nuevos[clave] = { valor: valores[clave], mensaje: message };
      }
      if (Object.keys(nuevos).length > 0) setRechazados((r) => ({ ...r, ...nuevos }));
      else setFallo({ tipo: "error", texto: MENSAJES.registroError });
    } else {
      setFallo({ tipo: "error", texto: MENSAJES.registroError });
    }
  }

  async function enviar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setIntentado(true);
    setFallo(null);

    // Con errores (incluido «usuario ocupado» o «correo ya registrado») no deja continuar.
    const primero = ORDEN.find((c) => errores[c] || (rechazados[c]?.valor === valores[c]));
    if (primero) {
      document.getElementById(ID(primero))?.focus();
      return;
    }

    setEnviando("cuenta");
    try {
      const perfil = await registrarYEntrar({
        nombres: valores.nombres.trim(),
        apellidos: valores.apellidos.trim(),
        username: valores.username.trim(),
        avatar,
        email: valores.email.trim(),
        password: valores.password,
      });
      // Al terminar entra a su Panel (RutaPublica lo lleva al tener el perfil).
      establecerPerfil(perfil);
    } catch (error) {
      if (error instanceof ApiError) aplicarErrorDelServidor(error);
      else setFallo({ tipo: "error", texto: mensajeDeError(error) });
    } finally {
      setEnviando(null);
    }
  }

  async function entrarConGoogle() {
    setFallo(null);
    setEnviando("google");
    try {
      establecerPerfil(await continuarConGoogle());
    } catch (error) {
      const tipo = error instanceof ErrorAuth && error.tipo === "cancelado" ? "info" : "error";
      setFallo({ tipo, texto: mensajeDeError(error) });
    } finally {
      setEnviando(null);
    }
  }

  const exitoUsuario = disponibilidad === "disponible" && !errorVisible("username") ? "Nombre de usuario disponible." : null;

  return (
    <TarjetaFormulario titulo="Crear cuenta">
      {fallo && <Mensaje tipo={fallo.tipo} titulo={fallo.texto} />}

      <form onSubmit={enviar} noValidate className={`space-y-5 ${fallo ? "mt-5" : ""}`}>
        <Campo
          id={ID("nombres")}
          etiqueta="Nombres"
          obligatorio
          autoComplete="given-name"
          placeholder="Ej: María Fernanda"
          value={valores.nombres}
          onChange={(e) => cambiar("nombres", e.target.value)}
          onBlur={() => tocar("nombres")}
          error={errorVisible("nombres")}
        />
        <Campo
          id={ID("apellidos")}
          etiqueta="Apellidos"
          obligatorio
          autoComplete="family-name"
          placeholder="Ej: Gómez Rojas"
          value={valores.apellidos}
          onChange={(e) => cambiar("apellidos", e.target.value)}
          onBlur={() => tocar("apellidos")}
          error={errorVisible("apellidos")}
        />
        <Campo
          id={ID("username")}
          etiqueta="Nombre de usuario"
          obligatorio
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          ayuda="De 3 a 20 caracteres: letras, números y guion bajo."
          value={valores.username}
          onChange={(e) => cambiar("username", e.target.value)}
          onBlur={() => tocar("username")}
          error={errorVisible("username")}
          exito={exitoUsuario}
        />

        <SelectorAvatar valor={avatar} onCambio={setAvatar} nombres={valores.nombres} apellidos={valores.apellidos} />

        <Campo
          id={ID("email")}
          etiqueta="Correo electrónico"
          obligatorio
          type="email"
          autoComplete="email"
          placeholder="Ej: nombre@correo.com"
          value={valores.email}
          onChange={(e) => cambiar("email", e.target.value)}
          onBlur={() => tocar("email")}
          error={
            errorVisible("email") &&
            (rechazados.email?.valor === valores.email ? (
              <span>
                {rechazados.email.mensaje} ¿Quieres <Link to="/ingreso">iniciar sesión</Link>?
              </span>
            ) : (
              errorVisible("email")
            ))
          }
        />
        <CampoContrasena
          id={ID("password")}
          etiqueta="Contraseña"
          obligatorio
          mostrarRequisitos
          resaltarPendientes={intentado}
          autoComplete="new-password"
          placeholder="Escribe tu contraseña"
          value={valores.password}
          onChange={(e) => cambiar("password", e.target.value)}
          onBlur={() => tocar("password")}
          error={errorVisible("password")}
        />

        <Boton type="submit" ancho cargando={enviando === "cuenta"} textoCargando="Creando cuenta…" disabled={enviando === "google"}>
          Crear cuenta
        </Boton>

        <div className="flex items-center gap-4 py-1" aria-hidden="true">
          <div className="flex-1 border-t border-border-decor" />
          <span className="text-sm text-text-subtle">o</span>
          <div className="flex-1 border-t border-border-decor" />
        </div>

        <BotonGoogle onClick={entrarConGoogle} cargando={enviando === "google"} deshabilitado={enviando === "cuenta"} />
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        ¿Ya tienes cuenta? <Link to="/ingreso">Iniciar sesión</Link>
      </p>
    </TarjetaFormulario>
  );
}
