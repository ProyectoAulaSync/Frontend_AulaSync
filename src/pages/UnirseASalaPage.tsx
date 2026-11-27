import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Boton from "../components/Boton";
import Campo from "../components/Campo";
import Mensaje from "../components/Mensaje";
import { usePageTitle } from "../hooks/usePageTitle";
import { obtenerSala } from "../services/salas";

export default function UnirseASalaPage() {
  usePageTitle("Unirse a una sala");
  const navegar = useNavigate();
  const [idSala, setIDSala] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [intentando, setIntentando] = useState(false);

  async function unirse() {
    setIntentando(true);
    setError(null);

    const id = idSala.trim();

    if (!id) {
      setError("Ingresa un ID de sala para unirte.");
      setIntentando(false);
      return;
    }

    try {
      const sala = await obtenerSala(id);

      if (!sala) {
        setError("Sala no encontrada. Verifica el ID e inténtalo de nuevo.");
        setIntentando(false);
        return;
      }

      navegar(`/salas/${encodeURIComponent(sala.id)}`);
    } catch (error: any) {
      setError(
        error?.code === "VALIDATION_ERROR"
          ? error.message
          : "Sala no encontrada. Verifica el ID e inténtalo de nuevo.",
      );
      setIntentando(false);
    }
  }

  useEffect(() => {
    if (idSala !== "") {
      const timeout = setTimeout(() => {
        setIDSala("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [idSala]);

  usePageTitle("Unirse a una sala");

  return (
    <section className="min-h-screen bg-gradient-to-b from-surface-50 via-surface-100 to-surface-50 px-4 py-12">
      <div className="max-w-md mx-auto w-full">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full">
          <h2 className="text-center text-2xl font-heading font-semibold text-ink mb-6">Unirse a una sala</h2>

          {error && (
            <Mensaje tipo="error" titulo={error} />
          )}

          <form onSubmit={() => {
            unirse();
            return false;
          }} noValidate className="space-y-4">
            <Campo
              id="id-sala"
              data-unir-sala
              etiqueta="ID de la sala"
              obligatorio
              autoComplete="off"
              placeholder="Ej. abc123xyz"
              ayuda="El identificador único de la sala a la que quieres unirte."
              value={idSala}
              onChange={(e) => setIDSala(e.target.value)}
              error={error}
            />

            <div className="flex justify-end space-x-3">
              <Boton variante="neutral" onClick={() => navegar("/panel")}>
                Cancelar
              </Boton>
              <Boton type="submit" cargando={intentando} textoCargando="Uniendo...">
                Unirme
              </Boton>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}