import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

export default function NotFoundPage() {
  usePageTitle("Página no encontrada");
  return (
    <>
      <h1>No encontramos esta página</h1>
      <p className="mt-2 max-w-prose text-text-muted">Revisa la dirección o vuelve al inicio.</p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Link to="/" className="btn btn-primary">
          Volver al inicio
        </Link>
        <Link to="/ayuda">Ir a Ayuda</Link>
      </div>
    </>
  );
}
