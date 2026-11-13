import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import Boton from "../components/Boton";
import Campo from "../components/Campo";
import Mensaje from "../components/Mensaje";
import TarjetaFormulario from "../components/TarjetaFormulario";
import { useAuth } from "../hooks/useAuth";
import { useDisponibilidadUsuario } from "../hooks/useDisponibilidadUsuario";
import { usePageTitle } from "../hooks/usePageTitle";
import { validarNombreDeUsuario } from "../lib/validaciones";
import { ApiError, elegirNombreDeUsuario } from "../services/api";
import { cerrarSesion, mensajeDeError } from "../services/auth";

const OCUPADO = "Ese nombre de usuario ya está en uso. Prueba con otro.";

// Paso obligatorio tras registrarse con Google: no se puede saltar (RutaPrivada modo «username» lo garantiza).
export default function ElegirUsuarioPage() {
  usePageTitle("Elige tu nombre de usuario");
  const { establecerPerfil } = useAuth();
  const navegar = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [rechazado, setRechazado] = useState<string | null>(null);
  const [fallo, setFallo] = useState<string | null>(null);

  const disponibilidad = useDisponibilidadUsuario(usuario);
  const errorFormato = validarNombreDeUsuario(usuario);
  const iniciado = usuario.length > 0;
  const ocupado = disponibilidad === "ocupado" || rechazado === usuario.trim();

  const error = iniciado ? (ocupado ? OCUPADO : errorFormato && usuario.trim().length >= 3 ? errorFormato : null) : null;
  const exito = iniciado && !errorFormato && disponibilidad === "disponible" && !ocupado ? "Nombre de usuario disponible." : null;
  const puedeGuardar = !errorFormato && !ocupado && disponibilidad !== "verificando";

  async function guardar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!puedeGuardar) return;
    setFallo(null);
    setGuardando(true);
    try {
      // Al tener el perfil completo, RutaPrivada lleva al Panel.
      establecerPerfil(await elegirNombreDeUsuario(usuario.trim()));
    } catch (e) {
      if (e instanceof ApiError && e.code === "USERNAME_TAKEN") setRechazado(usuario.trim());
      else setFallo(mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  }

  function cancelar() {
    // Primero se navega y luego se cierra la sesión, para que la ruta protegida no mande a «Iniciar sesión».
    navegar("/");
    void cerrarSesion();
  }

  return (
    <TarjetaFormulario titulo="Elige tu nombre de usuario" descripcion="Es el nombre con el que te verá tu grupo." centrado>
      {fallo && (
        <div className="mb-5">
          <Mensaje tipo="error" titulo={fallo} />
        </div>
      )}

      <form onSubmit={guardar} noValidate className="space-y-4">
        <Campo
          id="elegir-usuario"
          etiqueta="Nombre de usuario"
          etiquetaOculta
          obligatorio
          centrado
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Ej: mariagomez_22"
          ayuda="De 3 a 20 caracteres: letras, números y guion bajo."
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          error={error}
          exito={exito}
        />

        <Boton type="submit" ancho cargando={guardando} textoCargando="Guardando…" disabled={!puedeGuardar || !iniciado}>
          Guardar nombre de usuario
        </Boton>
      </form>

      <div className="mt-4 text-center">
        <Boton variante="neutral" onClick={cancelar}>
          Cancelar y volver
        </Boton>
      </div>
    </TarjetaFormulario>
  );
}
