import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { useLocation, useNavigate, type Location } from "react-router-dom";
import Boton from "../components/Boton";
import Campo from "../components/Campo";
import Mensaje from "../components/Mensaje";
import ModalBase from "../components/ModalBase";
import SelectorMateria from "../components/SelectorMateria";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";
import { useToast } from "../hooks/useToast";
import { guardarMateria } from "../lib/materias";
import { validarNombreDeSala } from "../lib/validaciones";
import { ApiError } from "../services/api";
import { crearSala } from "../services/salas";

type Props = { comoModal?: boolean };

function errorDeNombre(error: ApiError): string | null {
  const field = error.field === "nombre" ? error.message : null;
  const fieldFromFields = error.fields.find((item) => item.field === "nombre")?.message;
  return fieldFromFields ?? field;
}

export default function CrearSalaPage({ comoModal = false }: Props) {
  usePageTitle("Crear sala");
  const navegar = useNavigate();
  const location = useLocation();
  const locationFondo = (location.state as { backgroundLocation?: Location } | null)?.backgroundLocation;
  const { perfil } = useAuth();
  const { mostrarAviso } = useToast();
  const [nombre, setNombre] = useState("");
  const [materia, setMateria] = useState("");
  const [nombreTocado, setNombreTocado] = useState(false);
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [errorApiNombre, setErrorApiNombre] = useState<string | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [reintentar, setReintentar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const nombreRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (comoModal) nombreRef.current?.focus();
  }, [comoModal]);

  const errorNombre =
    errorApiNombre ??
    ((nombreTocado || intentoEnvio) ? validarNombreDeSala(nombre) : null);
  function volverAlPanel() {
    if (enviando) return;
    if (comoModal && locationFondo?.pathname === "/panel") {
      document.title = "Panel · AulaSync";
      navegar(-1);
      return;
    }
    navegar("/panel", { replace: true });
  }

  function cambiarNombre(valor: string) {
    setNombre(valor);
    setErrorApiNombre(null);
    setErrorEnvio(null);
    setReintentar(false);
  }

  function cambiarMateria(valor: string) {
    setMateria(valor);
    setErrorEnvio(null);
    setReintentar(false);
  }

  async function enviar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setIntentoEnvio(true);
    setNombreTocado(true);
    setErrorEnvio(null);

    const errorNombreActual = validarNombreDeSala(nombre);
    setErrorApiNombre(null);
    if (errorNombreActual) {
      nombreRef.current?.focus();
      return;
    }

    setEnviando(true);
    try {
      const sala = await crearSala(nombre.trim());
      if (perfil && materia.trim()) guardarMateria(perfil.uid, sala.id, materia);
      navegar(`/salas/${encodeURIComponent(sala.id)}`);
      mostrarAviso("Sala creada.");
    } catch (error) {
      setReintentar(true);
      if (error instanceof ApiError) {
        if (error.code === "TIMEOUT") {
          setErrorEnvio("El servidor tardó demasiado en responder. Inténtalo de nuevo.");
          setErrorApiNombre(null);
        } else if (error.code === "VALIDATION_ERROR") {
          const mensajeNombre = errorDeNombre(error);
          setErrorApiNombre(mensajeNombre);
          setErrorEnvio(
            mensajeNombre
              ? null
              : "No pudimos validar los datos de la sala. Revísalos e inténtalo de nuevo.",
          );
          if (mensajeNombre) nombreRef.current?.focus();
        } else {
          setErrorApiNombre(errorDeNombre(error));
          setErrorEnvio(
            errorDeNombre(error) ? null : "No pudimos crear la sala. Inténtalo de nuevo.",
          );
          if (errorDeNombre(error)) nombreRef.current?.focus();
        }
      } else {
        setErrorEnvio("No pudimos crear la sala. Inténtalo de nuevo.");
      }
    } finally {
      setEnviando(false);
    }
  }

  const formulario = (
    <form onSubmit={enviar} noValidate className="space-y-5">
      {errorEnvio && <Mensaje tipo="error" titulo={errorEnvio} />}
      <Campo
        id="nombre-sala"
        ref={nombreRef}
        data-crear-sala-nombre
        etiqueta="Nombre de la sala"
        obligatorio
        autoComplete="off"
        placeholder="Ej. Cálculo Multivariable - Repaso Parcial 2"
        ayuda="Un nombre descriptivo facilita que tus compañeros identifiquen la sesión."
        value={nombre}
        onChange={(evento) => cambiarNombre(evento.target.value)}
        onBlur={() => setNombreTocado(true)}
        error={errorNombre}
      />
      <SelectorMateria valor={materia} onCambio={cambiarMateria} />
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Boton variante="neutral" onClick={volverAlPanel} disabled={enviando}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={enviando} textoCargando="Creando…">
          {reintentar ? "Reintentar" : "Crear sala"}
        </Boton>
      </div>
    </form>
  );

  if (comoModal) {
    return (
      <ModalBase
        abierto
        titulo="Crear nueva sala"
        tituloPrimario
        descripcion="Configura los detalles de tu espacio colaborativo de estudio."
        nivelTitulo="h1"
        ancho="max-w-xl"
        confirmando={enviando}
        mostrarCerrar
        pantallaCompletaMovil
        selectorFocoInicial="[data-crear-sala-nombre]"
        onCerrar={volverAlPanel}
      >
        <div className="mt-5">{formulario}</div>
      </ModalBase>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <p className="font-heading text-sm font-semibold text-primary">Espacio académico interactivo</p>
      <h1 className="mt-1">Crear nueva sala</h1>
      <p className="mt-2 mb-6 text-text-muted">Configura los detalles de tu espacio colaborativo de estudio.</p>
      {formulario}
    </main>
  );
}
