import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cargando from "./Cargando";
import Mensaje from "./Mensaje";
import { useAuth } from "../hooks/useAuth";

export type EstadoDeNavegacion = {
  /** Vista que la persona pidió antes de que la mandáramos a iniciar sesión. */
  desde?: string;
  /** Aviso para mostrar en la pantalla de destino. */
  aviso?: string;
};

/**
 * Protege las pantallas que requieren sesión.
 * - modo «completo»: exige sesión y nombre de usuario elegido (Panel, Perfil…).
 * - modo «username»: pantalla de elegir nombre de usuario; solo para quien entró con Google y aún no lo eligió.
 */
export default function RutaPrivada({ modo = "completo" }: { modo?: "completo" | "username" }) {
  const { estado, perfil, reintentar } = useAuth();
  const ubicacion = useLocation();

  if (estado === "cargando") return <Cargando />;

  if (estado === "error") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Mensaje
          tipo="error"
          titulo="Sin conexión"
          accion={
            <button type="button" onClick={reintentar} className="btn btn-primary">
              Reintentar
            </button>
          }
        >
          Revisa tu red e inténtalo de nuevo.
        </Mensaje>
      </div>
    );
  }

  if (estado === "sin-sesion" || !perfil) {
    const estadoNav: EstadoDeNavegacion = {
      desde: ubicacion.pathname + ubicacion.search,
      aviso: "Inicia sesión para continuar.",
    };
    return <Navigate to="/ingreso" replace state={estadoNav} />;
  }

  // Quien entró con Google no puede saltarse la elección del nombre de usuario.
  if (modo === "completo" && !perfil.profileComplete) return <Navigate to="/registro/usuario" replace />;
  if (modo === "username" && perfil.profileComplete) return <Navigate to="/panel" replace />;

  return <Outlet />;
}
