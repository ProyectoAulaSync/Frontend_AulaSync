import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import BaseTecnicaPage from "./pages/BaseTecnicaPage";
import NotFoundPage from "./pages/NotFoundPage";
import PaginaPendiente from "./pages/PaginaPendiente";

// Usa los nombres del mapa del sitio de Norman. Esta lista es una propuesta.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Reemplaza "Inicio" por la pantalla real cuando esté lista según el prototipo */}
          <Route path="/" element={<PaginaPendiente titulo="Inicio" />} />
          <Route path="/ingresar" element={<PaginaPendiente titulo="Iniciar sesión" />} />
          <Route path="/registro" element={<PaginaPendiente titulo="Crear cuenta" />} />
          <Route path="/panel" element={<PaginaPendiente titulo="Mis salas" />} />
          <Route path="/perfil" element={<PaginaPendiente titulo="Mi perfil" />} />
          <Route path="/salas/:id" element={<PaginaPendiente titulo="Sala" />} />
          <Route path="/ayuda" element={<PaginaPendiente titulo="Ayuda" />} />
          <Route path="/base-tecnica" element={<BaseTecnicaPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
