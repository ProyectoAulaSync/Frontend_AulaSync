import { RotateCw, TriangleAlert } from "lucide-react";
import { usePageTitle } from "../hooks/usePageTitle";

// Vista de error inesperado (fuera del Router, por eso usa <a> y no <Link>).
export default function ErrorPage() {
  usePageTitle("Algo salió mal");
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-12">
      <div aria-hidden="true" className="flex h-40 w-40 items-center justify-center rounded-xl bg-warning-bg">
        <TriangleAlert className="h-16 w-16 text-warning" />
      </div>
      <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-surface-alt px-3 py-1 text-sm text-text-muted">
        <TriangleAlert aria-hidden="true" className="h-4 w-4" />
        Error inesperado
      </p>
      <h1 className="mt-4">Algo salió mal</h1>
      <p className="mt-2 max-w-prose text-text-muted">
        No pudimos mostrar esta pantalla. Inténtalo de nuevo; si el problema sigue, vuelve al inicio.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          <RotateCw aria-hidden="true" className="h-5 w-5" />
          Reintentar
        </button>
        <a href="/">Volver al inicio</a>
      </div>
    </main>
  );
}
