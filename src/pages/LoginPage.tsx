import { useState, type SubmitEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import Boton from "../components/Boton";
import BotonGoogle from "../components/BotonGoogle";
import Campo from "../components/Campo";
import CampoContrasena from "../components/CampoContrasena";
import Mensaje from "../components/Mensaje";
import type { EstadoDeNavegacion } from "../components/RutaPrivada";
import TarjetaFormulario from "../components/TarjetaFormulario";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";
import { validarContrasenaDeIngreso, validarCorreo } from "../lib/validaciones";
import { obtenerMiPerfil } from "../services/api";
import { cerrarSesion, continuarConGoogle, ErrorAuth, iniciarSesionConCorreo, mensajeDeError } from "../services/auth";

type Fallo = { tipo: "error" | "info"; texto: string };

export default function LoginPage() {
  usePageTitle("Iniciar sesión");
  const { establecerPerfil } = useAuth();
  const aviso = (useLocation().state as EstadoDeNavegacion | null)?.aviso;

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [tocados, setTocados] = useState({ correo: false, contrasena: false });
  const [intentado, setIntentado] = useState(false);
  const [enviando, setEnviando] = useState<"correo" | "google" | null>(null);
  const [fallo, setFallo] = useState<Fallo | null>(null);

  const errorCorreo = validarCorreo(correo);
  const errorContrasena = validarContrasenaDeIngreso(contrasena);

  function mostrarFallo(error: unknown) {
    // Cancelar la ventana de Google no es un error: se avisa en tono neutro.
    const tipo = error instanceof ErrorAuth && error.tipo === "cancelado" ? "info" : "error";
    setFallo({ tipo, texto: mensajeDeError(error) });
  }

  async function enviar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setIntentado(true);
    setFallo(null);

    // Al enviar con errores, el foco pasa al primer campo con problema y lo escrito se conserva.
    const primero = errorCorreo ? "login-correo" : errorContrasena ? "login-contrasena" : null;
    if (primero) {
      document.getElementById(primero)?.focus();
      return;
    }

    setEnviando("correo");
    try {
      await iniciarSesionConCorreo(correo, contrasena);
      // Al tener el perfil, RutaPublica lleva a la vista pedida o al Panel.
      establecerPerfil(await obtenerMiPerfil());
    } catch (error) {
      await cerrarSesion().catch(() => undefined);
      mostrarFallo(error);
    } finally {
      setEnviando(null);
    }
  }

  async function entrarConGoogle() {
    setFallo(null);
    setEnviando("google");
    try {
      // Si falta el nombre de usuario, RutaPublica lleva a elegirlo antes de entrar.
      establecerPerfil(await continuarConGoogle());
    } catch (error) {
      mostrarFallo(error);
    } finally {
      setEnviando(null);
    }
  }

  return (
    <TarjetaFormulario titulo="Iniciar sesión">
      <div className="space-y-5">
        {aviso && <Mensaje tipo="info" titulo={aviso} />}
        {fallo && <Mensaje tipo={fallo.tipo} titulo={fallo.texto} />}
      </div>

      <form onSubmit={enviar} noValidate className="mt-5 space-y-4">
        <Campo
          id="login-correo"
          etiqueta="Correo electrónico"
          obligatorio
          type="email"
          autoComplete="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          onBlur={() => setTocados((t) => ({ ...t, correo: true }))}
          error={tocados.correo || intentado ? errorCorreo : null}
        />
        <CampoContrasena
          id="login-contrasena"
          etiqueta="Contraseña"
          obligatorio
          autoComplete="current-password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          onBlur={() => setTocados((t) => ({ ...t, contrasena: true }))}
          error={tocados.contrasena || intentado ? errorContrasena : null}
        />

        <Boton type="submit" ancho cargando={enviando === "correo"} textoCargando="Entrando…" disabled={enviando === "google"}>
          Iniciar sesión
        </Boton>

        <div className="flex items-center gap-4 py-1" aria-hidden="true">
          <div className="flex-1 border-t border-border-decor" />
          <span className="text-sm text-text-subtle">o</span>
          <div className="flex-1 border-t border-border-decor" />
        </div>

        <BotonGoogle onClick={entrarConGoogle} cargando={enviando === "google"} deshabilitado={enviando === "correo"} />
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        ¿Aún no tienes cuenta? <Link to="/registro">Crear cuenta</Link>
      </p>
    </TarjetaFormulario>
  );
}
