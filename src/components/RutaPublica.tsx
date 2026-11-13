import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cargando from "./Cargando";
import type { EstadoDeNavegacion } from "./RutaPrivada";
import { useAuth } from "../hooks/useAuth";

/**
 * Para Iniciar sesión y Crear cuenta: si ya hay sesión no tiene sentido mostrarlas.
 * Lleva a la vista que se había pedido (o al Panel); si falta el nombre de usuario, a elegirlo.
 */
export default function RutaPublica() {
  const { estado, perfil } = useAuth();
  const ubicacion = useLocation();

  if (estado === "cargando") return <Cargando />;

  if (estado === "con-sesion" && perfil) {
    if (!perfil.profileComplete) return <Navigate to="/registro/usuario" replace />;
    const destino = (ubicacion.state as EstadoDeNavegacion | null)?.desde ?? "/panel";
    return <Navigate to={destino} replace />;
  }

  return <Outlet />;
}
