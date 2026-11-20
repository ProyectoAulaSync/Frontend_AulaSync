import { BookOpen, LogOut, UserRound, Users, Video } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { cerrarSesion } from "../services/auth";
import Boton from "./Boton";

const enlaceMovil = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-14 flex-col items-center justify-center gap-0.5 font-heading text-sm font-semibold no-underline ${
    isActive ? "text-primary underline" : "text-text-muted"
  }`;

const enlaceLateral = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-12 items-center gap-3 rounded-lg px-3 font-heading font-semibold no-underline transition-colors ${
    isActive ? "bg-primary-tint text-primary" : "text-text-muted hover:bg-surface-alt hover:text-ink"
  }`;

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

  const enlaceSaltar = (
    <a
      href="#contenido"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3"
    >
      Saltar al contenido
    </a>
  );

  if (perfilCompleto && perfil) {
    return (
      <div className="min-h-screen bg-surface">
        {enlaceSaltar}

        <header className="flex min-h-14 items-center justify-between border-b border-border-decor bg-white px-4 py-2 md:hidden">
          <Link to="/panel" className="flex min-h-11 items-center gap-2 font-heading text-lg font-semibold text-ink no-underline">
            <BookOpen aria-hidden="true" className="h-6 w-6 text-primary" />
            AulaSync
          </Link>
          <Boton variante="neutral" onClick={salir} icono={<LogOut aria-hidden="true" className="h-4 w-4" />}>
            Cerrar sesión
          </Boton>
        </header>

        <aside className="fixed inset-y-0 left-0 z-30 hidden w-80 flex-col border-r border-border-decor bg-white px-5 py-6 md:flex">
          <Link to="/panel" className="flex min-h-12 items-center gap-3 font-heading text-xl font-bold text-ink no-underline">
            <BookOpen aria-hidden="true" className="h-7 w-7 text-primary" />
            AulaSync
          </Link>

          <nav aria-label="Menú principal" className="mt-10">
            <p className="mb-3 px-3 text-xs font-bold tracking-wider text-text-muted">MENÚ PRINCIPAL</p>
            <ul className="space-y-1">
              <li>
                <NavLink to="/panel" className={enlaceLateral}>
                  <Video aria-hidden="true" className="h-5 w-5" />
                  Mis salas
                </NavLink>
              </li>
              <li>
                <NavLink to="/perfil" className={enlaceLateral}>
                  <UserRound aria-hidden="true" className="h-5 w-5" />
                  Mi perfil
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="mt-auto space-y-4 border-t border-border-decor pt-5">
            <NavLink to="/perfil" className="flex min-h-14 items-center gap-3 rounded-lg p-2 text-ink no-underline hover:bg-surface-alt">
              <Avatar avatar={perfil.avatar} nombres={perfil.nombres} apellidos={perfil.apellidos} tamano={44} />
              <span className="min-w-0">
                <span className="block truncate font-heading font-semibold">{perfil.nombres} {perfil.apellidos}</span>
                <span className="block truncate text-sm text-text-muted">@{perfil.username}</span>
              </span>
            </NavLink>
            <Boton variante="neutral" ancho onClick={salir} icono={<LogOut aria-hidden="true" className="h-4 w-4" />}>
              Cerrar sesión
            </Boton>
          </div>
        </aside>

        <main id="contenido" tabIndex={-1} className="min-h-screen pb-24 md:ml-80 md:pb-0">
          <Outlet />
        </main>

        <nav
          aria-label="Navegación móvil"
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-border-decor bg-white pb-[env(safe-area-inset-bottom)] shadow-lg md:hidden"
        >
          <NavLink to="/panel" className={enlaceMovil}>
            <Users aria-hidden="true" className="h-5 w-5" />
            Salas
          </NavLink>
          <NavLink to="/perfil" className={enlaceMovil}>
            <UserRound aria-hidden="true" className="h-5 w-5" />
            Perfil
          </NavLink>
        </nav>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Primer elemento enfocable: salta cabecera y navegación (WCAG 2.4.1) */}
      {enlaceSaltar}

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
