
import { createContext } from "react";
import type { PerfilUsuario } from "../services/api";

/**
 * - cargando: aún no sabemos si hay sesión (primera carga de la página).
 * - sin-sesion: no hay nadie con sesión (o su perfil no existe).
 * - con-sesion: hay sesión y perfil cargado.
 * - error: hay sesión pero no pudimos traer el perfil (sin conexión, API caída). Se puede reintentar.
 */
export type EstadoSesion = "cargando" | "sin-sesion" | "con-sesion" | "error";

export type AuthContextValor = {
  estado: EstadoSesion;
  /** Perfil de la persona con sesión; null si no hay sesión. */
  perfil: PerfilUsuario | null;
  /** Guarda el perfil que devolvió la API tras registrarse, elegir usuario o entrar con Google. */
  establecerPerfil: (perfil: PerfilUsuario) => void;
  /** Vuelve a pedir el perfil tras un error de carga. */
  reintentar: () => void;
};

export const AuthContext = createContext<AuthContextValor | null>(null);
