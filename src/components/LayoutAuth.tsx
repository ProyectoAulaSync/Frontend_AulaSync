import { ArrowUpRight, BookOpen, FileText, PanelsTopLeft, Video } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

const beneficios = [
  { titulo: "Pizarras HD", texto: "Lienzo colaborativo infinito en vivo.", Icono: PanelsTopLeft },
  { titulo: "Audio & Video", texto: "Salas de debate sin interrupciones.", Icono: Video },
  { titulo: "Notas sincronizadas", texto: "Documentos y resúmenes al instante.", Icono: FileText },
];

export default function LayoutAuth() {
  const { pathname } = useLocation();
  const esIngreso = pathname === "/ingreso";
  const esRegistro = pathname === "/registro";

  return (
    <div className="grid min-h-svh min-w-0 grid-cols-1 bg-surface lg:grid-cols-[1.05fr_0.95fr]">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3"
      >
        Saltar al contenido
      </a>

      <aside className="auth-panel-gradient flex min-w-0 flex-col px-5 py-4 text-white sm:px-8 lg:min-h-svh lg:justify-between lg:px-12 lg:py-10 xl:px-16">
        <Link
          to="/"
          className="flex min-h-11 w-fit items-center gap-3 font-heading text-xl font-bold text-white no-underline focus-visible:outline-white"
        >
          <BookOpen aria-hidden="true" className="h-7 w-7" />
          AulaSync
        </Link>

        <div className="hidden max-w-2xl lg:block">
          <span className="inline-flex rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
            {esIngreso ? "Red Universitaria" : "Comunidad Académica UniValle"}
          </span>
          <p className="mt-7 max-w-xl font-heading text-4xl font-bold leading-tight xl:text-5xl">
            {esIngreso
              ? "Tu espacio universitario de estudio y colaboración en tiempo real"
              : "Únete a salas de estudio interactivas y colabora sin límites"}
          </p>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white">
            {esIngreso
              ? "Conéctate con tus compañeros de clase, comparte recursos y optimiza tus sesiones de estudio en un entorno interactivo y seguro."
              : "Conéctate con tus compañeros de clase, comparte recursos y optimiza tus sesiones de estudio en un entorno interactivo y seguro."}
          </p>

          <ul className="mt-9 grid gap-3 xl:grid-cols-3">
            {beneficios.map(({ titulo, texto, Icono }) => (
              <li key={titulo} className="rounded-xl border border-white/30 bg-white/10 p-4">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-white/30 bg-white/10">
                  <Icono aria-hidden="true" className="h-5 w-5 text-white" />
                </span>
                <p className="font-heading font-semibold text-white">{titulo}</p>
                <p className="mt-1 text-sm leading-relaxed text-white">{texto}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden items-center gap-2 text-sm text-white lg:flex">
          <span>PLATAFORMA ACADÉMICA COLABORATIVA</span>
          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <main
          id="contenido"
          tabIndex={-1}
          className="mx-auto flex w-full min-w-0 flex-1 flex-col px-4 py-5 outline-none sm:px-8 sm:py-8 lg:px-10 xl:px-16"
        >
          <nav aria-label="Navegación de autenticación" className="flex min-h-11 items-center justify-between gap-3">
            <Link to="/" className="inline-flex min-h-11 min-w-0 items-center font-medium">
              <span aria-hidden="true" className="mr-2">←</span>
              Volver al inicio
            </Link>
            {esIngreso && (
              <Link to="/registro" className="inline-flex min-h-11 shrink-0 items-center font-semibold">
                Crear cuenta
              </Link>
            )}
            {esRegistro && (
              <Link to="/ingreso" className="inline-flex min-h-11 shrink-0 items-center text-right font-semibold">
                ¿Ya tienes una cuenta? Iniciar sesión
              </Link>
            )}
          </nav>

          <div className="flex flex-1 items-start justify-center py-6 sm:py-10">
            <div className="w-full min-w-0 max-w-xl">
              <Outlet />
            </div>
          </div>
        </main>

        <footer className="px-4 pb-5 text-center text-sm text-text-muted sm:px-8 lg:pb-7">
          © 2026 AulaSync. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
}
