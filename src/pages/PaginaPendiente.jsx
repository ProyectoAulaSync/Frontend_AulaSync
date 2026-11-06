import { usePageTitle } from "../hooks/usePageTitle";

// Marcador de posición para las pantallas que se construyen en sprints posteriores.
// Ya tiene su ruta, su título único, su h1 y el layout común (criterio S0-C05).
export default function PaginaPendiente({ titulo }) {
  usePageTitle(titulo);
  return (
    <>
      <h1>{titulo}</h1>
      <p className="mt-2 text-text-muted">Esta pantalla se construirá en un sprint posterior.</p>
    </>
  );
}
