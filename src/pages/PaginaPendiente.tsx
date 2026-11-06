import { usePageTitle } from "../hooks/usePageTitle";

// Marcador para las pantallas que se construyen en sprints posteriores.
// Ya tiene ruta, título único, h1 y el layout común.
export default function PaginaPendiente({ titulo }: { titulo: string }) {
  usePageTitle(titulo);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1>{titulo}</h1>
      <p className="mt-2 text-text-muted">Esta pantalla se construirá en un sprint posterior.</p>
    </div>
  );
}
