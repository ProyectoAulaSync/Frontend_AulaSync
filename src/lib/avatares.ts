import { Atom, GraduationCap, Lightbulb, Rocket, Sprout, type LucideIcon } from "lucide-react";

// El backend guarda el avatar como texto (máx. 60). Guardamos el identificador de uno de estos avatares.
export type OpcionAvatar = { id: string; nombre: string; Icono: LucideIcon; estilo: string };

export const AVATARES: OpcionAvatar[] = [
  { id: "avatar-1", nombre: "Átomo", Icono: Atom, estilo: "bg-primary-tint text-primary" },
  { id: "avatar-2", nombre: "Birrete", Icono: GraduationCap, estilo: "bg-primary text-white" },
  { id: "avatar-3", nombre: "Idea", Icono: Lightbulb, estilo: "bg-warning-bg text-warning" },
  { id: "avatar-4", nombre: "Cohete", Icono: Rocket, estilo: "bg-error-bg text-error" },
  { id: "avatar-5", nombre: "Brote", Icono: Sprout, estilo: "bg-success-bg text-success" },
];

/** Sin avatar elegido se asigna este: muestra las iniciales de la persona. */
export const AVATAR_INICIALES = "iniciales";

export function inicialesDe(nombres: string, apellidos = ""): string {
  const a = nombres.trim().charAt(0);
  const b = apellidos.trim().charAt(0);
  return (a + b).toUpperCase() || "?";
}
