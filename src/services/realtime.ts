import { io, type Socket } from "socket.io-client";
import { firebaseAuth } from "./firebase";

let socket: Socket | null = null;
let avisoUrlFaltanteMostrado = false;

export function conectar(): void {
  const url = import.meta.env.VITE_REALTIME_URL?.trim();
  if (!url) {
    if (import.meta.env.DEV && !avisoUrlFaltanteMostrado) {
      console.warn("[Tiempo real] VITE_REALTIME_URL no está definida; el cliente no se conectará.");
      avisoUrlFaltanteMostrado = true;
    }
    return;
  }

  if (socket) {
    if (!socket.connected && !socket.active) socket.connect();
    return;
  }

  socket = io(url, {
    auth: (callback) => {
      const usuario = firebaseAuth.currentUser;
      if (!usuario) {
        callback({ token: "" });
        return;
      }

      void usuario.getIdToken().then(
        (token) => callback({ token }),
        () => callback({ token: "" }),
      );
    },
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
}

export function desconectar(): void {
  socket?.disconnect();
}
