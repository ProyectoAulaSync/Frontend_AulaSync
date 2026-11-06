// El frontend NUNCA consulta Firestore: todo pasa por la API publicada en Render.
const API_URL = import.meta.env.VITE_API_URL;

// Forma de la respuesta: { mensaje: string, actualizadoEn: string (fecha ISO, ej. 2026-11-05T19:48:00Z) }
// Contrato acordado con el BE Lead: GET /api/base-tecnica -> { mensaje, actualizadoEn }
export async function obtenerBaseTecnica(signal) {
  const respuesta = await fetch(`${API_URL}/api/base-tecnica`, { signal });
  if (!respuesta.ok) {
    throw new Error(`La API respondió con estado ${respuesta.status}`);
  }
  return respuesta.json();
}
