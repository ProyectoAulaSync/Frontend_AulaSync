import { useContext } from "react";
import { AuthContext, type AuthContextValor } from "../context/auth-context";

export function useAuth(): AuthContextValor {
  const valor = useContext(AuthContext);
  if (!valor) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return valor;
}
