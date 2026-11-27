import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Hash, Loader2 } from "lucide-react";
import Boton from "../components/Boton";
import Campo from "../components/Campo";
import { usePageTitle } from "../hooks/usePageTitle";
import { obtenerSala } from "../services/salas";

type EstadoVerificacion = "inicial" | "cargando" | "exito" | "error";

export default function UnirseASalaPage() {
  usePageTitle("Unirme a una sala");
  const navegar = useNavigate();
  const [idSala, setIDSala] = useState("");
  const [estado, setEstado] = useState<EstadoVerificacion>("inicial");
  const [errorTexto, setErrorTexto] = useState<string | null>(null);
  const [salaEncontrada, setSalaEncontrada] = useState<{ id: string; nombre: string } | null>(null);

  async function unirse() {
    const id = idSala.trim();

    if (!id) {
      setErrorTexto("Escribe el ID de la sala.");
      setEstado("error");
      setSalaEncontrada(null);
      return;
    }

    setEstado("cargando");
    setErrorTexto(null);
    setSalaEncontrada(null);

    try {
      const sala = await obtenerSala(id);

      if (!sala) {
        setErrorTexto("No encontramos una sala con ese ID. Revisa que esté completo.");
        setEstado("error");
        return;
      }

      setSalaEncontrada({ id: sala.id, nombre: sala.nombre });
      setEstado("exito");
    } catch {
      setErrorTexto("No encontramos una sala con ese ID. Revisa que esté completo.");
      setEstado("error");
    }
  }

  function entrarASala() {
    if (salaEncontrada) {
      navegar(`/salas/${encodeURIComponent(salaEncontrada.id)}`);
    }
  }

  const cargando = estado === "cargando";
  const errorActivo = estado === "error";
  const exito = estado === "exito";

  return (
    <section className="min-h-screen bg-surface-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-surface-200 max-w-lg w-full">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary-tint flex items-center justify-center mb-4">
              <Hash className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-ink mb-2">Unirme a una sala</h1>
            <p className="text-text-muted">
              Ingresa el ID que compartió contigo el anfitrión.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <p className="mb-2 font-semibold text-ink">Escribe el ID de la sala</p>
              <p className="text-xs text-text-muted">
                El ID combina letras y números. Puedes probar con AS-4821.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink">ID de la sala</label>
              <Campo
                id="id-sala"
                etiqueta="ID de la sala"
                etiquetaOculta
                placeholder="AS-4821"
                value={idSala}
                onChange={(e) => setIDSala(e.target.value)}
                error={errorActivo ? errorTexto : undefined}
                autoComplete="off"
              />
            </div>

            <div className="space-y-3">
              {exito && (
                <div className="rounded-lg border border-success bg-success-bg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-success mt-0.5 shrink-0">✓</span>
                    <div>
                      <p className="font-bold text-success-text">ID verificado correctamente</p>
                      <p className="text-xs text-success-text mt-1">
                        Sala encontrada: {salaEncontrada?.nombre}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Boton
                type="button"
                cargando={cargando}
                textoCargando="Buscando sala..."
                disabled={cargando}
                ancho
                onClick={exito ? entrarASala : unirse}
              >
                {cargando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                    Buscando sala...
                  </>
                ) : exito ? (
                  <>
                    <ChevronRight className="h-4 w-4 mr-2" aria-hidden="true" />
                    Entrar a la sala
                  </>
                ) : (
                  "Unirme"
                )}
              </Boton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}