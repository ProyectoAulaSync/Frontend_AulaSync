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

export async function actualizarSala(id: string, nombre: string, signal?: AbortSignal): Promise<SalaBase> {
  const sala = await peticion<SalaApi>(`/api/rooms/${encodeURIComponent(id)}`, {
    metodo: "PATCH",
    cuerpo: { nombre },
    conSesion: true,
    signal,
  });
  return mapearSala(sala);
}

export async function eliminarSala(id: string, signal?: AbortSignal): Promise<void> {
  await peticion<void>(`/api/rooms/${encodeURIComponent(id)}`, {
    metodo: "DELETE",
    conSesion: true,
    signal,
  });
}

/** Adaptador de compatibilidad para el Panel; GET /rooms solo devuelve salas propias. */
export async function listarSalas(signal?: AbortSignal): Promise<Sala[]> {
  const salas = await listarMisSalas(signal);
  return salas.map((sala) => ({ ...sala, rol: "Anfitrión" }));
}

export type MiembroSala = {
  roomId: string;
  uid: string;
  joinedAt: unknown;
  silenciado: boolean;
};

export async function unirASala(roomId: string, signal?: AbortSignal): Promise<{ roomId: string; uid: string }> {
  return peticion<{ roomId: string; uid: string }>(
    `/api/rooms/${encodeURIComponent(roomId)}/join`,
    { metodo: "POST", conSesion: true, signal },
  );
}

export async function listarMiembros(roomId: string, signal?: AbortSignal): Promise<MiembroSala[]> {
  return peticion<MiembroSala[]>(
    `/api/rooms/${encodeURIComponent(roomId)}/members`,
    { conSesion: true, signal },
  );
}

export async function sacarMiembro(roomId: string, uid: string, signal?: AbortSignal): Promise<void> {
  await peticion<void>(
    `/api/rooms/${encodeURIComponent(roomId)}/members/${encodeURIComponent(uid)}`,
    { metodo: "DELETE", conSesion: true, signal },
  );
}

export async function toggleSilenciarMiembro(roomId: string, uid: string, silenciado: boolean, signal?: AbortSignal): Promise<MiembroSala> {
  return peticion<MiembroSala>(
    `/api/rooms/${encodeURIComponent(roomId)}/members/${encodeURIComponent(uid)}/silenciar`,
    { metodo: "PATCH", cuerpo: { silenciado }, conSesion: true, signal },
  );
}
