function claveMateria(uid: string, salaId: string): string {
  return `aulasync:materia:${uid}:${salaId}`;
}

// Dato local del navegador; no se sincroniza con el backend.
export function obtenerMateria(uid: string, salaId: string): string | null {
  try {
    const materia = window.localStorage.getItem(claveMateria(uid, salaId))?.trim();
    return materia || null;
  } catch {
    return null;
  }
}

export function guardarMateria(uid: string, salaId: string, materia: string): void {
  try {
    const clave = claveMateria(uid, salaId);
    const valor = materia.trim();
    if (valor) {
      window.localStorage.setItem(clave, valor);
    } else {
      window.localStorage.removeItem(clave);
    }
  } catch {
    return;
  }
}
