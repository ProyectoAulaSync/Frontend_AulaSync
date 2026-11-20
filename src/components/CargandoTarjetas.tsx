// Estado «cargando» del Panel: esqueleto de tarjetas con el texto «Cargando…».
export default function CargandoTarjetas({ cantidad = 4, texto = "Cargando…" }: { cantidad?: number; texto?: string }) {
  return (
    <div role="status" className="w-full">
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="mb-6 h-6 w-32 rounded bg-disabled-bg" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: cantidad }, (_, i) => (
            <div key={i} className="flex h-32 flex-col justify-between rounded-xl border border-border-decor bg-white p-4 shadow-sm">
              <div className="h-5 w-3/4 rounded bg-disabled-bg" />
              <div className="h-4 w-1/2 rounded bg-surface-alt" />
              <div className="mt-4 flex justify-between">
                <div className="h-8 w-8 rounded-full bg-disabled-bg" />
                <div className="h-8 w-20 rounded-lg bg-disabled-bg" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-6 text-center text-text-muted">{texto}</p>
    </div>
  );
}
