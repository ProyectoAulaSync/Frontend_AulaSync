# AulaSync · Frontend (Salón de Estudio Colaborativo)

React + TypeScript + Vite + Tailwind CSS. Consume la API (`backend-api`); **nunca** consulta Firestore directamente.

## Requisitos

- Node.js 20+ y npm
- Docker y Docker Compose (opcional)

## Variables de entorno

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API (local `http://localhost:3001`, producción la URL de Render) |
| `VITE_FIREBASE_API_KEY` | Configuración de la app web de Firebase (Consola > Configuración del proyecto > Tus apps) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Ídem |
| `VITE_FIREBASE_PROJECT_ID` | Ídem |
| `VITE_FIREBASE_APP_ID` | Ídem |

El archivo `.env` está en `.gitignore`. No subas credenciales al repositorio.

### Autenticación (Sprint 1)

Firebase Auth se usa **solo en el navegador** para iniciar sesión (correo y Google) y obtener el token; el resto pasa por la API con `Authorization: Bearer <token>`.
Para que el ingreso con Google funcione, en la Consola de Firebase hay que habilitar el proveedor **Google** y agregar el dominio (`localhost` y el de Vercel) en *Authentication > Settings > Authorized domains*.

| Acción | Cómo |
|---|---|
| Registro manual | `POST /api/auth/register` y luego inicio de sesión con Firebase |
| Iniciar sesión (correo) | Firebase `signInWithEmailAndPassword` + `GET /api/users/me` |
| Iniciar sesión / registrarse con Google | Firebase `signInWithPopup` + `POST /api/auth/google`; si `profileComplete` es `false`, se obliga a elegir usuario |
| Elegir nombre de usuario | `GET /api/users/username-available` (en vivo) + `PUT /api/auth/username` |
| Cerrar sesión | Firebase `signOut`; lleva al inicio |

## Ejecutar en desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
```

Otros comandos: `npm run typecheck`, `npm run lint`, `npm run build`, `npm run preview`.

## Ejecutar con Docker

Solo el frontend:

```bash
docker build --build-arg VITE_API_URL=http://localhost:3001 -t aulasync-frontend .
docker run --rm -p 3000:80 aulasync-frontend
```

Todo el sistema (frontend + backend-api + backend-realtime). Requiere `backend_AulaSync` como carpeta hermana y su `backend-api/.env` con las credenciales de Firebase:

```bash
docker compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001 (Swagger en `/api-docs`) |
| Realtime | http://localhost:3002/health |

## Rutas

`/` inicio · `/ayuda` · `/accesibilidad` · `/base-tecnica` (prueba extremo a extremo: muestra el dato de Firestore con estados cargando, error con «Reintentar» y éxito) · cualquier otra ruta muestra la página 404.

- **Solo sin sesión** (con sesión llevan al Panel): `/ingreso`, `/registro`.
- **Con sesión, perfil incompleto** (Google sin usuario): `/registro/usuario`.
- **Privadas** (sin sesión llevan a `/ingreso` con «Inicia sesión para continuar.»): `/panel`, `/perfil`, `/salas/nueva`, `/salas/:id`.

## Despliegue en Vercel

1. Importa el repositorio, framework **Vite**.
2. Define `VITE_API_URL` con la URL de la API en Render.
3. [vercel.json](vercel.json) incluye el rewrite para recargar rutas como `/panel`.
4. La API debe permitir CORS desde el dominio de Vercel.

## Estructura

```
src/
├─ components/   Reutilizables: Boton, Campo, CampoContrasena, Mensaje, Estado{Vacio,Error}, Cargando*,
│                Avatar, SelectorAvatar, TarjetaFormulario, BotonGoogle · Layout, RutaPrivada, RutaPublica
├─ context/      Sesión global (AuthProvider)
├─ hooks/        useAuth, usePageTitle, useSalas, useDisponibilidadUsuario
├─ lib/          validaciones (reglas y mensajes de la guía), avatares
├─ pages/        Inicio, Login, Registro, ElegirUsuario, Panel, BaseTecnica, NotFound, ErrorPage, PaginaPendiente
├─ services/     api.ts (única capa que habla con la API), auth.ts (Firebase), firebase.ts, salas.ts (provisional)
└─ index.css     tokens de la guía visual
```
