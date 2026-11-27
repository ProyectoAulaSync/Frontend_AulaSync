type SkeletonMensajeProps = {
  /** Dirección del bloque: "izquierda" o "derecha" */
  lado: "izquierda" | "derecha";
};

/** Patrón de esqueleto para estado de carga del chat.
 * Sirve como placeholder visual mientras se cargan los mensajes.
 */
export function SkeletonMensaje({ lado }: SkeletonMensajeProps) {
  const claseContenedor = lado === "izquierda" ? "flex flex-row" : "flex flex-row-reverse";

  return (
    <div key={lado} className={`mb-3 ${claseContenedor}`}>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-text-subtle" />
        <span className="text-xs text-text-muted" />
      </div>
      <p
        className={`max-w-[72%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap break-words bg-[#F1F4F8] text-text-muted`}
      />
    </div>
  );
}

/** Contenedor con tres esqueletos de mensaje (izquierda, derecha, izquierda)
 * para simular la carga del historial del chat.
 */
export default function SkeletonMensajes() {
  return (
    <div className="flex-none h-[430px] overflow-y-auto p-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando mensajes</span>
      <div className="flex flex-col gap-3">
        <SkeletonMensaje lado="izquierda" />
        <SkeletonMensaje lado="derecha" />
        <SkeletonMensaje lado="izquierda" />
      </div>
    </div>
  );
}