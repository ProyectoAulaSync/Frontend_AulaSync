import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      {/* Primer elemento enfocable: salta la cabecera y la navegación (WCAG 2.4.1) */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3"
      >
        Saltar al contenido
      </a>

      <header className="border-b border-border-decor bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="font-heading text-xl font-semibold text-ink no-underline">
            Salón de Estudio
          </Link>
          <nav aria-label="Principal" className="flex flex-wrap items-center gap-4">
            <Link to="/ingresar">Iniciar sesión</Link>
            <Link to="/registro" className="btn btn-secondary">
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <main id="contenido" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border-decor bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-text-muted">
          <p>Proyecto Integrador I · Universidad del Valle</p>
          <Link to="/ayuda">Ayuda</Link>
        </div>
      </footer>
    </>
  );
}
