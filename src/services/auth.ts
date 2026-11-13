import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  ApiError,
  registrarUsuario,
  sincronizarGoogle,
  type DatosRegistro,
  type PerfilUsuario,
} from "./api";
import { firebaseAuth } from "./firebase";

// Microcopy de la guía (sección 5): las fallas técnicas se traducen a estos textos.
export const MENSAJES = {
  generico: "No pudimos completar la acción. Inténtalo de nuevo.",
  datosIncorrectos: "Correo o contraseña incorrectos. Revisa tus datos e inténtalo de nuevo.",
  muchosIntentos: "Hiciste muchos intentos. Espera unos minutos e inténtalo de nuevo.",
  sinConexion: "Revisa tu red e inténtalo de nuevo.",
  googleCancelado: "Cancelaste el ingreso con Google. Puedes intentarlo de nuevo cuando quieras.",
  googleError: "No pudimos conectarte con Google. Inténtalo de nuevo o usa tu correo.",
  registroError: "No pudimos crear tu cuenta. Inténtalo de nuevo en unos minutos.",
} as const;

export type TipoErrorAuth = "datos" | "intentos" | "red" | "cancelado" | "otro";

/** Error ya traducido a español claro: su `message` se puede mostrar tal cual. */
export class ErrorAuth extends Error {
  tipo: TipoErrorAuth;
  constructor(tipo: TipoErrorAuth, mensaje: string) {
    super(mensaje);
    this.tipo = tipo;
  }
}

function codigoDeFirebase(error: unknown): string {
  return typeof error === "object" && error !== null && "code" in error ? String((error as { code: unknown }).code) : "";
}

function esFalloDeRed(error: unknown): boolean {
  return codigoDeFirebase(error) === "auth/network-request-failed" || (error instanceof TypeError && error.message.includes("fetch"));
}

/** Inicio de sesión manual. Con datos malos el mensaje es siempre el mismo (no revela cuál dato falló). */
export async function iniciarSesionConCorreo(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
  } catch (error) {
    switch (codigoDeFirebase(error)) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-email":
      case "auth/user-disabled":
        throw new ErrorAuth("datos", MENSAJES.datosIncorrectos);
      case "auth/too-many-requests":
        throw new ErrorAuth("intentos", MENSAJES.muchosIntentos);
      case "auth/network-request-failed":
        throw new ErrorAuth("red", MENSAJES.sinConexion);
      default:
        throw new ErrorAuth("otro", MENSAJES.generico);
    }
  }
}

/**
 * Entra (o se registra) con Google y crea el perfil inicial en la API.
 * Devuelve el perfil: si `profileComplete` es false hay que llevar a elegir nombre de usuario.
 */
export async function continuarConGoogle(): Promise<PerfilUsuario> {
  try {
    await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
  } catch (error) {
    const codigo = codigoDeFirebase(error);
    if (codigo === "auth/popup-closed-by-user" || codigo === "auth/cancelled-popup-request") {
      throw new ErrorAuth("cancelado", MENSAJES.googleCancelado);
    }
    if (esFalloDeRed(error)) throw new ErrorAuth("red", MENSAJES.sinConexion);
    throw new ErrorAuth("otro", MENSAJES.googleError);
  }

  try {
    return await sincronizarGoogle();
  } catch (error) {
    // Sin perfil en la API no se puede usar la cuenta: se cierra la sesión de Firebase para no dejarla a medias.
    await signOut(firebaseAuth).catch(() => undefined);
    if (esFalloDeRed(error)) throw new ErrorAuth("red", MENSAJES.sinConexion);
    throw new ErrorAuth("otro", MENSAJES.googleError);
  }
}

/**
 * Registro manual: crea la cuenta en la API y luego inicia sesión para entrar directo al panel.
 * Los errores de la API (ApiError: EMAIL_TAKEN, USERNAME_TAKEN, VALIDATION_ERROR) se dejan pasar
 * para que el formulario los muestre junto al campo correspondiente.
 */
export async function registrarYEntrar(datos: DatosRegistro): Promise<PerfilUsuario> {
  let perfil: PerfilUsuario;
  try {
    perfil = await registrarUsuario(datos);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (esFalloDeRed(error)) throw new ErrorAuth("red", MENSAJES.sinConexion);
    throw new ErrorAuth("otro", MENSAJES.registroError);
  }

  try {
    await signInWithEmailAndPassword(firebaseAuth, datos.email.trim(), datos.password);
  } catch {
    // La cuenta ya existe; solo falló el ingreso automático. Que inicie sesión a mano.
    throw new ErrorAuth("otro", "Tu cuenta se creó, pero no pudimos iniciar tu sesión. Ve a Iniciar sesión para entrar.");
  }
  return perfil;
}

export function cerrarSesion(): Promise<void> {
  return signOut(firebaseAuth);
}

/** Texto seguro para mostrar ante cualquier error inesperado (nunca el mensaje técnico original). */
export function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorAuth) return error.message;
  if (error instanceof ApiError && error.status < 500 && error.status !== 401) return error.message;
  if (esFalloDeRed(error)) return MENSAJES.sinConexion;
  return MENSAJES.generico;
}
