import { BookOpen } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

export default function Layout() {
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
          <Link to="/" className="flex items-center gap-2 font-heading text-lg font-semibold text-ink no-underline">
            <BookOpen aria-hidden="true" className="h-6 w-6" />
            Salón de Estudio
          </Link>
          <nav aria-label="Principal" className="flex flex-wrap items-center gap-4">
            <Link to="/ingreso" className="font-heading font-semibold">
              Iniciar sesión
            </Link>
            <Link to="/registro" className="btn btn-secondary">
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <main id="contenido" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border-decor bg-primary-tint">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-text-muted">
          <p>© 2026 Salón de Estudio Colaborativo. Todos los derechos reservados.</p>
          <nav aria-label="Información legal y ayuda">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li><Link to="/terminos">Términos de servicio</Link></li>
              <li><Link to="/privacidad">Política de privacidad</Link></li>
              <li><Link to="/accesibilidad">Accesibilidad</Link></li>
              <li><Link to="/ayuda">Centro de ayuda</Link></li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
