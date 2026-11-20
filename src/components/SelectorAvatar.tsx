import { AVATARES, AVATAR_INICIALES } from "../lib/avatares";
import Avatar from "./Avatar";

type Props = {
  valor: string;
  onCambio: (id: string) => void;
  nombres: string;
  apellidos: string;
};

// Elegir avatar (opcional): grupo de opciones con flechas del teclado. Sin elección se usan las iniciales.
export default function SelectorAvatar({ valor, onCambio, nombres, apellidos }: Props) {
  const opciones = [
    { id: AVATAR_INICIALES, nombre: "Mis iniciales" },
    ...AVATARES.map(({ id, nombre }) => ({ id, nombre })),
  ];

  return (
    <fieldset>
      <legend className="mb-1 block text-sm font-medium">Elige un avatar (opcional)</legend>
      <div className="flex flex-wrap gap-3">
        {opciones.map(({ id, nombre }) => (
          <label key={id} className="cursor-pointer">
            <input
              type="radio"
              name="avatar"
              value={id}
              checked={valor === id}
              onChange={() => onCambio(id)}
              className="peer sr-only"
            />
            <span className="flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 border-transparent p-0.5 peer-checked:border-primary peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
              <Avatar avatar={id} nombres={nombres} apellidos={apellidos} tamano={40} />
              <span className="sr-only">{nombre}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
