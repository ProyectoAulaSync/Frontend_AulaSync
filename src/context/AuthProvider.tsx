import { onAuthStateChanged, signOut } from "firebase/auth";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ApiError, obtenerMiPerfil, type PerfilUsuario } from "../services/api";
import { firebaseAuth } from "../services/firebase";
import { AuthContext, type AuthContextValor, type EstadoSesion } from "./auth-context";

// Mantiene la sesión de Firebase y el perfil de la API sincronizados para toda la aplicación.
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoSesion>("cargando");
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  // Cada cambio de sesión o de perfil sube la versión: una respuesta lenta que llega tarde se descarta.
  const version = useRef(0);

  const cargarPerfil = useCallback(async () => {
    const mia = ++version.current;
    try {
      const p = await obtenerMiPerfil();
      if (mia !== version.current) return;
      setPerfil(p);
      setEstado("con-sesion");
    } catch (error) {
      if (mia !== version.current) return;
      if (error instanceof ApiError && error.code === "PROFILE_NOT_FOUND") {
        // Sesión de Firebase sin perfil aún (caso Google a mitad de camino): el flujo de ingreso lo crea.
        setPerfil(null);
        setEstado("sin-sesion");
      } else if (error instanceof ApiError && error.status === 401) {
        await signOut(firebaseAuth).catch(() => undefined);
      } else {
        setEstado("error");
      }
    }
  }, []);

  useEffect(
    () =>
      onAuthStateChanged(firebaseAuth, (usuario) => {
        if (!usuario) {
          version.current++;
          setPerfil(null);
          setEstado("sin-sesion");
          return;
        }
        void cargarPerfil();
      }),
    [cargarPerfil],
  );

  const establecerPerfil = useCallback((p: PerfilUsuario) => {
    version.current++;
    setPerfil(p);
    setEstado("con-sesion");
  }, []);

  const reintentar = useCallback(() => {
    setEstado("cargando");
    void cargarPerfil();
  }, [cargarPerfil]);

  const valor = useMemo<AuthContextValor>(
    () => ({ estado, perfil, establecerPerfil, reintentar }),
    [estado, perfil, establecerPerfil, reintentar],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
