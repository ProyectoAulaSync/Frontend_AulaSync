import { firebaseAuth } from "./firebase";

// El frontend NUNCA consulta Firestore: todo pasa por la API publicada en Render.
const API_URL: string = import.meta.env.VITE_API_URL ?? "";

// Contrato actual (Swagger del Sprint 0): GET /api/mensaje -> { id, ...campos del documento }
// Los campos concretos dependen del documento en Firestore, por eso el tipo es abierto.
export type MensajeBase = { id: string } & Record<string, unknown>;

/** Cuerpo de error que devuelve el backend: { error: { code, message, field?, fields? } } */
type CuerpoError = {
  error?: {
    code?: string;
    message?: string;
    field?: string;
    fields?: { field: string; message: string }[];
  };
};

export class ApiError extends Error {
  status: number;
  /** Código estable del backend (USERNAME_TAKEN, EMAIL_TAKEN, VALIDATION_ERROR…). Vacío si no hubo respuesta. */
  code: string;
  /** Campo del formulario al que se refiere el error, si el backend lo indica. */
  field?: string;
  /** Errores por campo cuando la validación falla (400). */
  fields: { field: string; message: string }[];

  constructor(status: number, cuerpo?: CuerpoError["error"]) {
    super(cuerpo?.message ?? `La API respondió con estado ${status}`);
    this.status = status;
    this.code = cuerpo?.code ?? "";
    this.field = cuerpo?.field;
    this.fields = cuerpo?.fields ?? [];
  }
}

type Opciones = {
  metodo?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  cuerpo?: unknown;
  /** Adjunta el ID token de Firebase de la persona con sesión (Authorization: Bearer). */
  conSesion?: boolean;
  signal?: AbortSignal;
};

async function peticion<T>(ruta: string, { metodo = "GET", cuerpo, conSesion = false, signal }: Opciones = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (cuerpo !== undefined) headers["Content-Type"] = "application/json";
  if (conSesion) {
    const usuario = firebaseAuth.currentUser;
    // getIdToken() renueva el token solo cuando está por vencer.
    if (usuario) headers.Authorization = `Bearer ${await usuario.getIdToken()}`;
  }

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers,
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    signal,
  });

  if (!respuesta.ok) {
    const datos = (await respuesta.json().catch(() => null)) as CuerpoError | null;
    throw new ApiError(respuesta.status, datos?.error);
  }
  return (await respuesta.json()) as T;
}

export async function obtenerMensaje(signal?: AbortSignal): Promise<MensajeBase> {
  return peticion<MensajeBase>("/api/mensaje", { signal });
}

// ───────── Autenticación y usuarios (Sprint 1) ─────────

export type Proveedor = "password" | "google";

export type PerfilUsuario = {
  uid: string;
  email: string;
  nombres: string;
  apellidos: string;
  username: string | null;
  avatar: string | null;
  provider: Proveedor;
  /** false cuando entró con Google y aún no eligió su nombre de usuario. */
  profileComplete: boolean;
};

export type DatosRegistro = {
  nombres: string;
  apellidos: string;
  username: string;
  avatar: string;
  email: string;
  password: string;
};

/** POST /api/auth/register: crea la cuenta y su perfil (201). Errores: 400, 409 EMAIL_TAKEN / USERNAME_TAKEN. */
export function registrarUsuario(datos: DatosRegistro): Promise<PerfilUsuario> {
  return peticion<PerfilUsuario>("/api/auth/register", { metodo: "POST", cuerpo: datos });
}

/** POST /api/auth/google: crea (una sola vez) el perfil inicial de quien entra con Google. Requiere sesión. */
export function sincronizarGoogle(): Promise<PerfilUsuario> {
  return peticion<PerfilUsuario>("/api/auth/google", { metodo: "POST", conSesion: true });
}

/** PUT /api/auth/username: paso obligatorio tras Google. Error 409 USERNAME_TAKEN si está ocupado. */
export function elegirNombreDeUsuario(username: string): Promise<PerfilUsuario> {
  return peticion<PerfilUsuario>("/api/auth/username", { metodo: "PUT", cuerpo: { username }, conSesion: true });
}

/** GET /api/users/username-available: consulta pública para validar mientras se escribe. */
export async function nombreDeUsuarioDisponible(username: string, signal?: AbortSignal): Promise<boolean> {
  const r = await peticion<{ username: string; available: boolean }>(
    `/api/users/username-available?username=${encodeURIComponent(username)}`,
    { signal },
  );
  return r.available;
}

/** GET /api/users/me: perfil de la persona con sesión. 404 PROFILE_NOT_FOUND si aún no tiene perfil. */
export function obtenerMiPerfil(signal?: AbortSignal): Promise<PerfilUsuario> {
  return peticion<PerfilUsuario>("/api/users/me", { conSesion: true, signal });
}
