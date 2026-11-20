import { BookOpen, LogOut } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { cerrarSesion } from "../services/auth";
import Boton from "./Boton";

const enlaceNav = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 items-center font-heading font-semibold ${isActive ? "text-ink underline" : ""}`;

export default function Layout() {
  const { estado, perfil } = useAuth();
  const navegar = useNavigate();
  const { mostrarAviso } = useToast();
  const conSesion = estado === "con-sesion" && perfil !== null;
  const perfilCompleto = conSesion && perfil.profileComplete;

  function salir() {
    // Cerrar sesión lleva al inicio. Se navega primero para que la ruta protegida no mande a «Iniciar sesión».
    navegar("/");
    void cerrarSesion();
    mostrarAviso("Cerraste sesión.");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Primer elemento enfocable: salta cabecera y navegación (WCAG 2.4.1) */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3"
      >
        Saltar al contenido
      </a>

      <header className="border-b border-border-decor bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          {/* Con sesión el logo lleva al Panel; sin sesión, al inicio. */}
          <Link
            to={perfilCompleto ? "/panel" : "/"}
            className="flex min-h-11 items-center gap-2 font-heading text-lg font-semibold text-ink no-underline"
          >
            <BookOpen aria-hidden="true" className="h-6 w-6" />
            AulaSync
          </Link>

          {conSesion ? (
            <nav aria-label="Principal" className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {perfilCompleto && (
                <>
                  <NavLink to="/panel" className={enlaceNav}>Panel</NavLink>
                  <NavLink to="/perfil" className={enlaceNav}>Perfil</NavLink>
                  <NavLink to="/ayuda" className={enlaceNav}>Ayuda</NavLink>
                </>
              )}
              <Boton variante="neutral" onClick={salir} icono={<LogOut aria-hidden="true" className="h-4 w-4" />}>
                Cerrar sesión
              </Boton>
            </nav>
          ) : (
            <nav aria-label="Principal" className="flex flex-wrap items-center gap-4">
              <Link to="/ingreso" className="inline-flex min-h-11 items-center font-heading font-semibold">
                Iniciar sesión
              </Link>
              <Link to="/registro" className="btn btn-secondary">
                Crear cuenta
              </Link>
            </nav>
          )}
        </div>
      </header>

      <main id="contenido" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border-decor bg-primary-tint">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-text-muted">
          <p>© 2026 AulaSync. Todos los derechos reservados.</p>
          <nav aria-label="Información legal y ayuda">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li><Link to="/accesibilidad">Accesibilidad</Link></li>
              <li><Link to="/ayuda">Centro de ayuda</Link></li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
