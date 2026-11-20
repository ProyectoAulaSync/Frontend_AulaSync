export type RolEnSala = "Anfitrión" | "Participante";

export type Sala = {
  id: string;
  nombre: string;
  rol: RolEnSala;
};

/**
 * Salas de la persona con sesión.
 * El backend todavía no expone endpoints de Salas (llegan en un sprint posterior), así que por ahora
 * no hay ninguna y el Panel muestra el estado vacío. Cuando exista la API, solo cambia esta función.
 */
export async function listarSalas(_signal?: AbortSignal): Promise<Sala[]> {
  return [];
}
