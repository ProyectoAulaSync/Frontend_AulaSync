import { BrowserRouter, Route, Routes, useLocation, type Location } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import ToastProvider from "./context/ToastProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import LayoutAuth from "./components/LayoutAuth";
import RutaPrivada from "./components/RutaPrivada";
import RutaPublica from "./components/RutaPublica";
import BaseTecnicaPage from "./pages/BaseTecnicaPage";
import ElegirUsuarioPage from "./pages/ElegirUsuarioPage";
import InicioPage from "./pages/InicioPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import PaginaPendiente from "./pages/PaginaPendiente";
import PanelPage from "./pages/PanelPage";
import PerfilPage from "./pages/PerfilPage";
import RegistroPage from "./pages/RegistroPage";
import CrearSalaPage from "./pages/CrearSalaPage";
import SalaPage from "./pages/SalaPage";

function Rutas() {
  const location = useLocation();
  const locationFondo = (location.state as { backgroundLocation?: Location } | null)?.backgroundLocation;
  const locationPrincipal = locationFondo ?? location;

  return (
    <>
      <Routes location={locationPrincipal} key={locationPrincipal.key}>
        <Route element={<LayoutAuth />}>
          <Route element={<RutaPublica />}>
            <Route path="/ingreso" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
          </Route>
          <Route element={<RutaPrivada modo="username" />}>
            <Route path="/registro/usuario" element={<ElegirUsuarioPage />} />
          </Route>
        </Route>

        <Route element={<Layout />}>
          <Route path="/" element={<InicioPage />} />

          <Route element={<RutaPrivada />}>
            <Route path="/panel" element={<PanelPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/salas/nueva" element={<CrearSalaPage />} />
            <Route path="/salas/:id" element={<SalaPage />} />
          </Route>

          <Route path="/ayuda" element={<PaginaPendiente titulo="Centro de ayuda" />} />
          <Route path="/accesibilidad" element={<PaginaPendiente titulo="Accesibilidad" />} />
          <Route path="/base-tecnica" element={<BaseTecnicaPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      {locationFondo && location.pathname === "/salas/nueva" && (
        <Routes>
          <Route element={<RutaPrivada />}>
            <Route path="/salas/nueva" element={<CrearSalaPage comoModal />} />
          </Route>
        </Routes>
      )}
    </>
  );
}

// Rutas según la tabla de «Criterios de éxito» (sección 3) y el pie de página del prototipo.
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
        <AuthProvider>
          <Rutas />
        </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
