import { AVATARES, inicialesDe } from "../lib/avatares";

type Props = {
  /** Identificador guardado en el perfil (avatar-1…5, «iniciales» o una foto de Google). */
  avatar: string | null;
  nombres: string;
  apellidos?: string;
  /** Tamaño en píxeles. */
  tamano?: number;
};

// Avatar redondo: ícono, foto (Google) o iniciales. Es decorativo; el nombre de la persona va en texto aparte.
export default function Avatar({ avatar, nombres, apellidos = "", tamano = 40 }: Props) {
  const medida = { width: tamano, height: tamano };
  const opcion = AVATARES.find((a) => a.id === avatar);

  if (avatar && /^https?:\/\//.test(avatar)) {
    return <img src={avatar} alt="" referrerPolicy="no-referrer" style={medida} className="rounded-full object-cover" />;
  }
  if (opcion) {
    const { Icono, estilo } = opcion;
    return (
      <span aria-hidden="true" style={medida} className={`flex shrink-0 items-center justify-center rounded-full ${estilo}`}>
        <Icono style={{ width: tamano * 0.55, height: tamano * 0.55 }} />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{ ...medida, fontSize: tamano * 0.4 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-primary-tint font-heading font-bold text-primary-active"
    >
      {inicialesDe(nombres, apellidos)}
    </span>
  );
}
