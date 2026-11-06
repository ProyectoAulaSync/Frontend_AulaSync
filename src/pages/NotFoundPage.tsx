import { ArrowLeft, SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

export default function NotFoundPage() {
  usePageTitle("Página no encontrada");
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div aria-hidden="true" className="flex h-44 w-44 items-center justify-center rounded-xl bg-primary-tint">
        <SearchX className="h-20 w-20 text-primary" />
      </div>
      <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-surface-alt px-3 py-1 text-sm text-text-muted">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-error" />
        Error 404 · Recurso no disponible
      </p>
      <h1 className="mt-4">No encontramos esta página</h1>
      <p className="mt-2 max-w-prose text-text-muted">Revisa la dirección o vuelve al inicio.</p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Link to="/" className="btn btn-primary">
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
          Volver al inicio
        </Link>
        <Link to="/ayuda">Ir a Ayuda</Link>
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border-decor pt-6 text-sm text-text-muted">
        <p>¿Buscaba un documento, sala o reserva de estudio específica?</p>
        <Link to="/panel">Explorar salas de estudio</Link>
      </div>
    </div>
  );
}
