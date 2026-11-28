type MensajeChatProps = {
  /** Contenido del mensaje */
  texto: string;
  /** Nombre de quien envió el mensaje */
  nombre: string;
  /** Hora del mensaje (formato HH:MM) */
  hora: string;
  /** Indica si el mensaje es propio del usuario autenticado */
  esPropio: boolean;
};

export default function MensajeChat({ texto, nombre, hora, esPropio }: MensajeChatProps) {
  return (
    <div className={`mb-3 flex flex-col ${esPropio ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`flex items-baseline gap-1 ${esPropio ? "justify-end text-right" : "justify-start text-left"} mb-0.5`}>
        <span className={`text-sm font-semibold ${esPropio ? "text-ink" : "text-text-muted"}`}>
          {esPropio ? "Tú" : nombre}
        </span>
        <span className="text-sm text-text-muted">{hora}</span>
      </div>
      <p className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${esPropio ? "bg-primary text-white" : "bg-[#F1F4F8] text-text-muted"}`}>
        {texto}
      </p>
    </div>
  );
}