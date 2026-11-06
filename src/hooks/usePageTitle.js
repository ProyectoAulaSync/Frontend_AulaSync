import { useEffect } from "react";

let primeraCarga = true;

/**
 * Pone un título único a cada pantalla (WCAG 2.4.2) y mueve el foco al h1
 * cuando cambia la ruta, para que el lector de pantalla anuncie la nueva página.
 * En la primera carga NO mueve el foco, para que «Saltar al contenido» siga siendo
 * el primer elemento al que llega la tecla Tab.
 */
export function usePageTitle(titulo) {
  useEffect(() => {
    document.title = `${titulo} · Salón de Estudio`;

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
