// Estado «cargando» de la guía: esqueleto con el texto «Cargando…», nunca una pantalla en blanco.
// El pulso se desactiva si la persona pidió reducir el movimiento.
export default function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <div role="status" className="mx-auto w-full max-w-2xl px-4 py-12">
      <div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse">
        <div className="h-6 w-32 rounded bg-disabled-bg" />
        <div className="h-4 w-full rounded bg-surface-alt" />
        <div className="h-4 w-2/3 rounded bg-surface-alt" />
      </div>
      <p className="mt-6 text-center text-text-muted">{texto}</p>
    </div>
  );
}
