import { useEffect } from "react";

let primeraCarga = true;

/**
 * Título único por pantalla (WCAG 2.4.2) y foco al h1 al cambiar de ruta.
 * En la primera carga NO mueve el foco, para que «Saltar al contenido» sea el primer Tab.
 */
export function usePageTitle(titulo: string): void {
  useEffect(() => {
    document.title = `${titulo} · AulaSync`;

    if (primeraCarga) {
      primeraCarga = false;
      return;
    }
    const h1 = document.querySelector("h1");
    if (h1) {
      h1.setAttribute("tabindex", "-1");
      h1.focus();
    }
  }, [titulo]);
}
