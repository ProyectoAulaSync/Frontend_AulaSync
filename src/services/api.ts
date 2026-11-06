// El frontend NUNCA consulta Firestore: todo pasa por la API publicada en Render.
const API_URL: string = import.meta.env.VITE_API_URL ?? "";

// Contrato actual (Swagger del Sprint 0): GET /api/mensaje -> { id, ...campos del documento }
// Los campos concretos dependen del documento en Firestore, por eso el tipo es abierto.
export type MensajeBase = { id: string } & Record<string, unknown>;

export class ApiError extends Error {
  status: number;
  constructor(status: number) {
    super(`La API respondió con estado ${status}`);
    this.status = status;
  }
}

export async function obtenerMensaje(signal?: AbortSignal): Promise<MensajeBase> {
  const respuesta = await fetch(`${API_URL}/api/mensaje`, { signal });
  if (!respuesta.ok) throw new ApiError(respuesta.status);
  return (await respuesta.json()) as MensajeBase;
}
