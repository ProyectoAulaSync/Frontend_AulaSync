import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import BaseTecnicaPage from "./pages/BaseTecnicaPage";
import InicioPage from "./pages/InicioPage";
import NotFoundPage from "./pages/NotFoundPage";
import PaginaPendiente from "./pages/PaginaPendiente";

// Rutas según la tabla de «Criterios de éxito» (sección 3) y el pie de página del prototipo.
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<InicioPage />} />
            <Route path="/ingreso" element={<PaginaPendiente titulo="Iniciar sesión" />} />
            <Route path="/registro" element={<PaginaPendiente titulo="Crear cuenta" />} />
            <Route path="/registro/usuario" element={<PaginaPendiente titulo="Elegir nombre de usuario" />} />
            <Route path="/panel" element={<PaginaPendiente titulo="Mis salas" />} />
            <Route path="/perfil" element={<PaginaPendiente titulo="Mi perfil" />} />
            <Route path="/salas/nueva" element={<PaginaPendiente titulo="Crear Sala" />} />
            <Route path="/salas/:id" element={<PaginaPendiente titulo="Sala" />} />
            <Route path="/ayuda" element={<PaginaPendiente titulo="Centro de ayuda" />} />
            <Route path="/accesibilidad" element={<PaginaPendiente titulo="Accesibilidad" />} />
            <Route path="/base-tecnica" element={<BaseTecnicaPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
