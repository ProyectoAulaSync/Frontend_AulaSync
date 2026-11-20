import type { Sala } from "../types/sala";

export function esAnfitrion(sala: Sala, uid: string): boolean {
  return sala.anfitrionId === uid;
}
