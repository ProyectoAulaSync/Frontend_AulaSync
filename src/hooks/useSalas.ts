import { useCallback, useEffect, useState } from "react";
import { listarSalas, type Sala } from "../services/salas";

type EstadoSalas = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; salas: Sala[] };

// Estados lógicos del Panel (cargando, error, vacío = listo sin salas, éxito = listo con salas).
export function useSalas() {
  const [estado, setEstado] = useState<EstadoSalas>({ tipo: "cargando" });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    listarSalas(controlador.signal)
      .then((salas) => setEstado({ tipo: "listo", salas }))
      .catch(() => {
        if (!controlador.signal.aborted) setEstado({ tipo: "error" });
      });
    return () => controlador.abort();
  }, [intento]);

  const reintentar = useCallback(() => {
    setEstado({ tipo: "cargando" });
    setIntento((i) => i + 1);
  }, []);

  return { estado, reintentar };
}
