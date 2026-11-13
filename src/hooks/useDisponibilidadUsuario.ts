import { useEffect, useState } from "react";
import { nombreDeUsuarioDisponible } from "../services/api";
import { validarNombreDeUsuario } from "../lib/validaciones";

export type DisponibilidadUsuario = "inactivo" | "verificando" | "disponible" | "ocupado";

/**
 * Consulta a la API si el nombre de usuario está libre mientras se escribe (con una pausa de 400 ms).
 * Solo consulta cuando el formato ya es válido. Si la consulta falla, no bloquea: la API lo vuelve a validar al guardar.
 */
export function useDisponibilidadUsuario(valor: string): DisponibilidadUsuario {
  const nombre = valor.trim();
  const formatoValido = validarNombreDeUsuario(nombre) === null;
  const [resultado, setResultado] = useState<{ nombre: string; disponible: boolean } | null>(null);

  useEffect(() => {
    if (!formatoValido) return;
    const controlador = new AbortController();
    const temporizador = setTimeout(() => {
      nombreDeUsuarioDisponible(nombre, controlador.signal)
        .then((disponible) => setResultado({ nombre, disponible }))
        .catch(() => undefined);
    }, 400);
    return () => {
      clearTimeout(temporizador);
      controlador.abort();
    };
  }, [nombre, formatoValido]);

  if (!formatoValido) return "inactivo";
  if (resultado?.nombre === nombre) return resultado.disponible ? "disponible" : "ocupado";
  return "verificando";
}
