// Reglas y mensajes de validación de la guía (sección 1). Cada función devuelve el mensaje de error o null si es válido.
// Las reglas del frontend son siempre iguales o más estrictas que las del backend.

const SOLO_LETRAS = /^[\p{L}\s]+$/u;
const USUARIO_VALIDO = /^[A-Za-z0-9_]+$/;
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarNombre(valor: string, vacio: string): string | null {
  const v = valor.trim();
  if (!v) return vacio;
  if (!SOLO_LETRAS.test(v)) return "Usa solo letras y espacios.";
  if (v.length < 2) return "Usa al menos 2 caracteres.";
  if (v.length > 50) return "Usa máximo 50 caracteres.";
  return null;
}

export const validarNombres = (valor: string) => validarNombre(valor, "Escribe tus nombres.");
export const validarApellidos = (valor: string) => validarNombre(valor, "Escribe tus apellidos.");

/** Formato del nombre de usuario (la disponibilidad la confirma la API). */
export function validarNombreDeUsuario(valor: string): string | null {
  const v = valor.trim();
  if (!v) return "Elige un nombre de usuario.";
  if (v.length < 3) return "Usa al menos 3 caracteres.";
  if (v.length > 20) return "Usa máximo 20 caracteres.";
  if (!USUARIO_VALIDO.test(v)) return "Usa solo letras, números y guion bajo (_).";
  return null;
}

export function validarCorreo(valor: string): string | null {
  const v = valor.trim();
  if (!v) return "Escribe tu correo electrónico.";
  if (!CORREO.test(v)) return "Ingresa un correo válido, por ejemplo nombre@correo.com.";
  return null;
}

// Política de contraseña (siempre visible bajo el campo).
export type RequisitoContrasena = { id: string; texto: string; cumplido: boolean };

export function requisitosDeContrasena(valor: string): RequisitoContrasena[] {
  return [
    { id: "longitud", texto: "Entre 8 y 64 caracteres", cumplido: valor.length >= 8 && valor.length <= 64 },
    { id: "mayuscula", texto: "Una letra mayúscula", cumplido: /\p{Lu}/u.test(valor) },
    { id: "minuscula", texto: "Una letra minúscula", cumplido: /\p{Ll}/u.test(valor) },
    { id: "numero", texto: "Un número", cumplido: /\d/.test(valor) },
  ];
}

export function validarContrasenaNueva(valor: string): string | null {
  if (!valor) return "Crea una contraseña.";
  if (!requisitosDeContrasena(valor).every((r) => r.cumplido)) return "Tu contraseña aún no cumple todos los requisitos.";
  return null;
}

/** Al iniciar sesión solo se exige que no esté vacía (no se muestran los requisitos). */
export function validarContrasenaDeIngreso(valor: string): string | null {
  return valor ? null : "Escribe tu contraseña.";
}
