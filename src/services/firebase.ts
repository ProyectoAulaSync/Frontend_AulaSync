import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Configuración pública de la app web de Firebase (no son secretos: identifican el proyecto).
// Firebase Auth solo se usa para iniciar sesión y obtener el token; los datos pasan siempre por la API.
const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const firebaseAuth = getAuth(app);
