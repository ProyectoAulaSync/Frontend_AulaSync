// Variables de entorno que la aplicación necesita para arrancar. Vite las incrusta al compilar,
// así que si falta alguna en el despliegue (p. ej. no se definió en Vercel) hay que volver a desplegar.
const REQUERIDAS: Record<string, string | undefined> = {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** Nombres de las variables que faltan o están vacías (solo los nombres, nunca los valores). */
export const variablesFaltantes: string[] = Object.entries(REQUERIDAS)
  .filter(([, valor]) => !valor || valor.trim() === "")
  .map(([nombre]) => nombre);
