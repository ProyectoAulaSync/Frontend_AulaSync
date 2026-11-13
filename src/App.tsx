import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import ToastProvider from "./context/ToastProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import RutaPrivada from "./components/RutaPrivada";
import RutaPublica from "./components/RutaPublica";
import BaseTecnicaPage from "./pages/BaseTecnicaPage";
import ElegirUsuarioPage from "./pages/ElegirUsuarioPage";
import InicioPage from "./pages/InicioPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import PaginaPendiente from "./pages/PaginaPendiente";
import PanelPage from "./pages/PanelPage";
import RegistroPage from "./pages/RegistroPage";

// Rutas según la tabla de «Criterios de éxito» (sección 3) y el pie de página del prototipo.
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<InicioPage />} />

              {/* Solo sin sesión: con sesión llevan al Panel (o a la vista que se había pedido). */}
              <Route element={<RutaPublica />}>
                <Route path="/ingreso" element={<LoginPage />} />
                <Route path="/registro" element={<RegistroPage />} />
              </Route>

              {/* Paso obligatorio de quien entra con Google: no se puede saltar ni abrir sin sesión. */}
              <Route element={<RutaPrivada modo="username" />}>
                <Route path="/registro/usuario" element={<ElegirUsuarioPage />} />
              </Route>

              {/* Pantallas privadas: sin sesión llevan a Iniciar sesión. */}
              <Route element={<RutaPrivada />}>
                <Route path="/panel" element={<PanelPage />} />
                <Route path="/perfil" element={<PaginaPendiente titulo="Mi perfil" />} />
                <Route path="/salas/nueva" element={<PaginaPendiente titulo="Crear sala" />} />
                <Route path="/salas/:id" element={<PaginaPendiente titulo="Sala" />} />
              </Route>

              <Route path="/ayuda" element={<PaginaPendiente titulo="Centro de ayuda" />} />
              <Route path="/accesibilidad" element={<PaginaPendiente titulo="Accesibilidad" />} />
              <Route path="/base-tecnica" element={<BaseTecnicaPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
