import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ErrorPage from "./pages/ErrorPage";
import { variablesFaltantes } from "./services/config";

const raiz = createRoot(document.getElementById("root")!);

if (variablesFaltantes.length > 0) {
  // Sin configuración Firebase falla al cargarse y dejaría la pantalla en blanco. Se muestra la vista de error
  // (sin datos técnicos para la persona) y el detalle queda en la consola para quien despliega.
  console.error(`[Configuración] Faltan variables de entorno: ${variablesFaltantes.join(", ")}. Defínelas y vuelve a desplegar.`);
  raiz.render(
    <StrictMode>
      <ErrorPage />
    </StrictMode>,
  );
} else {
  // App se carga solo si la configuración está completa (importa Firebase al evaluarse).
  void import("./App").then(({ default: App }) => {
    raiz.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
}
