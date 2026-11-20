import { peticion } from "./api";
import type { Sala as SalaBase } from "../types/sala";

type TimestampApi = { _seconds: number; _nanoseconds: number };
type SalaApi = {
  id: string;
  nombre: string;
  "anfitriónId": string;
  createdAt: TimestampApi;
  updatedAt: TimestampApi;
};

export type RolEnSala = "Anfitrión" | "Participante";
export type Sala = SalaBase & { rol: RolEnSala };

function mapearSala(sala: SalaApi): SalaBase {
  return {
    id: sala.id,
    nombre: sala.nombre,
    anfitrionId: sala["anfitriónId"],
  };
}

export async function listarMisSalas(signal?: AbortSignal): Promise<SalaBase[]> {
  const salas = await peticion<SalaApi[]>("/api/rooms", { conSesion: true, signal });
  return salas.map(mapearSala);
}

export async function crearSala(nombre: string, signal?: AbortSignal): Promise<SalaBase> {
  const sala = await peticion<SalaApi>("/api/rooms", {
    metodo: "POST",
    cuerpo: { nombre },
    conSesion: true,
    signal,
  });
  return mapearSala(sala);
}

export async function obtenerSala(id: string, signal?: AbortSignal): Promise<SalaBase> {
  const sala = await peticion<SalaApi>(`/api/rooms/${encodeURIComponent(id)}`, { conSesion: true, signal });
  return mapearSala(sala);
}

/** Adaptador de compatibilidad para el Panel; GET /rooms solo devuelve salas propias. */
export async function listarSalas(signal?: AbortSignal): Promise<Sala[]> {
  const salas = await listarMisSalas(signal);
  return salas.map((sala) => ({ ...sala, rol: "Anfitrión" }));
}
